// Route creator: search for bars, put them in order, see the walking path, and save.

// Bar search uses Photon, a free search service built on OpenStreetMap data (no account needed).
const SEARCH_URL = "https://photon.komoot.io/api/";
// Which kinds of places count as "bars". Many Brazilian botecos are tagged as restaurants.
const PLACE_TYPES = ["amenity:bar", "amenity:pub", "amenity:biergarten", "amenity:restaurant", "craft:brewery"];
const TYPE_NAMES = {
  bar: { pt: "Bar", en: "Bar" },
  pub: { pt: "Pub", en: "Pub" },
  biergarten: { pt: "Cervejaria ao ar livre", en: "Beer garden" },
  restaurant: { pt: "Bar / restaurante", en: "Bar / restaurant" },
  brewery: { pt: "Cervejaria", en: "Brewery" }
};

// ---------- What we're editing ----------
const params = new URLSearchParams(location.search);
const editing = params.get("edit") ? getRoute(params.get("edit")) : null;

const state = {
  id: editing && isMine(editing) ? editing.id : "my-" + Date.now().toString(36),
  isEdit: Boolean(editing && isMine(editing)),
  bars: editing && isMine(editing) ? editing.stops.map(getBar).filter(Boolean) : [],
  path: editing && isMine(editing) ? editing.path : null,
  results: []
};

// ---------- Map ----------
const map = makeMap("map");
const pathColor = cssColor("--path", "#c7781a");
const stopLayer = L.layerGroup().addTo(map);
const resultLayer = L.layerGroup().addTo(map);
let pathLine = null;

if (state.bars.length) {
  map.fitBounds(L.latLngBounds(state.bars.map((b) => [b.lat, b.lng])), { padding: [40, 40], maxZoom: 16 });
} else {
  map.setView([-23.5565, -46.69], 15); // Vila Madalena, São Paulo
}

// ---------- Search ----------
const searchInput = document.getElementById("search");
const searchStatus = document.getElementById("search-status");
let searchTimer = null;
let searchCount = 0; // lets us ignore answers to old searches that arrive late

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(runSearch, 400); // wait until the person stops typing
});

async function runSearch() {
  const query = searchInput.value.trim();
  const mySearch = ++searchCount;
  if (query.length < 2) {
    state.results = [];
    searchStatus.textContent = "";
    renderResults();
    return;
  }

  searchStatus.textContent = t("searching");
  const b = map.getBounds().pad(0.2);
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");
  url.searchParams.set("bbox", [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n) => n.toFixed(5)).join(","));
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

function typeName(type) {
  return TYPE_NAMES[type] ? TYPE_NAMES[type][lang] : "";
}

function renderResults() {
  const list = document.getElementById("results");
  list.innerHTML = "";
  resultLayer.clearLayers();

  state.results.forEach((bar) => {
    const added = isAdded(bar);
    const li = document.createElement("li");
    li.className = "result";
    li.innerHTML = `
      <div>
        <p class="result-name"></p>
        <p class="result-meta"></p>
      </div>
      <button type="button" class="button-small"></button>`;
    li.querySelector(".result-name").textContent = bar.name;
    li.querySelector(".result-meta").textContent = [typeName(bar.type), bar.address, bar.district !== bar.address ? bar.district : ""].filter(Boolean).join(" · ");
    const btn = li.querySelector("button");
    btn.textContent = added ? t("alreadyAdded") : "＋ " + t("add");
    btn.disabled = added;
    btn.addEventListener("click", () => addBar(bar));
    list.appendChild(li);

    // Show each result as a small dot on the map too; clicking it adds the bar.
    const dot = L.circleMarker([bar.lat, bar.lng], {
      radius: 7, weight: 2, color: "#fff", fillColor: added ? "#9a8c7c" : pathColor, fillOpacity: 0.9
    }).bindTooltip(bar.name);
    if (!added) dot.on("click", () => addBar(bar));
    dot.addTo(resultLayer);
  });
}

// ---------- Changing the list of stops ----------
function addBar(bar) {
  if (isAdded(bar)) return;
  state.bars.push(bar);
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
  document.getElementById("page-title").textContent = state.isEdit ? t("editTitle") : t("createTitle");
  document.title = state.isEdit ? t("editTitle") : t("createTitle");

  // Stats
  const sum = totals(state.path);
  const approx = state.path && state.path.estimated ? "≈ " : "";
  document.getElementById("stat-stops").textContent = state.bars.length;
  document.getElementById("stat-distance").textContent = state.path ? approx + formatDistance(sum.distance) : "–";
  document.getElementById("stat-walking").textContent = state.path ? approx + formatMinutes(sum.duration) : "–";

  // Stop list
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
    li.innerHTML = `
      <div class="stop stop-edit">
        <span class="stop-num">${i + 1}</span>
        <div>
          <p class="stop-name"></p>
          <p class="stop-address"></p>
        </div>
        <div class="stop-controls">
          <button type="button" class="icon-button" data-action="up">↑</button>
          <button type="button" class="icon-button" data-action="down">↓</button>
          <button type="button" class="icon-button" data-action="remove">✕</button>
        </div>
      </div>`;
    li.querySelector(".stop-name").textContent = bar.name;
    li.querySelector(".stop-address").textContent = bar.address;
    const [up, down, remove] = li.querySelectorAll(".icon-button");
    up.setAttribute("aria-label", `${t("moveUp")}: ${bar.name}`);
    down.setAttribute("aria-label", `${t("moveDown")}: ${bar.name}`);
    remove.setAttribute("aria-label", `${t("remove")}: ${bar.name}`);
    up.title = t("moveUp"); down.title = t("moveDown"); remove.title = t("remove");
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
      legItem.className = "leg" + (long ? " leg-long" : "");
      legItem.textContent = `${long ? "⚠️ " + t("longWalk") + " · " : "🚶 "}${approx}${formatMinutes(leg.duration)} ${t("walk")} · ${formatDistance(leg.distance)}`;
      list.appendChild(legItem);
    }
  });

  const many = document.getElementById("many-stops");
  many.hidden = state.bars.length <= MANY_STOPS;
  many.textContent = t("manyStops");

  // Map
  stopLayer.clearLayers();
  state.bars.forEach((bar, i) => {
    L.marker([bar.lat, bar.lng], { icon: numberedIcon(i + 1), title: bar.name })
      .bindPopup(`<strong>${i + 1}. ${escapeHtml(bar.name)}</strong><br>${escapeHtml(bar.address)}`)
      .addTo(stopLayer);
  });
  if (pathLine) pathLine.remove();
  pathLine = null;
  if (state.path) {
    pathLine = L.polyline(state.path.points, {
      color: pathColor, weight: 5, opacity: 0.85, dashArray: state.path.estimated ? "6 8" : null
    }).addTo(map);
  }
}

// ---------- Saving ----------
const nameInput = document.getElementById("route-name");
if (state.isEdit) nameInput.value = pick(editing.title);

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
    location.href = "route.html?id=" + encodeURIComponent(route.id);
  } else {
    status.textContent = t("saveFailed");
  }
});

// ---------- Start ----------
setupLangSwitch(() => { render(); renderResults(); });
render();
if (state.bars.length >= 2 && !state.path) stopsChanged();
