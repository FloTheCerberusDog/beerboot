// Crawl mode: follow a crawl bar by bar. crawl.html#<route id>
// Progress is saved in this browser, so closing the page and coming back resumes the crawl.
//   index   = the stop you're heading to or are at
//   arrived = true once you've tapped "I'm here" at that stop

const route = getRoute(idFromAddress("id"));
const bars = route ? route.stops.map(getBar).filter(Boolean) : [];
const legs = (route && route.path && route.path.legs) || [];
let crawl = route ? (getCrawl(route.id) || freshCrawl()) : null;
let bb = null;

function freshCrawl() {
  return { index: 0, arrived: false, startedAt: Date.now(), finished: false };
}
function save() { setCrawl(route.id, crawl); }

if (!route || bars.length < 2) {
  document.getElementById("crawl-live").hidden = true;
  document.querySelector(".crawl-foot").hidden = true;
  document.getElementById("not-found").hidden = false;
  document.getElementById("close-btn").href = "index.html";
  setupHeader(() => {});
} else {
  save();
  document.getElementById("close-btn").href = routeUrl(route.id);
  document.getElementById("back-btn").href = routeUrl(route.id);

  bb = createMap("map", { interactive: true });
  if (route.path) bb.setPath(route.path.points, { dashed: route.path.estimated });

  document.getElementById("main-btn").addEventListener("click", () => {
    if (!crawl.arrived) {
      crawl.arrived = true; // checked in
    } else if (crawl.index < bars.length - 1) {
      crawl.index += 1;
      crawl.arrived = false;
    } else {
      crawl.finished = true;
      crawl.finishedAt = Date.now();
    }
    save();
    render(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("home-btn").addEventListener("click", () => {
    const panel = document.getElementById("get-home");
    panel.hidden = !panel.hidden;
  });
  document.getElementById("again-btn").addEventListener("click", () => {
    crawl = freshCrawl();
    save();
    render(true);
  });

  setupHeader(() => render(false));
  render(true);
}

function rateButtons(bar) {
  const box = document.getElementById("rate-caps");
  const current = getRating(bar.id);
  box.innerHTML = "";
  for (let n = 1; n <= 5; n++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `${n} / 5`);
    btn.setAttribute("aria-pressed", String(n <= current));
    btn.innerHTML = capSvg("", n <= current ? "" : "off");
    btn.addEventListener("click", () => {
      setRating(bar.id, n);
      rateButtons(bar);
      box.children[n - 1].classList.add("pop");
    });
    box.appendChild(btn);
  }
  document.getElementById("rate-label").textContent = current ? t("rated", { n: current }) : t("rateIt");
}

function render(moveMap) {
  const finished = crawl.finished;
  document.getElementById("crawl-live").hidden = finished;
  document.getElementById("crawl-finish").hidden = !finished;
  document.getElementById("live-actions").hidden = finished;
  document.getElementById("finish-actions").hidden = !finished;
  document.title = pick(route.title) + " · BeerBoot";
  if (finished) {
    document.getElementById("nudge").hidden = true;
    document.getElementById("get-home").hidden = true;
    renderFinish();
    return;
  }

  const i = crawl.index, bar = bars[i], last = i === bars.length - 1;
  document.getElementById("crawl-step").textContent = t("stopOf", { n: i + 1, total: bars.length }) + " · " + pick(route.title);

  // Progress bar
  const progress = document.getElementById("progress");
  progress.style.gridTemplateColumns = `repeat(${bars.length}, 1fr)`;
  progress.innerHTML = bars.map((_, j) => `<i class="${j < i || (j === i && crawl.arrived) ? "done" : j === i ? "now" : ""}"></i>`).join("");

  // Map
  bb.setStops(bars, { states: bars.map((_, j) => (j < i || (j === i && crawl.arrived) ? "done" : "")) });
  bb.setActive(i);
  if (moveMap) bb.map.jumpTo({ center: [bar.lng, bar.lat], zoom: 15.8 });

  // The card for this stop
  document.getElementById("now-label").textContent = crawl.arrived ? t("youreAt") : t("headTo");
  document.getElementById("now-name").textContent = bar.name;
  document.getElementById("now-addr").textContent = bar.address;
  const walk = document.getElementById("now-walk");
  walk.hidden = crawl.arrived;
  walk.innerHTML = icon("walk") + "<span></span>";
  walk.querySelector("span").textContent = i === 0 ? t("firstStop") : legs[i - 1] ? t("fromLast", { time: formatMinutes(legs[i - 1].duration) }) : "";
  const directions = document.getElementById("now-directions");
  directions.hidden = crawl.arrived;
  directions.href = directionsUrl(bar);
  document.getElementById("rate").hidden = !crawl.arrived;
  if (crawl.arrived) rateButtons(bar);

  // What's next
  const next = document.getElementById("next");
  next.hidden = !crawl.arrived || last;
  if (crawl.arrived && !last) {
    document.getElementById("next-name").textContent = bars[i + 1].name;
    document.getElementById("next-directions").href = directionsUrl(bars[i + 1]);
    document.getElementById("next-directions").setAttribute("aria-label", `${t("directions")}: ${bars[i + 1].name}`);
    const leg = legs[i];
    document.getElementById("next-walk").innerHTML = leg ? `${icon("walk")}${formatMinutes(leg.duration)} ${t("walk")} · ${formatDistance(leg.distance)}` : "";
  }

  // Water reminder after each check-in
  const nudge = document.getElementById("nudge");
  nudge.hidden = !crawl.arrived;
  document.getElementById("nudge-text").textContent = last ? t("lastStop") : t(["water1", "water2", "water3"][i % 3]);

  const main = document.getElementById("main-btn");
  const label = !crawl.arrived ? t("imHere") : last ? t("finishCrawl") : t("nextBar");
  main.innerHTML = `${icon(!crawl.arrived ? "pin" : last ? "check" : "arrow")}<span></span>`;
  main.querySelector("span").textContent = label;
}

function renderFinish() {
  document.getElementById("crawl-step").textContent = pick(route.title);
  const sum = totals(route.path);
  document.getElementById("finish-caps").innerHTML = bars.map((_, j) => capSvg("✓", "done")).join("");
  document.querySelectorAll("#finish-caps .cap").forEach((c, j) => { c.style.animationDelay = j * 90 + "ms"; });
  document.getElementById("finish-lede").textContent = t("crawlDoneLede", { n: bars.length, km: formatDistance(sum.distance) });
  const took = crawl.finishedAt && crawl.startedAt ? (crawl.finishedAt - crawl.startedAt) / 1000 : 0;
  document.getElementById("finish-time").textContent = took > 60 ? t("timeTaken", { time: formatMinutes(took) }) : "";

  const list = document.getElementById("finish-ratings");
  list.innerHTML = "";
  bars.forEach((bar) => {
    const r = getRating(bar.id);
    const li = document.createElement("li");
    li.innerHTML = `<span></span>${r ? `<span class="stars" aria-label="${r} / 5">${[1, 2, 3, 4, 5].map((n) => capSvg("", n <= r ? "" : "off")).join("")}</span>` : `<span class="muted"></span>`}`;
    li.firstElementChild.textContent = bar.name;
    if (!r) li.lastElementChild.textContent = t("notRated");
    list.appendChild(li);
  });
}
