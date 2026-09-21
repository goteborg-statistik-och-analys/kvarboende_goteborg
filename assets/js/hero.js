/* Landningssidans punktfält. Varje punkt motsvarar 500 personer i
   startbefolkningen. Färg och rörelse följer utfallen efter ett år. */

(function () {
  "use strict";

  var duk = document.getElementById("falt");
  if (!duk) return;

  var ctx = duk.getContext("2d");
  var D = window.DATA_FLODE;
  var startbefolkning = D ? D.befolkning.start : 608996;
  var antalPunkter = Math.round(startbefolkning / 500);
  var stillbild = window.matchMedia("(prefers-reduced-motion: reduce)");

  var farger = window.RAPPORT_FARGER.palette;

  var utfall = D ? D.utflode : [
    { id: "samma", andel: 83.1, farg: "gron" },
    { id: "inom", andel: 11.4, farg: "gul" },
    { id: "gr", andel: 1.7, farg: "turkos" },
    { id: "sverige", andel: 2.0, farg: "lila" },
    { id: "bort", andel: 1.8, farg: "rosa" }
  ];

  var bredd = 0;
  var hojd = 0;
  var punkter = [];
  var bildruta = 0;
  var senasteTid = 0;

  /* Fast slumpfrö gör att fältets komposition är densamma vid omladdning. */
  var fro = 23841;
  function slump() {
    fro = (fro * 1664525 + 1013904223) >>> 0;
    return fro / 4294967296;
  }

  function valjUtfall(i) {
    var lage = (i + .5) / antalPunkter * 100;
    var summa = 0;
    for (var j = 0; j < utfall.length; j++) {
      summa += utfall[j].andel;
      if (lage <= summa || j === utfall.length - 1) return utfall[j];
    }
    return utfall[0];
  }

  function byggFalt() {
    punkter = [];
    for (var i = 0; i < antalPunkter; i++) {
      var grupp = valjUtfall(i);
      var vinkel = slump() * Math.PI * 2;
      var fart;

      if (grupp.id === "samma") fart = 0;
      else if (grupp.id === "inom") fart = .0035 + slump() * .004;
      else fart = .0055 + slump() * .0065;

      punkter.push({
        x: slump(),
        y: slump(),
        vx: Math.cos(vinkel) * fart,
        vy: Math.sin(vinkel) * fart,
        spar: grupp.id === "samma" ? 0
          : grupp.id === "inom" ? 10 + slump() * 8
          : 14 + slump() * 10,
        farg: farger[grupp.farg] || farger.turkos
      });
    }
  }

  function mattDuk() {
    var ruta = duk.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    bredd = Math.max(1, ruta.width);
    hojd = Math.max(1, ruta.height);
    duk.width = Math.round(bredd * dpr);
    duk.height = Math.round(hojd * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function flyttaPunkter(tid) {
    for (var i = 0; i < punkter.length; i++) {
      var p = punkter[i];
      p.x += p.vx * tid;
      p.y += p.vy * tid;

      if (p.x < 0) p.x += 1;
      else if (p.x > 1) p.x -= 1;
      if (p.y < 0) p.y += 1;
      else if (p.y > 1) p.y -= 1;
    }
  }

  function rita() {
    ctx.clearRect(0, 0, bredd, hojd);
    var radie = bredd < 600 ? 1 : 1.25;
    ctx.lineCap = "round";

    for (var i = 0; i < punkter.length; i++) {
      var p = punkter[i];
      var x = p.x * bredd;
      var y = p.y * hojd;
      var dx = p.vx * bredd;
      var dy = p.vy * hojd;
      var riktning = Math.sqrt(dx * dx + dy * dy) || 1;

      if (!stillbild.matches && p.spar > 0) {
        // Kort, avsmalnande svans bakom punkten. Transparensen gäller
        // enbart den dekorativa rörelsen, enligt önskemål för landningssidan.
        var langd = p.spar * (bredd < 600 ? .7 : 1);
        var steg = 10;
        ctx.strokeStyle = p.farg;
        for (var j = steg; j > 0; j--) {
          var fran = j / steg;
          var till = (j - 1) / steg;
          ctx.globalAlpha = .62 * Math.pow(1 - (fran + till) / 2, 1.6);
          ctx.lineWidth = radie * 1.1 * (1 - fran * .75);
          ctx.beginPath();
          ctx.moveTo(x - dx / riktning * langd * fran, y - dy / riktning * langd * fran);
          ctx.lineTo(x - dx / riktning * langd * till, y - dy / riktning * langd * till);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = p.farg;
      ctx.beginPath();
      ctx.arc(x, y, radie, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animera(nu) {
    var tid = senasteTid ? Math.min((nu - senasteTid) / 1000, .05) : 0;
    senasteTid = nu;
    flyttaPunkter(tid);
    rita();
    bildruta = requestAnimationFrame(animera);
  }

  function starta() {
    cancelAnimationFrame(bildruta);
    senasteTid = 0;
    if (stillbild.matches || document.hidden) {
      rita();
      return;
    }
    bildruta = requestAnimationFrame(animera);
  }

  function synlighetAndrad() {
    if (document.hidden) cancelAnimationFrame(bildruta);
    else starta();
  }

  byggFalt();
  mattDuk();
  starta();

  window.addEventListener("resize", function () {
    mattDuk();
    rita();
  });
  document.addEventListener("visibilitychange", synlighetAndrad);
  if (stillbild.addEventListener) stillbild.addEventListener("change", starta);
})();
