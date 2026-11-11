// Demo mode settings. Only the artifact version loads this file (see tools/build_artifact.py).
// Artifacts can't load anything from other websites, so the demo brings its own
// map images (demo/tiles, from OpenStreetMap) and bar list (demo/bars.js).
window.PUBCRAWL_DEMO = {
  tiles: "demo/tiles/{z}/{x}/{y}.png",
  // The area the bundled map images cover: Vila Madalena and Pinheiros, São Paulo.
  bounds: [[-23.5720, -46.7050], [-23.5450, -46.6750]],
  minZoom: 14,
  maxNativeZoom: 16, // images exist up to zoom 16; closer zooms enlarge them
  maxZoom: 18
};
