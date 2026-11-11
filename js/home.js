// Home page: lists the featured routes and the routes you created.

function routeCard(route, mine) {
  const bars = route.stops.map(getBar).filter(Boolean);
  const sum = totals(route.path);
  const approx = route.path && route.path.estimated ? "≈ " : "";

  const li = document.createElement("li");
  li.className = "card";
  li.innerHTML = `
    <a class="card-link" href="${routeUrl(route.id)}">
      <p class="eyebrow"></p>
      <h3 class="card-title"></h3>
      <p class="card-meta"></p>
      <p class="card-stops"></p>
    </a>`;
  li.querySelector(".eyebrow").textContent = mine ? t("yourRoute") : (route.city || "");
  li.querySelector(".card-title").textContent = pick(route.title);
  li.querySelector(".card-meta").textContent =
    `${bars.length} ${t("stops").toLowerCase()} · ${approx}${formatDistance(sum.distance)} · ${approx}${formatMinutes(sum.duration)} ${t("walk")}`;
  li.querySelector(".card-stops").textContent = bars.map((b) => b.name).join(" → ");

  if (mine) {
    const del = document.createElement("button");
    del.type = "button";
    del.className = "button-text danger card-delete";
    del.textContent = t("delete");
    li.appendChild(del);

    // Asks inside the card instead of a pop-up (artifacts don't allow pop-ups).
    const ask = document.createElement("div");
    ask.className = "confirm";
    ask.hidden = true;
    ask.innerHTML = `<p></p><button type="button" class="button-small danger-fill"></button><button type="button" class="button-text"></button>`;
    ask.querySelector("p").textContent = t("confirmDelete");
    const [yes, no] = ask.querySelectorAll("button");
    yes.textContent = t("yesDelete");
    no.textContent = t("keep");
    li.appendChild(ask);

    del.addEventListener("click", () => { del.hidden = true; ask.hidden = false; no.focus(); });
    no.addEventListener("click", () => { ask.hidden = true; del.hidden = false; del.focus(); });
    yes.addEventListener("click", () => { deleteRoute(route.id); render(); });
  }
  return li;
}

document.getElementById("demo-notice").hidden = !DEMO;

function render() {
  const featured = document.getElementById("featured");
  featured.innerHTML = "";
  window.ROUTES.forEach((r) => featured.appendChild(routeCard(r, false)));

  const mine = document.getElementById("mine");
  mine.innerHTML = "";
  const saved = loadSaved().routes;
  if (saved.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = t("noRoutesYet");
    mine.appendChild(empty);
  } else {
    saved.forEach((r) => mine.appendChild(routeCard(r, true)));
  }
}

setupLangSwitch(render);
render();
