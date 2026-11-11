// Lets BeerBoot be installed on a phone's home screen and open with a weak signal (see sw.js).
// Not used in the artifact demo, where service workers aren't allowed.
if ("serviceWorker" in navigator && !window.BEERBOOT_DEMO && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => { /* the app works fine without it */ });
  });
}
