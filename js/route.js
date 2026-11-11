// Route page: one crawl on the map, its stats, the stops, and Start / Share.
// route.html#<route id> for featured and saved crawls; route.html#s=<data> for a shared link.

const shared = readSharedRoute();
const route = shared ? shared.route : getRoute(idFromAddress("id") || window.ROUTES[0].id);
const bars = shared ? shared.bars : route ? route.stops.map(getBar).filter(Boolean) : [];
const mine = route && !shared && isMine(route);
const bb = createMap("map");
let path = route && route.path;
let savedId = null; // set once a shared crawl has been saved

if (!route) {
  document.getElementById("route-content").hidden = true;
  document.getElementById("not-found").hidden = false;
  document.getElementById("share-btn").hidden = true;
  setupHeader(() => {});
} else {
  start();
}

function start() {
  bb.setStops(bars, { onClick: focusStop });
  if (path) {
    bb.setPath(path.points, { dashed: path.estimated });
    bb.fit(path.points, { padding: MAP_PADDING });
  } else {
    // A shared link carries only the bars: estimate first, then fetch the real walking path.
    path = estimateWalkingPath(bars);
    bb.setPath(path.points, { dashed: true });
    bb.fit(path.points, { padding: MAP_PADDING });
    fetchWalkingPath(bars).then((p) => { path = p; bb.setPath(p.points); render(); }).catch(() => {});
  }

  if (mine) {
    const edit = document.getElementById("edit-link");
    edit.href = editUrl(route.id);
    edit.hidden = false;
  }
  if (shared) document.getElementById("save-shared").hidden = false;

  document.getElementById("save-shared").addEventListener("click", () => {
    saveSharedCopy();
    toast(t("savedShared"));
  });
  document.getElementById("start-btn").addEventListener("click", (e) => {
    if (shared) { e.preventDefault(); location.href = crawlUrl(saveSharedCopy()); }
  });
  document.getElementById("share-btn").addEventListener("click", () => {
    const url = shared ? location.href
      : mine ? sharedRouteUrl(route, bars)
      : new URL(routeUrl(route.id), location.href).href;
    shareLink(url, pick(route.title));
  });

  const list = document.getElementById("stops");
  list.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const stop = e.target.closest(".tl-stop");
    if (stop) focusStop(Number(stop.dataset.index));
  });
  list.addEventListener("keydown", (e) => {
    const stop = e.target.closest(".tl-stop");
    if (stop && e.target === stop && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); focusStop(Number(stop.dataset.index)); }
  });

  setupHeader(render);
  render();
}

// Saves a shared crawl into "My crawls" (once) and returns its new id.
function saveSharedCopy() {
  if (savedId) return savedId;
  savedId = newRouteId();
  const copy = { id: savedId, title: route.title, city: "", stops: bars.map((b) => b.id), path, updatedAt: new Date().toISOString() };
  saveRoute(copy, bars);
  document.getElementById("save-shared").hidden = true;
  return savedId;
}

function focusStop(i) {
  document.querySelectorAll(".tl-stop").forEach((el) => el.classList.toggle("is-active", Number(el.dataset.index) === i));
  bb.setActive(i);
  bb.flyTo(bars[i].lat, bars[i].lng);
  if (window.innerWidth < 900) document.querySelector(".map-wrap").scrollIntoView({ behavior: "smooth" });
}

function render() {
  const approx = path && path.estimated ? "≈ " : "";
  document.title = pick(route.title) + " · BeerBoot";
  document.getElementById("route-eyebrow").textContent = shared ? t("sharedRoute") : mine ? t("yourRoute") : t("featuredCrawl") + (route.area ? " · " + pick(route.area) : "");
  document.getElementById("route-title").textContent = pick(route.title);
  const description = document.getElementById("route-description");
  description.textContent = pick(route.description);
  description.hidden = !route.description;

  const sum = totals(path);
  document.getElementById("stat-stops").textContent = bars.length;
  document.getElementById("stat-distance").textContent = approx + formatDistance(sum.distance);
  document.getElementById("stat-walking").textContent = approx + formatMinutes(sum.duration);

  const crawl = !shared && getCrawl(route.id);
  const startBtn = document.getElementById("start-btn");
  startBtn.href = crawlUrl(route.id);
  document.getElementById("start-label").textContent = crawl && !crawl.finished
    ? t("resumeCrawl", { n: Math.min(crawl.index + 1, bars.length), total: bars.length })
    : t("startCrawl");

  const list = document.getElementById("stops");
  list.innerHTML = "";
  bars.forEach((bar, i) => {
    const item = document.createElement("li");
    item.className = "tl-stop";
    item.tabIndex = 0;
    item.dataset.index = i;
    item.innerHTML = `
      ${capSvg(i + 1)}
      <div><p class="tl-name"></p><p class="tl-sub"></p><p class="tl-note"></p></div>
      <a class="round round-sm" target="_blank" rel="noopener">${icon("nav")}</a>`;
    item.querySelector(".tl-name").textContent = bar.name;
    item.querySelector(".tl-sub").textContent = bar.address;
    const note = item.querySelector(".tl-note");
    note.textContent = pick(bar.note);
    note.hidden = !bar.note;
    const link = item.querySelector("a");
    link.href = directionsUrl(bar);
    link.setAttribute("aria-label", `${t("directions")}: ${bar.name}`);
    link.title = t("directions");
    list.appendChild(item);

    const leg = path && path.legs[i];
    if (leg && i < bars.length - 1) {
      const legItem = document.createElement("li");
      const long = leg.duration > LONG_WALK_SECONDS;
      legItem.className = "tl-walk" + (long ? " long" : "");
      legItem.innerHTML = `${icon("walk")}<span></span>`;
      legItem.querySelector("span").textContent =
        `${long ? t("longWalk") + " · " : ""}${approx}${formatMinutes(leg.duration)} ${t("walk")} · ${formatDistance(leg.distance)}`;
      list.appendChild(legItem);
    }
  });
}
