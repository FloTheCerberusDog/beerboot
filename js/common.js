// Shared code used by every page: text in both languages, theme, icons, saving,
// sharing, the map, and walking directions.

// Demo mode is switched on by demo/config.js, which only the artifact version loads.
// In demo mode the map uses bundled images, search uses a bundled bar list,
// and walking times are estimates, because artifacts can't contact outside services.
const DEMO = window.BEERBOOT_DEMO || null;

// ---------- Text in both languages ----------
const TEXT = {
  pt: {
    heroEyebrow: "São Paulo · A pé",
    heroLine1: "Uma cidade.",
    heroLine2: "Vários bares.",
    heroLine3: "Um chopp em cada.",
    heroLede: "Siga um roteiro de bares pronto ou monte o seu pelos melhores botecos da cidade.",
    createCrawl: "Criar um roteiro",
    nearMe: "Perto de mim",
    featured: "Roteiros em destaque",
    myRoutes: "Meus roteiros",
    noRoutesYet: "Você ainda não criou nenhum roteiro. Escolha os bares, a gente traça a caminhada.",
    savedOnDevice: "Seus roteiros ficam salvos neste navegador.",
    delete: "Excluir",
    confirmDelete: "Excluir este roteiro? Isso não pode ser desfeito.",
    yesDelete: "Sim, excluir",
    keep: "Manter",
    edit: "Editar",
    demoNotice: "Versão de demonstração: o mapa e a busca cobrem só a Vila Madalena e Pinheiros, e os tempos de caminhada dos novos roteiros são estimativas.",
    bars: "bares",
    walking: "a pé",
    walk: "de caminhada",
    theme: "Mudar entre claro e escuro",
    // Route
    allRoutes: "Todos os roteiros",
    share: "Compartilhar",
    featuredCrawl: "Roteiro em destaque",
    yourRoute: "Seu roteiro",
    sharedRoute: "Roteiro compartilhado",
    saveShared: "Salvar nos meus roteiros",
    savedShared: "Salvo nos seus roteiros",
    startCrawl: "Começar o roteiro",
    resumeCrawl: "Continuar (parada {n} de {total})",
    statBars: "Bares",
    statDistance: "Distância",
    statWalking: "A pé",
    directions: "Como chegar",
    longWalk: "Caminhada longa",
    routeNotFound: "Não encontramos esse roteiro. O link pode estar incompleto.",
    footnote: "Beba com moderação, tome água entre as paradas e volte de táxi ou app. Confira o horário dos bares antes de ir.",
    linkCopied: "Link copiado. Cole onde quiser.",
    copyFailed: "Não deu para copiar. Copie o endereço da página.",
    shareText: "Bora? Meu roteiro no BeerBoot: {name}",
    // Creator
    createTitle: "Criar um roteiro",
    editTitle: "Editar roteiro",
    routeName: "Nome do roteiro",
    routeNamePlaceholder: "Ex.: Sexta na Vila Madalena",
    searchLabel: "Adicionar um bar",
    searchPlaceholder: "Busque pelo nome do bar…",
    searchHint: "A busca procura na área do mapa. Mova ou afaste o mapa para buscar em outro lugar.",
    searchHintDemo: "Demonstração: busca entre {count} bares da Vila Madalena e Pinheiros.",
    searching: "Buscando…",
    noResults: "Nenhum bar encontrado aqui. Tente outro nome ou mova o mapa.",
    searchFailed: "A busca não funcionou. Verifique sua internet e tente de novo.",
    alreadyAdded: "No roteiro",
    add: "Adicionar",
    emptyStops: "Busque um bar acima para começar. Um bom roteiro tem de 3 a 6 paradas.",
    moveUp: "Subir",
    moveDown: "Descer",
    remove: "Remover",
    manyStops: "São muitas paradas! Lembre-se: uma bebida em cada bar.",
    save: "Salvar roteiro",
    saveNeedsName: "Dê um nome para o roteiro.",
    saveNeedsStops: "Adicione pelo menos 2 bares.",
    saveFailed: "Este navegador não deixou salvar. O roteiro será perdido ao fechar a página.",
    cancel: "Cancelar",
    bestOrder: "Melhor ordem",
    bestOrderDone: "Reorganizado para a menor caminhada.",
    bestOrderSame: "Essa já é a ordem mais curta.",
    bestOrderFailed: "Não deu para calcular agora. Tente de novo.",
    locate: "Mostrar onde estou",
    locateFailed: "Não conseguimos sua localização. Verifique se o site tem permissão.",
    // Crawl mode
    stopOf: "Parada {n} de {total}",
    headTo: "Próxima parada",
    youreAt: "Você está no",
    fromLast: "{time} a pé da última parada",
    firstStop: "Primeira parada do roteiro",
    imHere: "Cheguei",
    nextBar: "Próximo bar",
    finishCrawl: "Terminar",
    rateIt: "Que tal? Toque nas tampinhas.",
    rated: "Você deu {n} de 5",
    upNext: "Depois",
    lastStop: "Última parada. Capricha!",
    water1: "Pausa para água: um copo entre as paradas segura a noite.",
    water2: "Tá calor? Água agora, chopp depois.",
    water3: "Um copo de água e bora para o próximo.",
    getHome: "Voltar pra casa",
    getHomeText: "Volte com segurança. Abra um app de transporte:",
    leave: "Sair do roteiro",
    crawlDone: "Roteiro completo!",
    crawlDoneLede: "{n} bares, {km} a pé. Saúde!",
    yourRatings: "Suas notas",
    notRated: "Sem nota",
    backToRoute: "Voltar ao roteiro",
    doAgain: "Fazer de novo",
    timeTaken: "Tempo total: {time}",
    typeBar: "Bar", typePub: "Pub", typeBeerGarden: "Cervejaria ao ar livre", typeRestaurant: "Bar / restaurante", typeBrewery: "Cervejaria"
  },
  en: {
    heroEyebrow: "São Paulo · On foot",
    heroLine1: "One city.",
    heroLine2: "Many bars.",
    heroLine3: "One drink each.",
    heroLede: "Follow a crawl locals love, or plot your own through the city's best botecos.",
    createCrawl: "Create a crawl",
    nearMe: "Near me",
    featured: "Featured crawls",
    myRoutes: "My crawls",
    noRoutesYet: "You haven't made a crawl yet. Pick the bars and we'll plan the walk.",
    savedOnDevice: "Your crawls are saved in this browser.",
    delete: "Delete",
    confirmDelete: "Delete this crawl? This can't be undone.",
    yesDelete: "Yes, delete",
    keep: "Keep it",
    edit: "Edit",
    demoNotice: "Demo version: the map and search cover Vila Madalena and Pinheiros only, and walking times for new crawls are estimates.",
    bars: "bars",
    walking: "walking",
    walk: "walk",
    theme: "Switch between light and dark",
    allRoutes: "All crawls",
    share: "Share",
    featuredCrawl: "Featured crawl",
    yourRoute: "Your crawl",
    sharedRoute: "Shared crawl",
    saveShared: "Save to my crawls",
    savedShared: "Saved to your crawls",
    startCrawl: "Start crawl",
    resumeCrawl: "Resume (stop {n} of {total})",
    statBars: "Bars",
    statDistance: "Distance",
    statWalking: "Walking",
    directions: "Directions",
    longWalk: "Long walk",
    routeNotFound: "We couldn't find that crawl. The link may be incomplete.",
    footnote: "Drink responsibly, have water between stops, and get a taxi or ride app home. Check opening hours before you go.",
    linkCopied: "Link copied. Paste it anywhere.",
    copyFailed: "Couldn't copy. Copy the page address instead.",
    shareText: "Fancy it? My BeerBoot crawl: {name}",
    createTitle: "Create a crawl",
    editTitle: "Edit crawl",
    routeName: "Crawl name",
    routeNamePlaceholder: "e.g. Friday in Vila Madalena",
    searchLabel: "Add a bar",
    searchPlaceholder: "Search by bar name…",
    searchHint: "Search looks in the area shown on the map. Move or zoom out the map to search somewhere else.",
    searchHintDemo: "Demo: searches {count} bars in Vila Madalena and Pinheiros.",
    searching: "Searching…",
    noResults: "No bars found here. Try another name or move the map.",
    searchFailed: "Search didn't work. Check your internet connection and try again.",
    alreadyAdded: "Added",
    add: "Add",
    emptyStops: "Search for a bar above to get started. A good crawl has 3 to 6 stops.",
    moveUp: "Move up",
    moveDown: "Move down",
    remove: "Remove",
    manyStops: "That's a lot of stops! Remember: one drink per bar.",
    save: "Save crawl",
    saveNeedsName: "Give the crawl a name.",
    saveNeedsStops: "Add at least 2 bars.",
    saveFailed: "This browser wouldn't let the page save. The crawl will be lost when you close the page.",
    cancel: "Cancel",
    bestOrder: "Best order",
    bestOrderDone: "Reordered for the shortest walk.",
    bestOrderSame: "This is already the shortest order.",
    bestOrderFailed: "Couldn't work that out right now. Try again.",
    locate: "Show where I am",
    locateFailed: "We couldn't get your location. Check that this site is allowed to use it.",
    stopOf: "Stop {n} of {total}",
    headTo: "Head to",
    youreAt: "You're at",
    fromLast: "{time} walk from your last stop",
    firstStop: "First stop of the crawl",
    imHere: "I'm here",
    nextBar: "Next bar",
    finishCrawl: "Finish",
    rateIt: "How was it? Tap the caps.",
    rated: "You gave it {n} of 5",
    upNext: "Up next",
    lastStop: "Last stop. Make it a good one!",
    water1: "Water break: a glass between stops keeps the night going.",
    water2: "Hot out? Water now, beer after.",
    water3: "One glass of water, then on to the next.",
    getHome: "Get home",
    getHomeText: "Get home safely. Open a ride app:",
    leave: "Leave crawl",
    crawlDone: "Crawl complete!",
    crawlDoneLede: "{n} bars, {km} on foot. Cheers!",
    yourRatings: "Your ratings",
    notRated: "Not rated",
    backToRoute: "Back to the crawl",
    doAgain: "Do it again",
    timeTaken: "Total time: {time}",
    typeBar: "Bar", typePub: "Pub", typeBeerGarden: "Beer garden", typeRestaurant: "Bar / restaurant", typeBrewery: "Brewery"
  }
};

