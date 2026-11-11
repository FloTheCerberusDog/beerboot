// Creator: search for bars, put them in order (or let "Best order" do it), see the walking path, save.
// create.html#<route id> edits that crawl; create.html#near starts at your location.

// Bar search uses Photon, a free search service built on OpenStreetMap data (no account needed).
const SEARCH_URL = "https://photon.komoot.io/api/";
// Which kinds of places count as "bars". Many Brazilian botecos are tagged as restaurants.
const PLACE_TYPES = ["amenity:bar", "amenity:pub", "amenity:biergarten", "amenity:restaurant", "craft:brewery"];
const TYPE_KEYS = { bar: "typeBar", pub: "typePub", biergarten: "typeBeerGarden", restaurant: "typeRestaurant", brewery: "typeBrewery" };

// ---------- What we're editing ----------
const addressId = idFromAddress("edit");
const wantsNearMe = addressId === "near";
const editing = addressId && !wantsNearMe ? getRoute(addressId) : null;
const isEdit = Boolean(editing && isMine(editing));

const state = {
  id: isEdit ? editing.id : newRouteId(),
  bars: isEdit ? editing.stops.map(getBar).filter(Boolean) : [],
  path: isEdit ? editing.path : null,
  results: []
};

// ---------- Map ----------
const bb = createMap("map", { center: [-46.69, -23.5565], zoom: 14.5 }); // Vila Madalena, São Paulo
if (state.bars.length) bb.fit(state.bars.map((b) => [b.lat, b.lng]), { padding: MAP_PADDING });

// ---------- Search ----------
const searchInput = document.getElementById("search");
const searchStatus = document.getElementById("search-status");
let searchTimer = null;
let searchCount = 0; // lets us ignore answers to old searches that arrive late

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(runSearch, 400); // wait until the person stops typing
});
searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { clearTimeout(searchTimer); runSearch(); } });

async function runSearch() {
  const query = searchInput.value.trim();
  const mySearch = ++searchCount;
  if (query.length < 2) {
    state.results = [];
    searchStatus.textContent = "";
    renderResults();
    return;
  }
  if (DEMO) {
    state.results = searchDemoBars(query);
    searchStatus.textContent = state.results.length ? "" : t("noResults");
    renderResults();
    return;
  }

  searchStatus.textContent = t("searching");
  const b = bb.map.getBounds();
  const padLng = (b.getEast() - b.getWest()) * 0.2, padLat = (b.getNorth() - b.getSouth()) * 0.2;
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");
  url.searchParams.set("bbox", [b.getWest() - padLng, b.getSouth() - padLat, b.getEast() + padLng, b.getNorth() + padLat].map((n) => n.toFixed(5)).join(","));
  PLACE_TYPES.forEach((tag) => url.searchParams.append("osm_tag", tag));

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Search failed: " + response.status);
    const data = await response.json();
    if (mySearch !== searchCount) return; // a newer search started meanwhile
    state.results = (data.features || []).filter((f) => f.properties.name).map(toBar);
    searchStatus.textContent = state.results.length ? "" : t("noResults");
  } catch (e) {
    if (mySearch !== searchCount) return;
    state.results = [];
    searchStatus.textContent = t("searchFailed");
  }
  renderResults();
}

