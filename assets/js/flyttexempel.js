/* Pilspetsen följer den växande linjens slut. Tiden går från vänster till höger. */
(function () {
  "use strict";
  const section = document.getElementById("steg-5");
  const outbound = document.getElementById("flytt-ut");
  const inbound = document.getElementById("flytt-in");
  if (!section || !outbound || !inbound) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const trips = [
    { path: outbound, arrow: document.getElementById("flytt-pil-ut") },
    { path: inbound, arrow: document.getElementById("flytt-pil-in") }
  ];
  let frame = 0;
  let started = null;
  trips.forEach(trip => { trip.length = trip.path.getTotalLength(); });

  function drawTrip(trip, progress) {
    const t = Math.max(0, Math.min(1, progress));
    trip.path.style.strokeDasharray = "1";
    trip.path.style.strokeDashoffset = String(1 - t);
    trip.path.style.visibility = t === 0 ? "hidden" : "visible";
    trip.arrow.style.visibility = t === 0 ? "hidden" : "visible";
    const position = trip.path.getPointAtLength(trip.length * t);
    const before = trip.path.getPointAtLength(Math.max(0, trip.length * t - .5));
    const after = trip.path.getPointAtLength(Math.min(trip.length, trip.length * t + .5));
    const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    trip.arrow.setAttribute("transform", "translate(" + position.x + " " + position.y + ") rotate(" + angle + ")");
  }
  function finish() {
    cancelAnimationFrame(frame);
    trips.forEach(trip => drawTrip(trip, 1));
  }
  function animate(now) {
    if (started === null) started = now;
    const elapsed = now - started;
    drawTrip(trips[0], (elapsed - 450) / 1400);
    drawTrip(trips[1], (elapsed - 2150) / 1400);
    if (elapsed < 3550) frame = requestAnimationFrame(animate);
  }
  function restart() {
    cancelAnimationFrame(frame);
    if (!section.classList.contains("aktiv") || reduced.matches || document.hidden) { finish(); return; }
    started = null;
    trips.forEach(trip => drawTrip(trip, 0));
    frame = requestAnimationFrame(animate);
  }
  new MutationObserver(restart).observe(section, { attributes: true, attributeFilter: ["class"] });
  reduced.addEventListener("change", restart);
  document.addEventListener("visibilitychange", restart);
  window.addEventListener("beforeprint", finish);
  restart();
})();