// A walk longer than this (in seconds) between two bars gets a warning.
const LONG_WALK_SECONDS = 20 * 60;
// More stops than this gets a gentle warning.
const MANY_STOPS = 8;

// ---------- Small helpers for saved settings ----------
function readStore(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}

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
  let s = TEXT[lang][key] ?? TEXT.en[key] ?? key;
  if (values) for (const k in values) s = s.replace("{" + k + "}", values[k]);
  return s;
}

// Built-in routes have text in both languages ({ en, pt }); routes people create have one string.
function pick(value) {
  if (value == null) return "";
  return typeof value === "string" ? value : (value[lang] || value.en || "");
}

// ---------- Theme (light / dark) ----------
// The <head> of each page applies a saved choice before anything draws, so there's no flash.
function currentTheme() {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("beerboot.theme", next); } catch (e) { /* ignore */ }
  window.dispatchEvent(new Event("beerboot:theme"));
}
if (window.matchMedia) {
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (!document.documentElement.dataset.theme) window.dispatchEvent(new Event("beerboot:theme"));
  });
}

// Sets up the header: PT/EN buttons, theme button, logo. `onChange` redraws the page's own text.
function setupHeader(onChange) {
  injectIcons();
  document.querySelectorAll("[data-logo]").forEach((el) => { el.innerHTML = logoSvg(); });
  const buttons = document.querySelectorAll(".lang-switch button");
  const sync = () => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nLabel)); el.title = t(el.dataset.i18nLabel); });
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) themeBtn.innerHTML = icon(currentTheme() === "dark" ? "sun" : "moon");
  };
  buttons.forEach((b) => b.addEventListener("click", () => {
    lang = b.dataset.lang;
    try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
    sync();
    onChange();
  }));
  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
  window.addEventListener("beerboot:theme", sync);
  sync();
}