// Demo search: looks through the bundled bar list (demo/bars.js) instead of the internet.
// Ignores accents and capitals, so "sao" finds "São". Closest to the map's centre first.
function plain(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
function searchDemoBars(query) {
  const words = plain(query).split(/\s+/).filter(Boolean);
  const c = bb.map.getCenter();
  const centre = { lat: c.lat, lng: c.lng };
  return window.DEMO_BARS
    .filter((bar) => words.every((w) => plain(bar.name).includes(w)))
    .map((bar) => ({ ...bar, note: null, away: metresBetween(centre, bar) }))
    .sort((a, b) => a.away - b.away)
    .slice(0, 10);
}

// Turns a search result into the same shape as the bars in data/routes.js.
function toBar(feature) {
  const p = feature.properties;
  const [lng, lat] = feature.geometry.coordinates;
  const street = [p.street, p.housenumber].filter(Boolean).join(", ");
  return {
    id: `osm-${p.osm_type}${p.osm_id}`,
    name: p.name,
    address: street || p.district || p.city || "",
    district: p.district || "",
    city: p.city || "",
    type: p.osm_value,
    lat,
    lng,
    note: null
  };
}

function isAdded(bar) {
  return state.bars.some((b) => b.id === bar.id);
}

function renderResults() {
  const list = document.getElementById("results");
  list.innerHTML = "";
  state.results.forEach((bar) => {
    const added = isAdded(bar);
    const li = document.createElement("li");
    li.className = "result";
    li.innerHTML = `<div><p class="result-name"></p><p class="result-meta"></p></div><button type="button" class="btn btn-small"></button>`;
    li.querySelector(".result-name").textContent = bar.name;
    li.querySelector(".result-meta").textContent = [TYPE_KEYS[bar.type] ? t(TYPE_KEYS[bar.type]) : "", bar.address, bar.district !== bar.address ? bar.district : ""].filter(Boolean).join(" · ");
    const btn = li.querySelector("button");
    btn.className = "btn btn-small " + (added ? "btn-ghost" : "btn-green");
    btn.innerHTML = added ? `${icon("check", "icon-sm")}<span></span>` : `${icon("plus", "icon-sm")}<span></span>`;
    btn.querySelector("span").textContent = added ? t("alreadyAdded") : t("add");
    btn.disabled = added;
    btn.addEventListener("click", () => addBar(bar));
    list.appendChild(li);
  });
  bb.setDots(state.results, { added: isAdded, onClick: addBar });
}

// ---------- Changing the list of stops ----------
function addBar(bar) {
  if (isAdded(bar)) return;
  const { away, ...clean } = bar;
  state.bars.push(clean);
  stopsChanged();
}
function moveBar(i, step) {
  const j = i + step;
  if (j < 0 || j >= state.bars.length) return;
  [state.bars[i], state.bars[j]] = [state.bars[j], state.bars[i]];
  stopsChanged();
}
function removeBar(i) {
  state.bars.splice(i, 1);
  stopsChanged();
}

// ---------- Best order ----------
document.getElementById("best-order").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    const before = state.bars.map((b) => b.id).join();
    const ordered = await fetchBestOrder(state.bars);
    if (ordered.map((b) => b.id).join() === before) toast(t("bestOrderSame"));
    else { state.bars = ordered; stopsChanged(); toast(t("bestOrderDone")); }
  } catch (err) {
    toast(t("bestOrderFailed"));
  }
  btn.disabled = false;
});

