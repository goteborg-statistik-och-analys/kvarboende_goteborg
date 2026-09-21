/* --------------------------------------------------------------
   Rapporten, kapitel 1. Stegad presentation.

   Punktfältet ligger som en svag textur bakom innehållet. Varje
   punkt är 500 göteborgare och andelarna är de faktiska. Färgerna
   används solida, i storlekar i stället för genomskinlighet, enligt
   Göteborgs grafiska profil.
   -------------------------------------------------------------- */

(function () {
  "use strict";

  var F = window.RAPPORT_FARGER.palette;
  var FARG = F;

  var D = window.DATA_FLODE;
  if (!D) {
    document.body.textContent = "Datapaketet för kapitel 1 kunde inte läsas.";
    return;
  }

  function post(lista, id) {
    return lista.find(function (rad) { return rad.id === id; });
  }

  var U = {
    samma: post(D.utflode, "samma"), inom: post(D.utflode, "inom"),
    gr: post(D.utflode, "gr"), sverige: post(D.utflode, "sverige"),
    bort: post(D.utflode, "bort")
  };
  var I = {
    fodda: post(D.inflode, "fodda"), in_gr: post(D.inflode, "in_gr"),
    in_sverige: post(D.inflode, "in_sverige"), in_utland: post(D.inflode, "in_utland")
  };
  var H = {
    kvar_i_goteborg: U.samma.antal + U.inom.antal,
    andel_kvar_i_goteborg: U.samma.andel + U.inom.andel,
    lamnat_staden: U.gr.antal + U.sverige.antal + U.bort.antal,
    andel_lamnat_staden: U.gr.andel + U.sverige.andel + U.bort.andel,
    bytt_bostad_totalt: U.inom.antal + U.gr.antal + U.sverige.antal
  };
  H.andel_bytt_inom_staden = U.inom.antal / H.bytt_bostad_totalt * 100;

  var stillbild = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var steg = Array.prototype.slice.call(document.querySelectorAll(".steg"));
  var aktivt = 0;

  function nr(n) { return n.toLocaleString("sv-SE"); }
  function pr(n) { return n.toFixed(1).replace(".", ",") + " %"; }
  function procentText(n) { return n.toFixed(1).replace(".", ",") + " procent"; }

  /* ===== Ringen ==============================================
     Cirka 1 218 punkter, en per 500 göteborgare. Startbefolkningen ordnas
     i fyra koncentriska band efter utfall. Båglängden för varje färg
     är den faktiska andelen, så rörelsen förklarar indelningen.
     ========================================================== */

  var duk = document.getElementById("ringduk");
  var rctx = duk ? duk.getContext("2d") : null;
  var punkter = [], bredd = 0, hojd = 0;
  var ANTAL = Math.round(D.befolkning.start / 500), BAND = 4;
  var startTid = 0, spelar = false;

  function slump(a, b) { return a + Math.random() * (b - a); }
  function lattnad(t) { return 1 - Math.pow(1 - t, 3); }   // mjuk inbromsning

  function byggRing() {
    if (!duk || !D) return;
    punkter = [];
    var segment = D.utflode.map(function (r) { return { farg: r.farg, andel: r.andel / 100 }; });
    var i = 0;
    segment.forEach(function (s) {
      var n = Math.round(ANTAL * s.andel);
      for (var k = 0; k < n; k++) {
        var andel = (i + 0.5) / ANTAL;
        punkter.push({
          farg: s.farg,
          vinkel: -Math.PI / 2 + andel * Math.PI * 2,
          band: i % BAND,
          // startläge nära mitten: en population delas upp efter utfall
          fran: 0.15,
          drojsmal: slump(0, 0.42)
        });
        i++;
      }
    });
  }

  function mattRing() {
    if (!duk) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = duk.getBoundingClientRect();
    bredd = r.width; hojd = r.height;
    duk.width = Math.round(bredd * dpr);
    duk.height = Math.round(hojd * dpr);
    rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ritaRing(t) {
    if (!rctx || !bredd) return;
    rctx.clearRect(0, 0, bredd, hojd);
    var cx = bredd / 2, cy = hojd / 2;
    var R = Math.min(bredd, hojd) * 0.40;
    var avstand = Math.max(4, R * 0.028);
    var punktR = Math.max(1.2, R * 0.011);

    for (var i = 0; i < punkter.length; i++) {
      var p = punkter[i];
      var lokal = Math.min(1, Math.max(0, (t - p.drojsmal) / 0.75));
      var e = stillbild ? 1 : lattnad(lokal);
      if (e <= 0) continue;

      var radie = (R + (p.band - (BAND - 1) / 2) * avstand);
      var faktor = p.fran + (1 - p.fran) * e;
      var x = cx + Math.cos(p.vinkel) * radie * faktor;
      var y = cy + Math.sin(p.vinkel) * radie * faktor;

      rctx.fillStyle = FARG[p.farg];
      rctx.beginPath();
      rctx.arc(x, y, punktR, 0, Math.PI * 2);
      rctx.fill();
    }
  }

  function slinga(nu) {
    var t = (nu - startTid) / 1000;
    ritaRing(t);
    if (t < 1.5) requestAnimationFrame(slinga);
    else spelar = false;
  }

  function spelaRing() {
    if (!rctx || spelar) return;
    mattRing();
    if (stillbild) { ritaRing(1); return; }
    spelar = true;
    startTid = performance.now();
    requestAnimationFrame(slinga);
  }

  function byggNyckel() {
    var el = document.getElementById("ringnyckel");
    if (!el || !D) return;
    el.innerHTML = D.utflode.map(function (r) {
      return '<span class="ring__nyckel-item"><span class="prick" style="background:' + FARG[r.farg]
        + '"></span><span>' + r.text + '</span><b>' + pr(r.andel) + "</b></span>";
    }).join("");
  }

  /* ===== Tabellerna ========================================== */

  function rad(text, antal, andel, farg, indrag, klass) {
    return '<tr class="' + (indrag ? "indrag " : "") + (klass || "") + '">'
      + '<th scope="row" class="namn">'
      + (farg ? '<span class="prick" style="background:' + FARG[farg] + '"></span>' : "")
      + text + "</th>"
      + '<td class="varde"><span class="antal">' + nr(antal) + '</span>'
      + (andel != null ? '<span class="andel">(' + pr(andel) + ")</span>" : "")
      + "</td></tr>";
  }
  function rubrik(t, klass) { return '<tr class="rubrikrad ' + (klass || "") + '"><th scope="rowgroup" colspan="2">' + t + "</th></tr>"; }
  function summa(t, a, extra, klass) {
    return '<tr class="' + (klass || "summarad") + '"><th scope="row" class="namn">' + t + "</th>"
      + '<td class="varde"><span class="antal">' + nr(a) + '</span>'
      + (extra ? '<span class="andel">' + extra + "</span>" : "") + "</td></tr>";
  }

  function utflodesrader(grupperad) {
    var h = rad("Kvar i Göteborg", H.kvar_i_goteborg,
                H.andel_kvar_i_goteborg, null);
    D.utflode.forEach(function (r) {
      var inne = (r.id === "samma" || r.id === "inom");
      if (inne) h += rad("varav " + r.text.toLowerCase(), r.antal, r.andel, r.farg, true);
    });
    if (grupperad) h += rubrik("Inte kvar i Göteborg vid nästa årsskifte", "grupprubrik");
    D.utflode.forEach(function (r) {
      if (r.id !== "samma" && r.id !== "inom") {
        h += rad(r.text, r.antal, r.andel, r.farg, false, grupperad ? "gruppdel" : "");
      }
    });
    if (grupperad) {
      h += summa("Totalt: inte kvar i Göteborg", H.lamnat_staden,
                 "(" + pr(H.andel_lamnat_staden) + ")", "gruppsumma");
    }
    return h;
  }

  function inflodesrader() {
    var h = "";
    D.inflode.forEach(function (r) { h += rad(r.text, r.antal, r.andel, r.farg); });
    return h;
  }

  function sattFalt(namn, varde) {
    document.querySelectorAll('[data-falt="' + namn + '"]').forEach(function (el) {
      el.textContent = varde;
    });
  }

  function fyllFalt() {
    var nya = D.inflode.reduce(function (summa, rad) { return summa + rad.antal; }, 0);
    var tomma = D.bostader.lagenhetsregister - D.bostader.bostadshushall;
    sattFalt("fran", D.period.fran);
    sattFalt("till", D.period.till);
    sattFalt("start", nr(D.befolkning.start));
    sattFalt("slut", nr(D.befolkning.slut));
    sattFalt("andel-kvar-goteborg", pr(H.andel_kvar_i_goteborg));
    sattFalt("kvar-antal", nr(H.kvar_i_goteborg));
    sattFalt("andel-samma", pr(U.samma.andel));
    sattFalt("samma-antal", nr(U.samma.antal));
    sattFalt("samma-andel", pr(U.samma.andel));
    sattFalt("inom-antal", nr(U.inom.antal));
    sattFalt("inom-andel", pr(U.inom.andel));
    sattFalt("gr-antal", nr(U.gr.antal));
    sattFalt("gr-andel", pr(U.gr.andel));
    sattFalt("sverige-antal", nr(U.sverige.antal));
    sattFalt("sverige-andel", pr(U.sverige.andel));
    sattFalt("bort-antal", nr(U.bort.antal));
    sattFalt("bort-andel", pr(U.bort.andel));
    sattFalt("andel-flytt-inom", pr(H.andel_bytt_inom_staden));
    sattFalt("lamnat-antal", nr(H.lamnat_staden));
    sattFalt("lamnat-andel", procentText(H.andel_lamnat_staden));
    sattFalt("lamnat-andel-kort", pr(H.andel_lamnat_staden));
    sattFalt("nya-antal", nr(nya));
    sattFalt("nya-andel-kort", pr(D.inflode.reduce(function (s, r) { return s + r.andel; }, 0)));
    sattFalt("nya-andel-slut", procentText(nya / D.befolkning.slut * 100));
    sattFalt("tidigare-goteborg-andel-slut", procentText(H.kvar_i_goteborg / D.befolkning.slut * 100));
    sattFalt("fodda-officiell", nr(D.under_aret.fodda));
    sattFalt("nollar-antal", nr(I.fodda.antal));
    sattFalt("nollar-andel", pr(I.fodda.andel));
    sattFalt("in-gr-antal", nr(I.in_gr.antal));
    sattFalt("in-gr-andel", pr(I.in_gr.andel));
    sattFalt("in-sverige-antal", nr(I.in_sverige.antal));
    sattFalt("in-sverige-andel", pr(I.in_sverige.andel));
    sattFalt("in-utland-antal", nr(I.in_utland.antal));
    sattFalt("in-utland-andel", pr(I.in_utland.andel));
    sattFalt("forandring", nr(D.befolkning.forandring));
    sattFalt("bostader-register", nr(D.bostader.lagenhetsregister));
    sattFalt("bostadshushall", nr(D.bostader.bostadshushall));
    sattFalt("bostader-tomma", nr(tomma));

    var ringbeskrivning = document.getElementById("ringbeskrivning");
    if (ringbeskrivning) ringbeskrivning.textContent = "Av startbefolkningen bodde "
      + procentText(U.samma.andel) + " kvar i samma bostad och "
      + procentText(U.inom.andel) + " bytte bostad inom Göteborg.";
  }

  function byggTabeller() {
    if (!D) return;

    // Jämförelse mot officiell statistik
    var u = D.under_aret;
    var j = [
      ["Bytt bostad inom Göteborg", u.flytt_inom_gbg, D.utflode[1].antal],
      ["Till övriga Göteborgsregionen", u.ut_gr, D.utflode[2].antal],
      ["Till övriga Sverige", u.ut_riket, D.utflode[3].antal],
      ["Från övriga Göteborgsregionen", u.in_gr, D.inflode[1].antal],
      ["Från övriga Sverige", u.in_riket, D.inflode[2].antal],
      ["Invandring / ej folkbokförd året före", u.invandring, D.inflode[3].antal],
      ["Utvandrat eller avlidit", u.utvandring + u.avlidna, D.utflode[4].antal]
    ];
    var h = "";
    j.forEach(function (r) {
      var skillnad = r[1] - r[2];
      var fler = skillnad / r[2] * 100;
      h += '<tr><th scope="row">' + r[0] + '</th>'
         + '<td data-rubrik="Registrerade under ' + D.period.till + '">' + nr(r[1]) + "</td>"
         + '<td data-rubrik="Förändring mellan årsskiften">' + nr(r[2]) + "</td>"
         + '<td class="jamfor__skillnad" data-rubrik="Fler registrerade flyttningar under året"><b>+' + nr(skillnad)
         + '</b><span>' + pr(fler) + " fler</span></td></tr>";
    });
    var jamforRader = document.getElementById("tab-jamfor-rader");
    if (jamforRader) jamforRader.innerHTML = h;

    var mk = document.getElementById("metod-kallor");
    if (mk) mk.textContent = "Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.";

    // Tidslinje: årsskiftena, med de två jämförda upplysta
    var ts = document.getElementById("tidslinje");
    if (ts) {
      var ar = [2020, 2021, 2022, 2023, 2024, 2025], th = "";
      ar.forEach(function (a) {
        var vald = (a === D.period.fran || a === D.period.till) ? "ja" : "nej";
        th += '<span class="tidslinje__ar" data-vald="' + vald + '">' + a + "-12-31</span>";
      });
      ts.innerHTML = th;
    }
  }

  /* ===== Navigering ========================================== */

  var punktlista = document.getElementById("punkter");

  function byggPunkter() {
    punktlista.innerHTML = steg.map(function (el, i) {
      return '<li><button type="button" data-ga="' + i + '" aria-label="Steg '
        + (i + 1) + " av " + steg.length + ": " + el.getAttribute("aria-label") + '"></button></li>';
    }).join("");
    punktlista.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) visa(parseInt(b.getAttribute("data-ga"), 10));
    });
  }

  function visa(i, uppdateraAdress) {
    i = Math.max(0, Math.min(steg.length - 1, i));
    aktivt = i;
    steg.forEach(function (el, j) {
      var aktiv = j === i;
      el.classList.toggle("aktiv", aktiv);
      el.setAttribute("aria-hidden", aktiv ? "false" : "true");
      el.inert = !aktiv;
    });
    Array.prototype.forEach.call(punktlista.querySelectorAll("button"), function (b, j) {
      b.setAttribute("aria-current", j === i ? "true" : "false");
    });
    document.getElementById("bakat").disabled = (i === 0);
    document.getElementById("framat").disabled = (i === steg.length - 1);
    if (i === 0) spelaRing();
    document.getElementById("stegstatus").textContent = "Steg " + (i + 1) + " av "
      + steg.length + ": " + steg[i].getAttribute("aria-label");
    if (uppdateraAdress !== false) history.replaceState(null, "", "#" + steg[i].id);
    window.scrollTo(0, 0);
  }

  document.getElementById("bakat").onclick = function () { visa(aktivt - 1); };
  document.getElementById("framat").onclick = function () { visa(aktivt + 1); };

  var metod = document.getElementById("metod");
  function visaMetod(pa) {
    if (pa) metod.showModal();
    else metod.close();
  }
  document.getElementById("oppna-metod").onclick = function () { visaMetod(true); };
  document.getElementById("stang-metod").onclick = function () { visaMetod(false); };
  metod.addEventListener("close", function () {
    document.getElementById("oppna-metod").focus();
  });

  document.addEventListener("keydown", function (e) {
    if (metod.open) return;
    if (e.target.closest && e.target.closest("button, a, input, select, textarea, summary")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { visa(aktivt + 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { visa(aktivt - 1); e.preventDefault(); }
    else if (e.key === "Home") { visa(0); e.preventDefault(); }
    else if (e.key === "End") { visa(steg.length - 1); e.preventDefault(); }
  });

  var startX = 0, startY = 0;
  document.addEventListener("touchstart", function (e) {
    if (metod.open) return;
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (metod.open) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.8) visa(aktivt + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ===== Start =============================================== */

  byggTabeller();
  fyllFalt();
  byggPunkter();
  byggRing();
  byggNyckel();
  var hashIndex = steg.findIndex(function (el) { return "#" + el.id === window.location.hash; });
  visa(hashIndex >= 0 ? hashIndex : 0, hashIndex < 0);

  window.addEventListener("hashchange", function () {
    var i = steg.findIndex(function (el) { return "#" + el.id === window.location.hash; });
    if (i >= 0) visa(i, false);
  });

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () { mattRing(); ritaRing(1.5); }, 160);
  });

})();