// ---------- Icons, logo and bottle caps ----------
const ICONS = {
  walk: '<circle cx="13" cy="4" r="2"/><path d="M10 21l2-6 3 3v3M8.5 11.5L11 8l3 1.5 2 3.5 3 1M11 8l-1 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  share: '<path d="M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M12 3v12M7 8l5-5 5 5"/>',
  play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  nav: '<path d="M3 11l18-8-8 18-2-8z"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  car: '<path d="M5 15l1.6-4.8A2 2 0 0 1 8.5 9h7a2 2 0 0 1 1.9 1.2L19 15M4 15h16v4H4zM7 19v1.5M17 19v1.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
  check: '<path d="M5 12l5 5 9-11"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'
};

function injectIcons() {
  if (document.getElementById("bb-icons")) return;
  const sprite = Object.entries(ICONS).map(([name, body]) => `<symbol id="i-${name}" viewBox="0 0 24 24">${body}</symbol>`).join("");
  document.body.insertAdjacentHTML("afterbegin", `<svg id="bb-icons" width="0" height="0" style="position:absolute" aria-hidden="true">${sprite}</svg>`);
}

function icon(name, extraClass) {
  return `<svg class="icon${extraClass ? " " + extraClass : ""}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

// The BeerBoot logo: a boot-shaped beer glass with a foamy head.
function logoSvg() {
  return `<svg viewBox="0 0 32 32" aria-hidden="true">
    <path class="logo-glass" d="M9 9h10v10.5c0 1 .8 1.8 1.8 1.8h3.2a3.5 3.5 0 0 1 3.5 3.5v.7a3 3 0 0 1-3 3H11a2 2 0 0 1-2-2z" stroke-width="1.6" stroke-linejoin="round"/>
    <path class="logo-foam" d="M8 9.5c-.6-2.4 1.2-4.3 3.4-4 .7-1.7 3-2.3 4.4-1 1.6-.9 3.9.2 3.9 2.3 1.4.4 1.8 2.1.8 2.7z" stroke-width="1.6" stroke-linejoin="round"/>
    <path class="logo-shine" d="M12.5 13v6M15.5 13v6" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;
}

