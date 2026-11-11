// Route viewer: draws one route on the map and lists its stops.
// Which route comes from the address, e.g. route.html?id=vila-madalena-classic

const routeId = new URLSearchParams(location.search).get("id") || window.ROUTES[0].id;
const route = getRoute(routeId);
const map = makeMap("map");

if (!route) {
  document.getElementById("route-content").hidden = true;
  document.getElementById("not-found").hidden = false;
  map.setView([-23.5565, -46.69], 14);
  setupLangSwitch(() => {});
} else {
  showRoute(route);
}

function showRoute(route) {
  const bars = route.stops.map(getBar).filter(Boolean);
  const mine = isMine(route);
  const approx = route.path && route.path.estimated ? "≈ " : "";

  if (mine) {
    const edit = document.getElementById("edit-link");
    edit.href = "create.html?edit=" + encodeURIComponent(route.id);
    edit.hidden = false;
  }

  // The walking path (dashed if it's only an estimate)
  const pathLine = L.polyline(route.path.points, {
    color: cssColor("--path", "#c7781a"), weight: 5, opacity: 0.85, dashArray: route.path.estimated ? "6 8" : null
  }).addTo(map);

  // Numbered markers
  const markers = bars.map((bar, i) =>
    L.marker([bar.lat, bar.lng], { title: bar.name, icon: numberedIcon(i + 1) })
      .bindPopup(`<strong>${i + 1}. ${escapeHtml(bar.name)}</strong><br>${escapeHtml(bar.address)}`)
      .addTo(map)
  );

  map.fitBounds(pathLine.getBounds(), { padding: [30, 30] });

  function setActive(i) {
    document.querySelectorAll(".stop").forEach((el) => el.classList.toggle("is-active", Number(el.dataset.index) === i));
  }

  function focusStop(i) {
    setActive(i);
    map.flyTo([bars[i].lat, bars[i].lng], 17, { duration: 0.6 });
    markers[i].openPopup();
    if (window.innerWidth < 860) document.getElementById("map").scrollIntoView({ behavior: "smooth" });
  }

  markers.forEach((marker, i) => marker.on("click", () => setActive(i)));

  const list = document.getElementById("stops");
  list.addEventListener("click", (e) => {
    const stop = e.target.closest(".stop");
    if (stop) focusStop(Number(stop.dataset.index));
  });
  list.addEventListener("keydown", (e) => {
    const stop = e.target.closest(".stop");
    if (stop && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); focusStop(Number(stop.dataset.index)); }
  });

  // Page text (re-drawn when the language changes)
  function render() {
    document.title = pick(route.title);
    document.getElementById("route-city").textContent = mine ? t("yourRoute") : route.city;
    document.getElementById("route-title").textContent = pick(route.title);
    const description = document.getElementById("route-description");
    description.textContent = pick(route.description);
    description.hidden = !route.description;

    const sum = totals(route.path);
    document.getElementById("stat-stops").textContent = bars.length;
    document.getElementById("stat-distance").textContent = approx + formatDistance(sum.distance);
    document.getElementById("stat-walking").textContent = approx + formatMinutes(sum.duration);

    list.innerHTML = "";
    bars.forEach((bar, i) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <article class="stop" tabindex="0" data-index="${i}">
          <span class="stop-num">${i + 1}</span>
          <div>
            <p class="stop-name"></p>
            <p class="stop-address"></p>
            <p class="stop-note"></p>
            <a class="stop-link" target="_blank" rel="noopener"></a>
          </div>
        </article>`;
      item.querySelector(".stop-name").textContent = bar.name;
      item.querySelector(".stop-address").textContent = bar.address;
      const note = item.querySelector(".stop-note");
      note.textContent = pick(bar.note);
      note.hidden = !bar.note;
      const link = item.querySelector(".stop-link");
      link.textContent = t("directions") + " →";
      link.href = directionsUrl(bar);
      link.addEventListener("click", (e) => e.stopPropagation());
      list.appendChild(item);

      const leg = route.path.legs[i];
      if (leg && i < bars.length - 1) {
        const legItem = document.createElement("li");
        const long = leg.duration > LONG_WALK_SECONDS;
        legItem.className = "leg" + (long ? " leg-long" : "");
        legItem.textContent = `${long ? "⚠️ " + t("longWalk") + " · " : "🚶 "}${approx}${formatMinutes(leg.duration)} ${t("walk")} · ${formatDistance(leg.distance)}`;
        list.appendChild(legItem);
      }
    });
  }

  setupLangSwitch(render);
  render();
}
