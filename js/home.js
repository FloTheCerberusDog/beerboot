// Home page: featured crawls (with a small map each) and the crawls you made.

function statChips(route, count) {
  const sum = totals(route.path);
  const approx = route.path && route.path.estimated ? "≈ " : "";
  return `
    <span class="chip">${icon("pin")}${count} ${t("bars")}</span>
    <span class="chip">${icon("walk")}${approx}${formatDistance(sum.distance)}</span>
    <span class="chip">${icon("clock")}${approx}${formatMinutes(sum.duration)} ${t("walking")}</span>`;
}

function stopLine(bars) {
  return bars.map((b) => `<b>${escapeHtml(b.name)}</b>`).join(" · ");
}

// ---------- Featured crawls: built once (maps are slow to rebuild), text refreshed on language change ----------
const featuredCards = window.ROUTES.map((route) => {
  const bars = route.stops.map(getBar).filter(Boolean);
  const li = document.createElement("li");
  li.className = "route-card";
  const mapId = "map-" + route.id;
  li.innerHTML = `
    <a class="cover" href="${routeUrl(route.id)}"><span hidden></span></a>
    <div class="mini-map" id="${mapId}"></div>
    <div class="body">
      <p class="eyebrow"></p>
      <h3></h3>
      <div class="chips"></div>
      <p class="stop-line"></p>
    </div>`;
  document.getElementById("featured").appendChild(li);

  const bb = createMap(mapId, { interactive: false });
  bb.setPath(route.path.points);
  bb.setStops(bars);
  bb.fit(route.path.points, { padding: 28 });

  return {
    render() {
      li.querySelector(".cover span").textContent = pick(route.title);
      li.querySelector(".eyebrow").textContent = route.area ? pick(route.area) : route.city;
      li.querySelector("h3").textContent = pick(route.title);
      li.querySelector(".chips").innerHTML = statChips(route, bars.length);
      li.querySelector(".stop-line").innerHTML = stopLine(bars);
    }
  };
});

// ---------- Your crawls ----------
function myCard(route) {
  const bars = route.stops.map(getBar).filter(Boolean);
  const crawl = getCrawl(route.id);
  const li = document.createElement("li");
  li.className = "route-card";
  li.innerHTML = `
    <a class="cover" href="${routeUrl(route.id)}"><span hidden></span></a>
    <div class="cap-row">${bars.map((_, i) => capSvg(i + 1, crawl && i < crawl.index ? "done" : "")).join("")}</div>
    <div class="body">
      <p class="eyebrow"></p>
      <h3></h3>
      <div class="chips">${statChips(route, bars.length)}</div>
      <p class="stop-line">${stopLine(bars)}</p>
    </div>
    <div class="card-tools">
      <a class="link" href="${crawl && !crawl.finished ? crawlUrl(route.id) : routeUrl(route.id)}"></a>
      <a class="link" href="${editUrl(route.id)}">${escapeHtml(t("edit"))}</a>
      <button type="button" class="link link-danger" data-delete>${escapeHtml(t("delete"))}</button>
    </div>
    <div class="confirm-box" hidden>
      <p></p>
      <div><button type="button" class="btn btn-small btn-danger" data-yes></button><button type="button" class="btn btn-small btn-ghost" data-no></button></div>
    </div>`;
  li.querySelector(".cover span").textContent = pick(route.title);
  li.querySelector(".eyebrow").textContent = t("yourRoute");
  li.querySelector("h3").textContent = pick(route.title);
  li.querySelector(".card-tools .link").textContent = crawl && !crawl.finished
    ? t("resumeCrawl", { n: Math.min(crawl.index + 1, bars.length), total: bars.length })
    : t("startCrawl");

  // Delete asks inside the card (pop-up dialogs aren't allowed everywhere).
  const tools = li.querySelector(".card-tools"), ask = li.querySelector(".confirm-box");
  ask.querySelector("p").textContent = t("confirmDelete");
  ask.querySelector("[data-yes]").textContent = t("yesDelete");
  ask.querySelector("[data-no]").textContent = t("keep");
  li.querySelector("[data-delete]").addEventListener("click", () => { tools.hidden = true; ask.hidden = false; ask.querySelector("[data-no]").focus(); });
  ask.querySelector("[data-no]").addEventListener("click", () => { ask.hidden = true; tools.hidden = false; });
  ask.querySelector("[data-yes]").addEventListener("click", () => { deleteRoute(route.id); renderMine(); });
  return li;
}

function renderMine() {
  const list = document.getElementById("mine");
  list.innerHTML = "";
  const saved = loadSaved().routes;
  if (!saved.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.innerHTML = `<p></p><a class="btn btn-gold btn-small" href="create.html">${icon("plus")}<span></span></a>`;
    empty.querySelector("p").textContent = t("noRoutesYet");
    empty.querySelector("span").textContent = t("createCrawl");
    list.appendChild(empty);
    return;
  }
  saved.forEach((r) => list.appendChild(myCard(r)));
}

function render() {
  featuredCards.forEach((c) => c.render());
  renderMine();
}

document.getElementById("demo-notice").hidden = !DEMO;
setupHeader(render);
render();