// A bottle cap with a crimped edge, used for map markers, numbers and ratings.
const CAP_POINTS = (() => {
  const teeth = 21, outer = 16, inner = 14, pts = [];
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 ? inner : outer, a = (Math.PI * i) / teeth;
    pts.push((17 + r * Math.cos(a)).toFixed(2) + "," + (17 + r * Math.sin(a)).toFixed(2));
  }
  return pts.join(" ");
})();
function capSvg(label, state) {
  const text = label === "" || label == null ? "" : `<text class="cap-text" x="17" y="21.5" text-anchor="middle">${label}</text>`;
  return `<svg viewBox="0 0 34 34" class="cap${state ? " " + state : ""}" aria-hidden="true">
    <polygon class="cap-body" points="${CAP_POINTS}"/><circle class="cap-ring" cx="17" cy="17" r="11"/>${text}</svg>`;
}

// ---------- Formatting ----------
function formatDistance(metres) {
  if (metres >= 1000) return (metres / 1000).toFixed(1).replace(".", lang === "pt" ? "," : ".") + " km";
  return Math.round(metres) + " m";
}
function formatMinutes(seconds) {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return mins + " min";
  return Math.floor(mins / 60) + " h " + String(mins % 60).padStart(2, "0") + " min";
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
// Straight-line distance in metres between two { lat, lng } points.
function metresBetween(a, b) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ---------- Saved routes (stored in this browser only, for now) ----------
// The key keeps its original name so routes saved before the rename still show up.
const STORAGE_KEY = "pubcrawl.saved.v1";

function loadSaved() {
  const data = readStore(STORAGE_KEY, null);
  if (data && data.bars && Array.isArray(data.routes)) return data;
  return { bars: {}, routes: [] };
}

// Saves (or replaces) a route, together with the bars it uses. Returns true if it worked.
function saveRoute(route, bars) {
  const data = loadSaved();
  bars.forEach((bar) => { data.bars[bar.id] = bar; });
  const i = data.routes.findIndex((r) => r.id === route.id);
  if (i >= 0) data.routes[i] = route; else data.routes.unshift(route);
  return writeStore(STORAGE_KEY, data);
}

function deleteRoute(id) {
  const data = loadSaved();
  data.routes = data.routes.filter((r) => r.id !== id);
  // Forget bars no route uses any more.
  const used = new Set(data.routes.flatMap((r) => r.stops));
  Object.keys(data.bars).forEach((barId) => { if (!used.has(barId)) delete data.bars[barId]; });
  clearCrawl(id);
  return writeStore(STORAGE_KEY, data);
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
function newRouteId() {
  return "my-" + Date.now().toString(36);
}

// ---------- Ratings and crawl progress ----------
const RATINGS_KEY = "beerboot.ratings.v1";
const CRAWLS_KEY = "beerboot.crawls.v1";
function getRating(barId) { return readStore(RATINGS_KEY, {})[barId] || 0; }
function setRating(barId, n) { const all = readStore(RATINGS_KEY, {}); all[barId] = n; writeStore(RATINGS_KEY, all); }
function getCrawl(routeId) { return readStore(CRAWLS_KEY, {})[routeId] || null; }
function setCrawl(routeId, crawl) { const all = readStore(CRAWLS_KEY, {}); all[routeId] = crawl; writeStore(CRAWLS_KEY, all); }
function clearCrawl(routeId) { const all = readStore(CRAWLS_KEY, {}); delete all[routeId]; writeStore(CRAWLS_KEY, all); }

// ---------- Links between pages ----------
// The route id goes after "#" (route.html#vila-madalena-classic). Older "?id=" links still work.
function routeUrl(id) { return "route.html#" + encodeURIComponent(id); }
function editUrl(id) { return "create.html#" + encodeURIComponent(id); }
function crawlUrl(id) { return "crawl.html#" + encodeURIComponent(id); }
function idFromAddress(paramName) {
  const fromHash = decodeURIComponent(location.hash.slice(1));
  return fromHash || new URLSearchParams(location.search).get(paramName) || "";
}
// Changing only the part after "#" doesn't reload a page, so these pages reload themselves.
if (/(route|crawl|create)\.html$/.test(location.pathname)) window.addEventListener("hashchange", () => location.reload());

// ---------- Sharing a route inside the link itself ----------
// route.html#s=<data> carries the name and bars, so friends can open it without accounts.
function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(text) {
  const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function sharedRouteUrl(route, bars) {
  const data = { v: 1, t: pick(route.title), b: bars.map((b) => [b.name, b.address || "", +b.lat.toFixed(6), +b.lng.toFixed(6), b.id]) };
  return new URL("route.html#s=" + toBase64Url(JSON.stringify(data)), location.href).href;
}
// Returns { route, bars } for a shared link, or null.
function readSharedRoute() {
  const hash = location.hash.slice(1);
  if (!hash.startsWith("s=")) return null;
  try {
    const data = JSON.parse(fromBase64Url(hash.slice(2)));
    if (!data || !Array.isArray(data.b) || data.b.length < 2) return null;
    const bars = data.b.slice(0, 20).map(([name, address, lat, lng, id], i) => ({
      id: typeof id === "string" && id ? id : "shared-" + i, name: String(name).slice(0, 120), address: String(address).slice(0, 160),
      lat: Number(lat), lng: Number(lng), note: null
    })).filter((b) => Number.isFinite(b.lat) && Number.isFinite(b.lng));
    if (bars.length < 2) return null;
    return { route: { id: "shared", title: String(data.t || "").slice(0, 80), stops: bars.map((b) => b.id), path: null, shared: true }, bars };
  } catch (e) {
    return null;
  }
}

// Opens the phone's share menu, or copies the link on computers.
async function shareLink(url, title) {
  if (navigator.share) {
    try { await navigator.share({ title, text: t("shareText", { name: title }), url }); return; }
    catch (e) { if (e && e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast(t("linkCopied")); }
  catch (e) { toast(t("copyFailed")); }
}

function directionsUrl(bar) {
  return `https://www.google.com/maps/dir/?api=1&destination=${bar.lat},${bar.lng}&travelmode=walking`;
}

// ---------- Map ----------
// Smooth vector maps from OpenFreeMap (free, OpenStreetMap data), recoloured to match BeerBoot.
function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
function mapStyle() {
  if (DEMO) {
    return {
      version: 8,
      // Full address of the bundled images, keeping the {z}/{x}/{y} placeholders as they are.
      sources: { osm: { type: "raster", tiles: [location.href.replace(/[#?].*$/, "").replace(/[^/]*$/, "") + DEMO.tiles], tileSize: 256, maxzoom: DEMO.maxNativeZoom, attribution: "© OpenStreetMap" } },
      layers: [{ id: "osm", type: "raster", source: "osm" }]
    };
  }
  return `https://tiles.openfreemap.org/styles/${currentTheme() === "dark" ? "dark" : "positron"}`;
}
function tintMap(map) {
  if (DEMO) return;
  const c = currentTheme() === "dark"
    ? { bg: "#0d1813", water: "#0f2629", park: "#11271c", building: null }
    : { bg: "#e6ece4", water: "#c2dbd6", park: "#d2e4cf", building: "#dbe2d8" };
  for (const layer of map.getStyle().layers) {
    try {
      if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", c.bg);
      else if (layer.type === "fill" && /building/.test(layer.id) && c.building) map.setPaintProperty(layer.id, "fill-color", c.building);
      else if (layer.type === "fill" && /water/.test(layer.id)) map.setPaintProperty(layer.id, "fill-color", c.water);
      else if (layer.type === "fill" && /park|wood|grass|forest|landcover/.test(layer.id)) map.setPaintProperty(layer.id, "fill-color", c.park);
    } catch (e) { /* some layers use expressions we leave alone */ }
  }
}

// Room around the route when zooming to fit: space for the buttons on top and, on phones,
// for the panel that overlaps the bottom of the map.
const MAP_PADDING = window.innerWidth < 900 ? { top: 80, bottom: 70, left: 40, right: 40 } : { top: 80, bottom: 50, left: 60, right: 60 };

// Creates a map and returns helpers for drawing the walking path and bar markers.
// points are [lat, lng]; bars are { lat, lng, ... }.
function createMap(elementId, { interactive = true, center = [-46.69, -23.5565], zoom = 14 } = {}) {
  const options = {
    container: elementId, style: mapStyle(), center, zoom, interactive,
    attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false, touchPitch: false,
    cooperativeGestures: false, maxZoom: DEMO ? DEMO.maxZoom : 19, minZoom: DEMO ? DEMO.minZoom : 3
  };
  if (DEMO) options.maxBounds = [[DEMO.bounds[0][1] - 0.01, DEMO.bounds[0][0] - 0.01], [DEMO.bounds[1][1] + 0.01, DEMO.bounds[1][0] + 0.01]];
  const map = new maplibregl.Map(options);
  if (interactive) map.touchZoomRotate.disableRotation();
  const bb = { map, path: null, dashed: false, markers: [], dots: [], me: null };
  let styleReady = false; // true once the map's style has arrived and we can add our own layers

  function drawPath() {
    if (!styleReady) return;
    const coords = bb.path ? bb.path.map(([lat, lng]) => [lng, lat]) : [];
    const data = { type: "Feature", geometry: { type: "LineString", coordinates: coords } };
    const src = map.getSource("route");
    if (src) src.setData(data);
    else {
      map.addSource("route", { type: "geojson", data });
      const layout = { "line-cap": "round", "line-join": "round" };
      map.addLayer({ id: "route-casing", type: "line", source: "route", layout, paint: { "line-color": cssVar("--ink", "#0f2219"), "line-width": 10, "line-opacity": 0.14 } });
      map.addLayer({ id: "route-line", type: "line", source: "route", layout, paint: { "line-color": cssVar("--path", "#e0a800"), "line-width": 5 } });
    }
    map.setPaintProperty("route-line", "line-dasharray", bb.dashed ? [1.2, 1.6] : null);
  }

  map.on("style.load", () => { styleReady = true; tintMap(map); drawPath(); });
  // Keep the map credits folded into the small "i" button until someone taps it.
  const foldCredits = () => map.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
  map.once("load", foldCredits);
  map.once("idle", foldCredits);
  setTimeout(foldCredits, 2500);
  window.addEventListener("beerboot:theme", () => {
    if (DEMO) return;
    styleReady = false;
    map.setStyle(mapStyle(), { diff: false });
  });

  bb.setPath = (points, { dashed = false } = {}) => { bb.path = points; bb.dashed = dashed; drawPath(); };

  // Numbered bottle-cap markers. states[i] can be "done" (green tick) or "" (gold number).
  bb.setStops = (bars, { states = [], onClick } = {}) => {
    bb.markers.forEach((m) => m.remove());
    bb.markers = bars.map((bar, i) => {
      const el = document.createElement("div");
      el.className = "cap-marker";
      el.innerHTML = capSvg(states[i] === "done" ? "✓" : i + 1, states[i] || "");
      el.title = bar.name;
      if (onClick) el.addEventListener("click", (e) => { e.stopPropagation(); onClick(i); });
      return new maplibregl.Marker({ element: el }).setLngLat([bar.lng, bar.lat]).addTo(map);
    });
  };
  bb.setActive = (i) => bb.markers.forEach((m, j) => m.getElement().classList.toggle("is-active", i === j));

  // Small dots for search results.
  bb.setDots = (bars, { added = () => false, onClick } = {}) => {
    bb.dots.forEach((m) => m.remove());
    bb.dots = bars.map((bar) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "dot-marker" + (added(bar) ? " added" : "");
      el.title = bar.name;
      el.setAttribute("aria-label", bar.name);
      if (onClick) el.addEventListener("click", (e) => { e.stopPropagation(); onClick(bar); });
      return new maplibregl.Marker({ element: el }).setLngLat([bar.lng, bar.lat]).addTo(map);
    });
  };

  bb.showMe = (lat, lng) => {
    if (!bb.me) {
      const el = document.createElement("div");
      el.className = "me-marker";
      bb.me = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
    } else bb.me.setLngLat([lng, lat]);
  };

  // Zooms the map so all the given [lat, lng] points fit.
  bb.fit = (points, { padding = 40, maxZoom = 16, animate = false } = {}) => {
    if (!points || !points.length) return;
    const b = new maplibregl.LngLatBounds([points[0][1], points[0][0]], [points[0][1], points[0][0]]);
    points.forEach(([lat, lng]) => b.extend([lng, lat]));
    map.fitBounds(b, { padding, maxZoom, duration: animate ? 600 : 0 });
  };
  bb.flyTo = (lat, lng, zoom = 16.5) => map.flyTo({ center: [lng, lat], zoom, duration: 700 });
  return bb;
}

// ---------- Walking directions ----------
// Asks OpenStreetMap's free routing service for a walking path through the bars, in order.
// Returns { legs: [{distance, duration}], points: [[lat, lng], ...], estimated: false }.
async function fetchWalkingPath(bars) {
  if (DEMO) return estimateWalkingPath(bars);
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
    const metres = metresBetween(bars[i], bars[i + 1]) * 1.25;
    legs.push({ distance: Math.round(metres), duration: Math.round(metres / 1.25) });
  }
  return { legs, points: bars.map((b) => [b.lat, b.lng]), estimated: true };
}

// "Best order": keeps the first bar, then finds the shortest walk through the rest.
// Returns the bars in the new order.
async function fetchBestOrder(bars) {
  if (bars.length < 3) return bars.slice();
  if (!DEMO) {
    try {
      const coords = bars.map((b) => `${b.lng},${b.lat}`).join(";");
      const url = `https://routing.openstreetmap.de/routed-foot/trip/v1/foot/${coords}?source=first&roundtrip=false&destination=any&overview=false`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.code === "Ok" && Array.isArray(data.waypoints)) {
        const ordered = [];
        data.waypoints.forEach((wp, i) => { ordered[wp.waypoint_index] = bars[i]; });
        if (ordered.filter(Boolean).length === bars.length) return ordered;
      }
    } catch (e) { /* fall back to the simple method below */ }
  }
  // Simple method: always walk to the nearest bar not visited yet.
  const left = bars.slice(1), ordered = [bars[0]];
  while (left.length) {
    const last = ordered[ordered.length - 1];
    let best = 0;
    left.forEach((b, i) => { if (metresBetween(last, b) < metresBetween(last, left[best])) best = i; });
    ordered.push(left.splice(best, 1)[0]);
  }
  return ordered;
}
