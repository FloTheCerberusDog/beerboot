// Route data for the app.
//
// A "bar" is a place. A "route" is an ordered list of bar ids.
// Keeping them separate means one bar can appear in many routes,
// and its ratings belong to the bar, not to a single route.
//
// Locations come from OpenStreetMap. Opening hours change, so check before you go.

window.BARS = {
  "bar-astor": {
    name: "Bar Astor",
    address: "Rua Delfina, 163",
    lat: -23.554071,
    lng: -46.6942315,
    note: {
      en: "A classic São Paulo bar. A good place to start with a chopp (draft beer).",
      pt: "Um bar clássico de São Paulo. Bom lugar para começar com um chopp."
    }
  },
  "boteco-belmonte": {
    name: "Boteco Belmonte",
    address: "Rua Girassol, 384",
    lat: -23.5552829,
    lng: -46.6891222,
    note: {
      en: "A neighbourhood boteco: casual, loud and usually busy.",
      pt: "Um boteco de bairro: descontraído, animado e quase sempre cheio."
    }
  },
  "filial": {
    name: "Filial Bar",
    address: "Rua Fidalga, 254",
    lat: -23.5571758,
    lng: -46.6892535,
    note: {
      en: "One of Vila Madalena's best-known bars.",
      pt: "Um dos bares mais conhecidos da Vila Madalena."
    }
  },
  "boteco-seu-ze": {
    name: "Boteco Seu Zé",
    address: "Rua Mourato Coelho, 1144",
    lat: -23.5579808,
    lng: -46.6913433,
    note: {
      en: "Another classic boteco, right in the middle of the neighbourhood.",
      pt: "Outro boteco clássico, bem no meio do bairro."
    }
  },
  "o-do-borogodo": {
    name: "Ó do Borogodó",
    address: "Rua Horácio Lane, 21",
    lat: -23.5601965,
    lng: -46.6862159,
    note: {
      en: "A samba bar with live music. A great place to end the night.",
      pt: "Bar de samba com música ao vivo. Ótimo lugar para fechar a noite."
    }
  }
};

window.ROUTES = [
  {
    id: "vila-madalena-classic",
    title: {
      en: "Vila Madalena Classics",
      pt: "Clássicos da Vila Madalena"
    },
    city: "São Paulo",
    description: {
      en: "Five bars, one drink at each, all on foot through one of São Paulo's liveliest neighbourhoods.",
      pt: "Cinco bares, uma bebida em cada, tudo a pé por um dos bairros mais animados de São Paulo."
    },
    stops: ["bar-astor", "boteco-belmonte", "filial", "boteco-seu-ze", "o-do-borogodo"],
    path: window.VILA_MADALENA_PATH
  }
];
