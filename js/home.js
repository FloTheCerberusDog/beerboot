// Home page: lists the featured routes and the routes you created.

function routeCard(route, mine) {
  const bars = route.stops.map(getBar).filter(Boolean);
  const sum = totals(route.path);
  const approx = route.path && route.path.estimated ? "≈ " : "";

  const li = document.createElement("li");
  li.className = "card";
  li.innerHTML = `
    <a class="card-link" href="route.html?id=${encodeURIComponent(route.id)}">
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
    del.className = "button-text danger";
    del.textContent = t("delete");
    del.addEventListener("click", () => {
      if (confirm(t("confirmDelete", { name: pick(route.title) }))) {
        deleteRoute(route.id);
        render();
      }
    });
    li.appendChild(del);
  }
  return li;
}

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
