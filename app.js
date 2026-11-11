// The app's behaviour: draws the map, lists the stops, and switches language.

// ---------- Text in both languages ----------
const TEXT = {
  pt: {
    stops: "Paradas",
    distance: "Distância",
    walking: "A pé",
    walk: "de caminhada",
    directions: "Como chegar",
    footnote: "Beba com moderação, beba água entre as paradas e volte para casa de táxi ou app. Confira o horário de funcionamento antes de ir."
  },
  en: {
    stops: "Stops",
    distance: "Distance",
    walking: "Walking",
    walk: "walk",
    directions: "Directions",
    footnote: "Drink responsibly, have water between stops, and get a taxi or ride app home. Check opening hours before you go."
  }
};

// ---------- Remember the chosen language (if the browser allows it) ----------
function loadLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "pt" || saved === "en") return saved;
  } catch (e) { /* storage blocked: fall through */ }
  return navigator.language && navigator.language.startsWith("pt") ? "pt" : "en";
}
function saveLang(lang) {
  try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
}

// ---------- Formatting helpers ----------
function formatDistance(metres) {
  return metres >= 1000 ? (metres / 1000).toFixed(1).replace(".", lang === "pt" ? "," : ".") + " km" : Math.round(metres) + " m";
}
function formatMinutes(seconds) {
  return Math.max(1, Math.round(seconds / 60)) + " min";
}

// ---------- Set up ----------
let lang = loadLang();
const route = window.ROUTES[0];
const bars = route.stops.map((id) => window.BARS[id]);

const map = L.map("map", { scrollWheelZoom: true });
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// The walking path
const pathColor = getComputedStyle(document.documentElement).getPropertyValue("--path").trim() || "#c7781a";
const pathLine = L.polyline(route.path.points, { color: pathColor, weight: 5, opacity: 0.85 }).addTo(map);

// Numbered markers
const markers = bars.map((bar, i) =>
  L.marker([bar.lat, bar.lng], {
    title: bar.name,
    icon: L.divIcon({
      className: "",
      html: `<div class="marker-num">${i + 1}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    })
  }).addTo(map)
);

map.fitBounds(pathLine.getBounds(), { padding: [30, 30] });

// ---------- Draw the page text (re-run when the language changes) ----------
function directionsUrl(bar) {
  return `https://www.google.com/maps/search/?api=1&query=${bar.lat},${bar.lng}`;
}

function render() {
  const t = TEXT[lang];
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll(".lang-switch button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
  });
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t[el.dataset.i18n];
  });

  document.getElementById("route-city").textContent = route.city;
  document.getElementById("route-title").textContent = route.title[lang];
  document.getElementById("route-description").textContent = route.description[lang];

  const totalDistance = route.path.legs.reduce((sum, leg) => sum + leg.distance, 0);
  const totalDuration = route.path.legs.reduce((sum, leg) => sum + leg.duration, 0);
  document.getElementById("stat-stops").textContent = bars.length;
  document.getElementById("stat-distance").textContent = formatDistance(totalDistance);
  document.getElementById("stat-walking").textContent = formatMinutes(totalDuration);

  const list = document.getElementById("stops");
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
    item.querySelector(".stop-note").textContent = bar.note[lang];
    const link = item.querySelector(".stop-link");
    link.textContent = t.directions + " →";
    link.href = directionsUrl(bar);
    link.addEventListener("click", (e) => e.stopPropagation());
    list.appendChild(item);

    const leg = route.path.legs[i];
    if (leg) {
      const legItem = document.createElement("li");
      legItem.className = "leg";
      legItem.textContent = `🚶 ${formatMinutes(leg.duration)} ${t.walk} · ${formatDistance(leg.distance)}`;
      list.appendChild(legItem);
    }
  });

  markers.forEach((marker, i) => {
    marker.bindPopup(`<strong>${i + 1}. ${bars[i].name}</strong><br>${bars[i].address}`);
  });
}

// ---------- Clicking a stop zooms to it ----------
function focusStop(i) {
  document.querySelectorAll(".stop").forEach((el) => el.classList.toggle("is-active", Number(el.dataset.index) === i));
  map.flyTo([bars[i].lat, bars[i].lng], 17, { duration: 0.6 });
  markers[i].openPopup();
  if (window.innerWidth < 860) document.getElementById("map").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("stops").addEventListener("click", (e) => {
  const stop = e.target.closest(".stop");
  if (stop) focusStop(Number(stop.dataset.index));
});
document.getElementById("stops").addEventListener("keydown", (e) => {
  const stop = e.target.closest(".stop");
  if (stop && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); focusStop(Number(stop.dataset.index)); }
});
markers.forEach((marker, i) => marker.on("click", () => {
  document.querySelectorAll(".stop").forEach((el) => el.classList.toggle("is-active", Number(el.dataset.index) === i));
}));

// ---------- Language buttons ----------
document.querySelectorAll(".lang-switch button").forEach((b) => {
  b.addEventListener("click", () => { lang = b.dataset.lang; saveLang(lang); render(); });
});

render();