// ---------- Where am I ----------
function locate() {
  if (!navigator.geolocation) { toast(t("locateFailed")); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => { bb.showMe(pos.coords.latitude, pos.coords.longitude); bb.flyTo(pos.coords.latitude, pos.coords.longitude, 15.5); },
    () => toast(t("locateFailed")),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}
document.getElementById("locate-btn").addEventListener("click", locate);

// ---------- Walking path ----------
let routeCount = 0;
let pendingPath = null; // the walking-path request in progress, so Save can wait for it

function stopsChanged() {
  document.getElementById("save-status").textContent = "";
  renderResults();
  if (state.bars.length < 2) {
    state.path = null;
    pendingPath = null;
    render();
    return;
  }
  // Show a rough estimate straight away, then replace it with the real walking path.
  state.path = estimateWalkingPath(state.bars);
  render();
  const myRoute = ++routeCount;
  const bars = state.bars.slice();
  pendingPath = fetchWalkingPath(bars)
    .catch(() => estimateWalkingPath(bars))
    .then((path) => {
      if (myRoute !== routeCount) return; // stops changed again meanwhile
      state.path = path;
      pendingPath = null;
      render();
    });
}

// ---------- Drawing ----------
function render() {
  const title = isEdit ? t("editTitle") : t("createTitle");
  document.getElementById("page-title").textContent = title;
  document.title = title + " · BeerBoot";
  if (DEMO) document.getElementById("search-hint").textContent = t("searchHintDemo", { count: window.DEMO_BARS.length });

  const sum = totals(state.path);
  const approx = state.path && state.path.estimated ? "≈ " : "";
  document.getElementById("stat-stops").textContent = state.bars.length;
  document.getElementById("stat-distance").textContent = state.path ? approx + formatDistance(sum.distance) : "–";
  document.getElementById("stat-walking").textContent = state.path ? approx + formatMinutes(sum.duration) : "–";
  document.getElementById("tools-row").hidden = state.bars.length < 3;

  const list = document.getElementById("stops");
  list.innerHTML = "";
  if (state.bars.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = t("emptyStops");
    list.appendChild(empty);
  }
  state.bars.forEach((bar, i) => {
    const li = document.createElement("li");
    li.className = "tl-stop stop-edit";
    li.innerHTML = `
      ${capSvg(i + 1)}
      <div><p class="tl-name"></p><p class="tl-sub"></p></div>
      <div class="stop-controls">
        <button type="button" class="round round-sm" data-action="up">${icon("up", "icon-sm")}</button>
        <button type="button" class="round round-sm" data-action="down">${icon("down", "icon-sm")}</button>
        <button type="button" class="round round-sm" data-action="remove">${icon("x", "icon-sm")}</button>
      </div>`;
    li.querySelector(".tl-name").textContent = bar.name;
    li.querySelector(".tl-sub").textContent = bar.address;
    const [up, down, remove] = li.querySelectorAll(".stop-controls button");
    [[up, "moveUp"], [down, "moveDown"], [remove, "remove"]].forEach(([b, key]) => {
      b.setAttribute("aria-label", `${t(key)}: ${bar.name}`);
      b.title = t(key);
    });
    up.disabled = i === 0;
    down.disabled = i === state.bars.length - 1;
    up.addEventListener("click", () => moveBar(i, -1));
    down.addEventListener("click", () => moveBar(i, 1));
    remove.addEventListener("click", () => removeBar(i));
    list.appendChild(li);

    const leg = state.path && state.path.legs[i];
    if (leg && i < state.bars.length - 1) {
      const legItem = document.createElement("li");
      const long = leg.duration > LONG_WALK_SECONDS;
      legItem.className = "tl-walk" + (long ? " long" : "");
      legItem.innerHTML = `${icon("walk")}<span></span>`;
      legItem.querySelector("span").textContent = `${long ? t("longWalk") + " · " : ""}${approx}${formatMinutes(leg.duration)} ${t("walk")} · ${formatDistance(leg.distance)}`;
      list.appendChild(legItem);
    }
  });

  document.getElementById("many-stops").hidden = state.bars.length <= MANY_STOPS;

  bb.setStops(state.bars);
  bb.setPath(state.path ? state.path.points : null, { dashed: Boolean(state.path && state.path.estimated) });
}

// ---------- Saving ----------
const nameInput = document.getElementById("route-name");
if (isEdit) nameInput.value = pick(editing.title);

document.getElementById("save").addEventListener("click", async () => {
  const status = document.getElementById("save-status");
  const title = nameInput.value.trim();
  if (!title) { status.textContent = t("saveNeedsName"); nameInput.focus(); return; }
  if (state.bars.length < 2) { status.textContent = t("saveNeedsStops"); searchInput.focus(); return; }

  if (pendingPath) await pendingPath; // wait for the real walking path if it's still loading

  const route = {
    id: state.id,
    title,
    city: state.bars[0].city || "",
    stops: state.bars.map((b) => b.id),
    path: state.path,
    updatedAt: new Date().toISOString()
  };
  if (saveRoute(route, state.bars)) {
    location.href = routeUrl(route.id);
  } else {
    status.textContent = t("saveFailed");
  }
});

// ---------- Start ----------
setupHeader(() => { render(); renderResults(); });
render();
if (state.bars.length >= 2 && !state.path) stopsChanged();
if (wantsNearMe) locate();
