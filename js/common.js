// Shared code used by every page: text in both languages, saving routes,
// formatting, the map, and walking directions.

// ---------- Text in both languages ----------
const TEXT = {
  pt: {
    // Home
    homeTitle: "Pub crawls em São Paulo",
    homeLede: "Rotas a pé por vários bares, com uma bebida em cada. Siga uma rota pronta ou crie a sua.",
    createRoute: "Criar uma rota",
    featured: "Rotas em destaque",
    myRoutes: "Minhas rotas",
    noRoutesYet: "Você ainda não criou nenhuma rota.",
    savedOnDevice: "Suas rotas ficam salvas só neste navegador, por enquanto.",
    delete: "Excluir",
    confirmDelete: "Excluir a rota \"{name}\"? Isso não pode ser desfeito.",
    // Route viewer
    allRoutes: "← Todas as rotas",
    yourRoute: "Sua rota",
    edit: "Editar",
    routeNotFound: "Não encontramos essa rota.",
    stops: "Paradas",
    distance: "Distância",
    walking: "A pé",
    walk: "de caminhada",
    directions: "Como chegar",
    footnote: "Beba com moderação, beba água entre as paradas e volte para casa de táxi ou app. Confira o horário de funcionamento antes de ir.",
    // Creator
    createTitle: "Criar uma rota",
    editTitle: "Editar rota",
    routeName: "Nome da rota",
    routeNamePlaceholder: "Ex.: Sexta na Vila Madalena",
    searchLabel: "Adicionar um bar",
    searchPlaceholder: "Busque pelo nome do bar…",
    searchHint: "A busca procura na área mostrada no mapa. Mova ou afaste o mapa para buscar em outro lugar.",
    searching: "Buscando…",
    noResults: "Nenhum bar encontrado aqui. Tente outro nome ou mova o mapa.",
    searchFailed: "A busca não funcionou. Verifique sua internet e tente de novo.",
    alreadyAdded: "Já está na rota",
    add: "Adicionar",
    emptyStops: "Busque um bar acima para começar. Uma boa rota tem de 3 a 6 paradas.",
    moveUp: "Subir",
    moveDown: "Descer",
    remove: "Remover",
    longWalk: "Caminhada longa",
    manyStops: "São muitas paradas! Lembre-se: uma bebida em cada bar.",
    estimate: "estimativa",
    save: "Salvar rota",
    saveNeedsName: "Dê um nome para a rota.",
    saveNeedsStops: "Adicione pelo menos 2 bares.",
    saveFailed: "Este navegador não deixou salvar. A rota será perdida ao fechar a página.",
    cancel: "Cancelar"
  },
  en: {
    homeTitle: "Pub crawls in São Paulo",
    homeLede: "Walking routes through several bars, one drink at each. Follow a ready-made route or create your own.",
    createRoute: "Create a route",
    featured: "Featured routes",
    myRoutes: "My routes",
    noRoutesYet: "You haven't created any routes yet.",
    savedOnDevice: "For now, your routes are saved only in this browser.",
    delete: "Delete",
    confirmDelete: "Delete the route \"{name}\"? This can't be undone.",
    allRoutes: "← All routes",
    yourRoute: "Your route",
    edit: "Edit",
    routeNotFound: "We couldn't find that route.",
    stops: "Stops",
    distance: "Distance",
    walking: "Walking",
    walk: "walk",
    directions: "Directions",
    footnote: "Drink responsibly, have water between stops, and get a taxi or ride app home. Check opening hours before you go.",
    createTitle: "Create a route",
    editTitle: "Edit route",
    routeName: "Route name",
    routeNamePlaceholder: "e.g. Friday in Vila Madalena",
    searchLabel: "Add a bar",
    searchPlaceholder: "Search by bar name…",
    searchHint: "Search looks in the area shown on the map. Move or zoom out the map to search somewhere else.",
    searching: "Searching…",
    noResults: "No bars found here. Try another name or move the map.",
    searchFailed: "Search didn't work. Check your internet connection and try again.",
    alreadyAdded: "Already on the route",
    add: "Add",
    emptyStops: "Search for a bar above to get started. A good route has 3 to 6 stops.",
    moveUp: "Move up",
    moveDown: "Move down",
    remove: "Remove",
    longWalk: "Long walk",
    manyStops: "That's a lot of stops! Remember: one drink per bar.",
    estimate: "estimate",
    save: "Save route",
    saveNeedsName: "Give the route a name.",
    saveNeedsStops: "Add at least 2 bars.",
    saveFailed: "This browser wouldn't let the page save. The route will be lost when you close the page.",
    cancel: "Cancel"
  }
};

// A walk longer than this (in seconds) between two bars gets a warning.
const LONG_WALK_SECONDS = 20 * 60;
// More stops than this gets a gentle warning.
const MANY_STOPS = 8;

// ---------- Language ----------
let lang = loadLang();

function loadLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "pt" || saved === "en") return saved;
  } catch (e) { /* storage blocked: fall through */ }
  return navigator.language && navigator.language.startsWith("pt") ? "pt" : "en";
}

function t(key, values) {
  let s = TEXT[lang][key];
  if (values) for (const k in values) s = s.replace("{" + k + "}", values[k]);
  return s;
}

// Built-in routes have text in both languages ({ en, pt }); routes people create have one string.
function pick(value) {
  if (value == null) return "";
  return typeof value === "string" ? value : (value[lang] || value.en || "");
}

// Sets up the PT/EN buttons. `onChange` redraws the page in the new language.
function setupLangSwitch(onChange) {
  const buttons = document.querySelectorAll(".lang-switch button");
  const sync = () => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  };
  buttons.forEach((b) => b.addEventListener("click", () => {
    lang = b.dataset.lang;
    try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
    sync();
    onChange();
  }));
  sync();
}

// ---------- Formatting ----------
function formatDistance(metres) {
  if (metres >= 1000) return (metres / 1000).toFixed(1).replace(".", lang === "pt" ? "," : ".") + " km";
  return Math.round(metres) + " m";
}
function formatMinutes(seconds) {
  return Math.max(1, Math.round(seconds / 60)) + " min";
}
function totals(path) {
  const legs = (path && path.legs) || [];
  return {
    distance: legs.reduce((sum, leg) => sum + leg.distance, 0),
    duration: legs.reduce((sum, leg) => sum + leg.duration, 0)
  };
}
// Makes text safe to put inside HTML (so a bar called "<b>" can't break the page).
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Saved routes (stored in this browser only, for now) ----------
const STORAGE_KEY = "pubcrawl.saved.v1";

function loadSaved() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && data.bars && Array.isArray(data.routes)) return data;
  } catch (e) { /* missing, broken or blocked */ }
  return { bars: {}, routes: [] };
}

// Returns true if it worked.
function writeSaved(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

// Saves (or replaces) a route, together with the bars it uses.
function saveRoute(route, bars) {
  const data = loadSaved();
  bars.forEach((bar) => { data.bars[bar.id] = bar; });
  const i = data.routes.findIndex((r) => r.id === route.id);
  if (i >= 0) data.routes[i] = route; else data.routes.unshift(route);
  return writeSaved(data);
}

function deleteRoute(id) {
  const data = loadSaved();
  data.routes = data.routes.filter((r) => r.id !== id);
  // Forget bars no route uses any more.
  const used = new Set(data.routes.flatMap((r) => r.stops));
  Object.keys(data.bars).forEach((barId) => { if (!used.has(barId)) delete data.bars[barId]; });
  return writeSaved(data);
}

function getBar(id) {
  return window.BARS[id] || loadSaved().bars[id] || null;
}

function getRoute(id) {
  return window.ROUTES.find((r) => r.id === id) || loadSaved().routes.find((r) => r.id === id) || null;
}

function isMine(route) {
  return !window.ROUTES.some((r) => r.id === route.id);
}

// ---------- Map ----------
function makeMap(elementId) {
  const map = L.map(elementId, { scrollWheelZoom: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}

function cssColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function numberedIcon(n) {
  return L.divIcon({
    className: "",
    html: `<div class="marker-num">${n}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

function directionsUrl(bar) {
  return `https://www.google.com/maps/search/?api=1&query=${bar.lat},${bar.lng}`;
}

// ---------- Walking directions ----------
// Asks OpenStreetMap's free routing service for a walking path through the bars, in order.
// Returns { legs: [{distance, duration}], points: [[lat, lng], ...], estimated: false }.
async function fetchWalkingPath(bars) {
  const coords = bars.map((b) => `${b.lng},${b.lat}`).join(";");
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coords}?overview=full&geometries=geojson&steps=false`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Routing failed: " + response.status);
  const data = await response.json();
  if (data.code !== "Ok" || !data.routes || !data.routes[0]) throw new Error("No walking route found");
  const r = data.routes[0];
  return {
    legs: r.legs.map((leg) => ({ distance: Math.round(leg.distance), duration: Math.round(leg.duration) })),
    points: r.geometry.coordinates.map(([lng, lat]) => [Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6]),
    estimated: false
  };
}

// If the routing service is down, guess: straight-line distance plus 25% for street corners, at 4.5 km/h.
function estimateWalkingPath(bars) {
  const legs = [];
  for (let i = 0; i < bars.length - 1; i++) {
    const metres = L.latLng(bars[i].lat, bars[i].lng).distanceTo(L.latLng(bars[i + 1].lat, bars[i + 1].lng)) * 1.25;
    legs.push({ distance: Math.round(metres), duration: Math.round(metres / 1.25) });
  }
  return { legs, points: bars.map((b) => [b.lat, b.lng]), estimated: true };
}
