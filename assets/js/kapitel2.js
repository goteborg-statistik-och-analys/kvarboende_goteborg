/* Årvalet delas mellan kapitlets vyer. Saknade observationer bryter linjen. */
(function () {
  "use strict";
  const D = window.DATA_KAPITEL2;
  if (!D) return;
  const colors = window.RAPPORT_FARGER.palette;
  // Gemensamma färger för in- och utflödet. Turkos ersätter rosa för att
  // skilja regionen tydligare från den röda serien när linjerna möts.
  const flowColors = window.RAPPORT_FARGER.outcomes;
  const fmt = (n, digits = 2) => n === null ? "Uppgift saknas" : n.toLocaleString("sv-SE", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " %";
  const period = i => (Number(D.ar[i]) - 1) + " → " + D.ar[i];
  let yearIndex = D.ar.length - 1;
  let active = 0;
  const stages = [...document.querySelectorAll(".steg")];
  const panels = [
    { id: "k2-total", series: [{ namn: "Kvar i Göteborg", farg: "morkbla", varden: window.K2S1_SLUTVERSION.map(r => r.value) }], min: 90, max: 100, full: false },
    { id: "k2-bostad", multi: true, compact: true, title: "Kvar i Göteborg – bostad och flytt", series: [{ namn: "Kvar i samma bostad", farg: flowColors.samma, varden: window.K2S2_SLUTVERSION.map(r => r.samma) }, { namn: "Övriga kvar i Göteborg", farg: flowColors.inom, varden: window.K2S2_SLUTVERSION.map(r => r.ovriga) }], min: 75, max: 85, full: true },
    { id: "k2-ut", multi: true, compact: true, title: "De som inte finns kvar i Göteborg", series: window.K2S3_SLUTVERSION.map(s => ({ ...s, farg: flowColors[s.id] })), min: 0, max: 3 },
    { id: "k2-in", multi: true, compact: true, title: "Nytillkomna göteborgare", series: window.K2S4_SLUTVERSION.map(s => ({ ...s, farg: flowColors[s.id] })), min: 0, max: 3, end: true }
  ];
  function node(tag, attrs, text) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function visibleSeries(p) { return p.multi ? p.series.filter((s, i) => p.visible.has(i)) : [p.series[p.selected]]; }
  function flowSummary(p, i) {
    const total = p.series.reduce((sum, s) => sum + s.varden[i], 0);
    const percent = n => n.toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
    if (p.id === "k2-ut") return "Summa av de tre kategorierna: " + percent(total);
    if (p.id === "k2-in") {
      const arrivals = p.series.filter(s => s.id !== "nyfodda").reduce((sum, s) => sum + s.varden[i], 0);
      return "Nytillkomna inkl. nollåringar: " + percent(total) + " · Övriga nytillkomna, exkl. nollåringar: " + percent(arrivals);
    }
    return "";
  }
  const patterns = ["", "9 5", "2 4", "10 4 2 4"];
  function chartScale(p) {
    if (p.id === "k2-bostad") {
      if (p.visible.size > 1 || p.full) return [0, 100];
      return p.visible.has(1) ? [8, 18] : [75, 85];
    }
    return p.full ? [0, 100] : [p.min, p.max];
  }
  function gapBridges(values, x, y) {
    const bridges = [];
    let last = -1;
    values.forEach((v, i) => {
      if (v === null) return;
      if (last >= 0 && i > last + 1) bridges.push("M" + x(last) + " " + y(values[last]) + " L" + x(i) + " " + y(v));
      last = i;
    });
    return bridges;
  }
  function draw(p) {
    const shown = visibleSeries(p), s = shown[0];
    const width = Math.max(560, Math.round(p.chart.getBoundingClientRect().width || 560));
    const height = p.multi ? 260 : (p.id === "k2-total" ? 235 : 210);
    const left = 54, right = width - 188, top = 22, bottom = height - 32;
    const [min, max] = chartScale(p);
    const x = i => left + i / (D.ar.length - 1) * (right - left);
    const y = v => bottom - (v - min) / (max - min) * (bottom - top);
    const svg = node("svg", { viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": (p.multi ? p.title : s.namn) + ", 2013–2025. Linjernas namn och värden finns nedanför." });
    const tickCount = max === 3 ? 6 : 4;
    for (let i = 0; i <= tickCount; i++) {
      const value = min + (max - min) * i / tickCount;
      svg.append(node("line", { x1: left, x2: right, y1: y(value), y2: y(value), stroke: "#d1d9dc" }));
      svg.append(node("text", { x: left - 8, y: y(value) + 4, "text-anchor": "end" }, value.toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })));
    }
    [0, 4, 8, 12].forEach(i => svg.append(node("text", { x: x(i), y: height - 8, "text-anchor": "middle" }, D.ar[i])));
    const gap = s.varden.indexOf(null);
    if (gap >= 0) {
      if (!p.compact) svg.append(node("line", { x1: x(gap), x2: x(gap), y1: top + 18, y2: bottom, stroke: "#3f5564", "stroke-dasharray": "2 5" }));
      svg.append(node("text", { x: x(gap), y: top - 5, "text-anchor": "middle" }, "2019 saknas"));
    }
    shown.forEach(series => {
      const index = p.series.indexOf(series);
      let path = "", connected = false;
      series.varden.forEach((v, i) => {
        if (v === null) { connected = false; return; }
        path += (connected ? " L" : " M") + x(i) + " " + y(v);
        connected = true;
      });
      svg.append(node("path", { d: path, fill: "none", stroke: colors[series.farg], "stroke-width": 2.7, "stroke-dasharray": p.multi && !p.compact ? patterns[index] : "", "stroke-linejoin": "round" }));
      if (p.compact) gapBridges(series.varden, x, y).forEach(d => {
        svg.append(node("path", { d, fill: "none", stroke: colors[series.farg], "stroke-width": 2.7, "stroke-dasharray": "5 5", "aria-label": "Förbindelse mellan 2018 och 2020. Uppgift för 2019 saknas." }));
      });
      series.varden.forEach((v, i) => {
        if (v !== null) svg.append(node("circle", { cx: x(i), cy: y(v), r: 2.4, fill: colors[series.farg] }));
      });
      if (series.varden[yearIndex] !== null) svg.append(node("circle", { cx: x(yearIndex), cy: y(series.varden[yearIndex]), r: 5, fill: colors[series.farg], stroke: "#1f1f1f", "stroke-width": 1.3 }));
    });
    svg.append(node("line", { x1: x(yearIndex), x2: x(yearIndex), y1: top, y2: bottom, stroke: "#1f1f1f", "stroke-dasharray": "4 4" }));
    window.RAPPORT_ETIKETTER(svg,shown.map(s=>({name:s.namn,y:y(s.varden[s.varden.length-1]),color:colors[s.farg]})),{right,top,bottom,width});
    p.plotBounds = { left, right, top, bottom };
    p.chart.replaceChildren(svg);
    p.scale.textContent = "Andel (%) · Skala " + min + "–" + max;
    p.value.hidden = !!p.multi;
    if (!p.multi) {
      p.value.textContent = fmt(s.varden[yearIndex], 1);
      p.value.classList.toggle("k2__varde--saknas", s.varden[yearIndex] === null);
    }
    p.period.textContent = period(yearIndex);
    p.slider.value = yearIndex;
    if (p.yearLabel) p.yearLabel.textContent = "Årsskifte " + D.ar[yearIndex];
    p.slider.setAttribute("aria-valuetext", period(yearIndex) + ": " + shown.map(v => v.namn + " " + fmt(v.varden[yearIndex], 1)).join("; "));
    p.caption.textContent = p.end
      ? "Andel nytillkomna personer i respektive kategori av Göteborgs befolkning den 31 december " + D.ar[yearIndex] + "."
      : (p.id === "k2-total" ? "Andel kvarboende personer i Göteborg den 31 december " : "Andel personer med respektive utfall den 31 december ") + D.ar[yearIndex] + " av Göteborgs befolkning den 31 december " + (Number(D.ar[yearIndex]) - 1) + ".";
    p.heading.textContent = p.multi ? p.title : s.namn;
    if (p.id === "k2-total" || p.compact) {
      const dates = document.createElement("span");
      dates.className = "k2__rubrikdatum";
      dates.textContent = " (" + (Number(D.ar[yearIndex]) - 1) + "-12-31 till " + D.ar[yearIndex] + "-12-31)";
      p.heading.append(dates);
      p.period.hidden = true;
    }
    if (p.compact) {
      p.metrics.replaceChildren();
      shown.forEach(series => {
        const item = document.createElement("div");
        const value = document.createElement("b");
        value.textContent = fmt(series.varden[yearIndex], 1);
        value.classList.toggle("k2__varde--saknas", series.varden[yearIndex] === null);
        const label = document.createElement("span"); label.textContent = series.namn;
        item.append(value, label); p.metrics.append(item);
      });
      if (p.id === "k2-bostad") {
        const r = window.K2S2_SLUTVERSION[yearIndex]; p.root.querySelector(".k2__gruppforklaring").textContent = r.status === "saknas" ? "Övriga kvar i Göteborg omfattar annan bostad eller bostadsbyte som inte kan avgöras. Fördelningen kan inte visas 2019." : "Övriga kvar i Göteborg: annan bostad (" + fmt(r.annan, 1) + ") eller bostadsbyte som inte kan avgöras (" + fmt(r.okand, 1) + ")."; p.scaleButton.disabled = p.visible.size > 1;
        p.scaleButton.textContent = p.visible.size > 1 ? "Båda linjerna: 0–100 %" : (p.full ? "Visa närbild" : "Visa 0–100 %");
        p.scaleButton.setAttribute("aria-pressed", String(p.full));
      }
    }
    if (p.multi) p.toggles.forEach((button, i) => {
      const on = p.visible.has(i);
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-disabled", String(on && p.visible.size === 1));
      button.querySelector("b").textContent = on ? fmt(p.series[i].varden[yearIndex], 1) : "Dold";
    });
    p.root.querySelectorAll("[data-year]").forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.year) === yearIndex)));
    if (p.summary) p.summary.textContent = flowSummary(p, yearIndex);
  }
  function chooseYear(i) {
    yearIndex = Math.max(0, Math.min(D.ar.length - 1, Number(i)));
    panels.forEach(draw);
  }
  function build(p) {
    p.selected = 0;
    p.visible = new Set(p.series.map((s,i) => i));
    p.root = document.getElementById(p.id);
    p.root.innerHTML = '<div class="k2__val"></div>'
      + '<div class="k2__huvud"><h3></h3><b class="k2__varde"></b><span class="k2__period"></span></div>'
      + '<div class="k2__skalrad"><span></span></div><div class="k2__diagram"></div><div class="k2__serier" role="group" aria-label="Visa eller dölj linjer"></div>'
      + '<div class="k2__arval"><label for="' + p.id + '-ar">Utforska årsskiftet</label><div class="k2__snabbval"></div>'
      + '<input id="' + p.id + '-ar" type="range" min="0" max="12" step="1" value="12"></div>'
      + '<p class="k2__namnare"></p><p class="k2__kalla">Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.</p>'
      + '<div class="k2__export"><button type="button" class="k2__kopiera">Kopiera diagram</button><a class="k2__hamta" hidden>Hämta PNG</a><span class="k2__status" role="status"></span></div><details class="k2__data"><summary>Visa alla värden</summary><div class="k2__tabell" role="region" aria-label="Datatabell, kan rullas i sidled" tabindex="0"></div></details>';
    p.chart = p.root.querySelector(".k2__diagram");
    p.value = p.root.querySelector(".k2__varde");
    p.period = p.root.querySelector(".k2__period");
    p.heading = p.root.querySelector("h3");
    p.scale = p.root.querySelector(".k2__skalrad span");
    p.caption = p.root.querySelector(".k2__namnare");
    p.slider = p.root.querySelector("input");
    p.slider.addEventListener("input", e => chooseYear(e.target.value));
    if (["k2-total", "k2-bostad", "k2-ut", "k2-in"].includes(p.id)) {
      p.yearLabel = document.createElement("output");
      p.yearLabel.className = "k2__valt-ar";
      p.yearLabel.setAttribute("for", p.slider.id);
      p.root.querySelector(".k2__snabbval").replaceWith(p.yearLabel);
      p.chart.addEventListener("pointermove", e => {
        if (e.pointerType === "touch") return;
        const svg = p.chart.querySelector("svg");
        const matrix = svg && svg.getScreenCTM();
        if (!matrix || !p.plotBounds) return;
        const point = svg.createSVGPoint();
        point.x = e.clientX; point.y = e.clientY;
        const local = point.matrixTransform(matrix.inverse());
        const {left, right, top, bottom} = p.plotBounds;
        if (local.x < left || local.x > right || local.y < top || local.y > bottom) return;
        const index = Math.round((local.x - left) / (right - left) * (D.ar.length - 1));
        if (index !== yearIndex) chooseYear(index);
      });
    }
    p.legend = p.root.querySelector(".k2__serier");
    if (p.id === "k2-ut" || p.id === "k2-in") {
      const guide = document.createElement("p");
      guide.className = "k2__reglagehjalp";
      guide.id = p.id + "-linjehjalp";
      guide.textContent = p.id === "k2-ut" ? "Visa eller dölj en kategori med knapparna. Olöst klassificering redovisas separat i underlaget och ingår inte i linjerna eller summan; vissa års uppgifter är sekretesskyddade." : "Jämför linjerna på samma skala. Visa eller dölj en kategori med knapparna.";
      p.legend.after(guide);
      p.legend.setAttribute("aria-describedby", guide.id);
    }
    if (p.id === "k2-bostad") {
      const guide = document.createElement("p");
      guide.className = "k2__reglagehjalp";
      guide.id = "k2-bostad-linjehjalp";
      guide.textContent = "Visa eller dölj en linje med knapparna. När en linje visas kan du välja närbild.";
      p.legend.after(guide);
      p.legend.setAttribute("aria-describedby", guide.id);
    }
    p.status = p.root.querySelector(".k2__status");
    p.download = p.root.querySelector(".k2__hamta");
    p.copyButton = p.root.querySelector(".k2__kopiera");
    p.copyButton.addEventListener("click", () => copyChart(p));
    if (p.compact) {
      p.metrics = document.createElement("div"); p.metrics.className = "k2__bostadsvarden";
      p.root.querySelector(".k2__huvud").after(p.metrics);
      if (p.id === "k2-ut" || p.id === "k2-in") {
        p.summary = document.createElement("p");
        p.summary.className = "k2__summa";
        p.summary.title = p.id === "k2-ut" ? "Summa för alla kategorier, även dolda. Beräknad från oavrundade andelar av samma startbefolkning." : "Summor för alla kategorier, även dolda. Beräknade från oavrundade andelar av samma slutbefolkning.";
        p.metrics.after(p.summary);
      }
      if (p.id === "k2-bostad") {
        const note = document.createElement("p"); note.className = "k2__lucka";
        note.textContent = "Streckat förbinder 2018 och 2020. Uppgift för 2019 saknas.";
        p.chart.after(note); const explanation = document.createElement("p"); explanation.className = "k2__gruppforklaring k2__lucka"; note.after(explanation);
      }
    }
    const choices = p.root.querySelector(".k2__val");
    if (p.multi) {
      choices.remove();
      p.toggles = p.series.map((s, i) => {
        const button = document.createElement("button");
        button.type = "button"; button.className = "k2__serie";
        const sample = node("svg", { viewBox: "0 0 34 12", "aria-hidden": "true" });
        sample.append(node("line", { x1: 1, x2: 33, y1: 6, y2: 6, stroke: colors[s.farg], "stroke-width": 2.7, "stroke-dasharray": p.compact ? "" : patterns[i] }));
        const name = document.createElement("span"); name.textContent = s.namn;
        const value = document.createElement("b");
        button.append(sample, name, value);
        button.addEventListener("click", () => {
          if (p.visible.has(i) && p.visible.size === 1) {
            p.status.textContent = "Minst en linje behöver vara synlig."; return;
          }
          if (p.visible.has(i)) p.visible.delete(i); else p.visible.add(i);
          if (p.id === "k2-bostad" && p.visible.size > 1) p.full = true;
          draw(p);
          p.status.textContent = s.namn + (p.visible.has(i) ? " visas." : " är dold.");
        });
        p.legend.append(button);
        return button;
      });
    } else if (p.series.length > 1) {
      const label = document.createElement("label");
      label.htmlFor = p.id + "-serie";
      label.textContent = "Visa utvecklingen för";
      const select = document.createElement("select");
      select.id = label.htmlFor;
      p.series.forEach((s, i) => { const o = document.createElement("option"); o.value = i; o.textContent = s.namn; select.append(o); });
      select.addEventListener("change", () => { p.selected = Number(select.value); draw(p); });
      choices.append(label, select);
    } else choices.remove();
    if (p.full !== undefined) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Visa 0–100 %";
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => { p.full = !p.full; button.textContent = p.full ? "Visa närbild" : "Visa 0–100 %"; button.setAttribute("aria-pressed", String(p.full)); draw(p); });
      p.scaleButton = button;
      p.root.querySelector(".k2__skalrad").append(button);
    }
    (["k2-total", "k2-bostad", "k2-ut", "k2-in"].includes(p.id) ? [] : [0, 8, 12]).forEach(i => {
      const b = document.createElement("button"); b.type = "button"; b.dataset.year = i; b.textContent = D.ar[i];
      b.addEventListener("click", () => chooseYear(i)); p.root.querySelector(".k2__snabbval").append(b);
    });
    const table = document.createElement("table");
    table.createCaption().textContent = "Andel (%) av " + (p.end ? "slutbefolkningen" : "startbefolkningen") + ". Årtalet avser slutårsskiftet.";
    const header = table.createTHead().insertRow();
    ["År", ...p.series.map(s => s.namn)].forEach(t => { const th = document.createElement("th"); th.scope = "col"; th.textContent = t; header.append(th); });
    const body = table.createTBody();
    D.ar.forEach((year, i) => { const row = body.insertRow(); const th = document.createElement("th"); th.scope = "row"; th.textContent = year; row.append(th); p.series.forEach(s => { row.insertCell().textContent = fmt(s.varden[i], 1); }); });
    p.root.querySelector(".k2__tabell").append(table);
    if (p.id === "k2-total" || p.compact) {
      const help = document.createElement("span");
      help.className = "k2__reglagehjalp";
      help.id = p.id + "-hjalp";
      help.textContent = ["k2-total", "k2-bostad", "k2-ut", "k2-in"].includes(p.id) ? "Dra i reglaget eller för pekaren över diagrammet." : "(Dra i reglaget eller använd knapparna)";
      p.root.querySelector('.k2__arval label').append(help);
      p.slider.setAttribute("aria-describedby", help.id);
      const controls = document.createElement("div");
      controls.className = "k2__kopiera-siffror";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Kopiera siffrorna";
      const status = document.createElement("span");
      status.setAttribute("role", "status");
      const fallback = document.createElement("textarea");
      fallback.readOnly = true;
      fallback.hidden = true;
      fallback.setAttribute("aria-label", "Tabellvärden för kopiering till Excel");
      button.addEventListener("click", async () => {
        const text = tableText(p);
        button.disabled = true;
        fallback.hidden = true;
        try {
          await navigator.clipboard.writeText(text);
          status.textContent = "Kopierat. Klistra in i Excel.";
        } catch (error) {
          fallback.value = text;
          fallback.hidden = false;
          fallback.focus();
          fallback.select();
          status.textContent = "Automatisk kopiering gick inte. Kopiera den markerade texten med Ctrl+C eller ⌘C och klistra in i Excel.";
        } finally { button.disabled = false; }
      });
      controls.append(button, status, fallback);
      p.root.querySelector(".k2__data").append(controls);
    }
  }
  function tableText(p) {
    // Tabbseparerat med svensk decimalmarkör. Enheten finns i kolumnrubriken.
    const header = ["År", ...p.series.map(s => s.namn + " (%)")];
    const rows = D.ar.map((year, i) => [year, ...p.series.map(s => s.varden[i] === null ? "" : s.varden[i].toFixed(1).replace(".", ","))]);
    return [header, ...rows].map(row => row.join("\t")).join("\r\n");
  }
  async function chartPng(p) {
    // Frys den valda vyn vid klicket, innan bildkonverteringen börjar.
    const svg = p.chart.querySelector("svg").cloneNode(true);
    const title = p.heading.textContent;
    const subtitle = "2013–2025 · " + p.scale.textContent + " · Valt årsskifte: " + period(yearIndex);
    const caption = p.caption.textContent + (p.summary ? " " + p.summary.textContent + ". Totalsiffrorna omfattar även dolda kategorier." : "") + (p.id === "k2-bostad" ? " Streckat förbinder 2018 och 2020. Uppgift för 2019 saknas. " + p.root.querySelector(".k2__gruppforklaring").textContent : "");
    const source = p.root.querySelector(".k2__kalla").textContent;
    const rows = visibleSeries(p).map(s => ({ name: s.namn, value: fmt(s.varden[yearIndex], 1), color: colors[s.farg], pattern: p.multi && !p.compact ? patterns[p.series.indexOf(s)] : "" }));
    const box = svg.getAttribute("viewBox").split(" ").map(Number);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", box[2]); svg.setAttribute("height", box[3]);
    svg.querySelectorAll("text").forEach(t => {
      t.setAttribute("fill", "#1f1f1f"); t.setAttribute("font-family", "Arial, sans-serif"); t.setAttribute("font-size", "12");
    });
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error("Diagrammet kunde inte renderas.")); image.src = url; });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Bildexport saknas i webbläsaren.");
      const w = 900, pad = 36, area = w - pad * 2;
      function wrap(text, font, max) {
        ctx.font = font;
        const lines = []; let line = "";
        text.split(/\s+/).forEach(word => {
          if (line && ctx.measureText(line + " " + word).width > max) { lines.push(line); line = word; }
          else line += (line ? " " : "") + word;
        });
        if (line) lines.push(line);
        return lines;
      }
      const headingLines = wrap(title, "800 26px Arial", area);
      const subLines = wrap(subtitle, "16px Arial", area);
      const capLines = wrap(caption, "16px Arial", area);
      const sourceLines = wrap(source, "14px Arial", area);
      const legends = rows.map(r => ({ ...r, lines: wrap(r.name, "16px Arial", area - 165) }));
      const graphH = area / box[2] * box[3];
      const height = pad * 2 + headingLines.length * 34 + subLines.length * 23 + graphH + 22
        + legends.reduce((sum, r) => sum + Math.max(30, r.lines.length * 22 + 8), 0)
        + 20 + capLines.length * 23 + sourceLines.length * 20;
      canvas.width = w * 2; canvas.height = Math.ceil(height) * 2;
      ctx.scale(2, 2); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, height);
      ctx.textBaseline = "top"; ctx.fillStyle = "#1f1f1f";
      let y = pad;
      function textLines(lines, font, spacing) { ctx.font = font; lines.forEach(line => { ctx.fillText(line, pad, y); y += spacing; }); }
      textLines(headingLines, "800 26px Arial", 34);
      textLines(subLines, "16px Arial", 23);
      y += 8; ctx.drawImage(image, pad, y, area, graphH); y += graphH + 14;
      legends.forEach(r => {
        ctx.strokeStyle = r.color; ctx.lineWidth = 3;
        ctx.setLineDash(r.pattern ? r.pattern.split(" ").map(Number) : []);
        ctx.beginPath(); ctx.moveTo(pad, y + 9); ctx.lineTo(pad + 32, y + 9); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#1f1f1f"; ctx.font = "16px Arial";
        r.lines.forEach((line, i) => ctx.fillText(line, pad + 44, y + i * 22));
        ctx.font = "bold 16px Arial"; ctx.textAlign = "right"; ctx.fillText(r.value, w - pad, y); ctx.textAlign = "left";
        y += Math.max(30, r.lines.length * 22 + 8);
      });
      y += 20;
      textLines(capLines, "16px Arial", 23);
      textLines(sourceLines, "14px Arial", 20);
      return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG kunde inte skapas.")), "image/png"));
    } finally { URL.revokeObjectURL(url); }
  }
  async function copyChart(p) {
    p.copyButton.disabled = true;
    p.status.textContent = "Skapar diagram…";
    p.download.hidden = true;
    if (p.downloadUrl) { URL.revokeObjectURL(p.downloadUrl); p.downloadUrl = null; }
    const fileName = p.id + "-" + D.ar[yearIndex] + ".png";
    const png = chartPng(p);
    try {
      if (!navigator.clipboard || !window.ClipboardItem) throw new Error("Urklipp saknas.");
      // Löftet lämnas direkt till urklippet för att behålla klickets användaraktivering.
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      p.status.textContent = "Diagrammet är kopierat. Klistra in det där du vill använda det.";
    } catch (error) {
      try {
        const blob = await png;
        p.downloadUrl = URL.createObjectURL(blob);
        p.download.href = p.downloadUrl; p.download.download = fileName; p.download.hidden = false;
        p.status.textContent = "Kopieringen gick inte. Du kan hämta samma bild som PNG.";
      } catch (renderError) {
        p.status.textContent = "Diagrammet kunde inte skapas. Försök igen.";
      }
    } finally { p.copyButton.disabled = false; }
  }

  panels.forEach(build);
  panels.forEach(draw);
  const dots = document.getElementById("punkter");
  stages.forEach((s, i) => {
    const li = document.createElement("li"), b = document.createElement("button"); b.type = "button";
    b.setAttribute("aria-label", "Steg " + (i + 1) + ": " + s.getAttribute("aria-label"));
    b.addEventListener("click", () => show(i)); li.append(b); dots.append(li);
  });
  function show(i, address = true) {
    active = Math.max(0, Math.min(stages.length - 1, i));
    stages.forEach((s, j) => { s.classList.toggle("aktiv", j === active); s.inert = j !== active; s.setAttribute("aria-hidden", String(j !== active)); });
    [...dots.querySelectorAll("button")].forEach((b, j) => b.setAttribute("aria-current", String(j === active)));
    document.getElementById("bakat").disabled = active === 0;
    document.getElementById("framat").disabled = active === stages.length - 1;
    document.getElementById("stegstatus").textContent = "Kapitel 2 · " + (active + 1) + " av " + stages.length;
    if (address) history.replaceState(null, "", "#" + stages[active].id);
    draw(panels[active]);
    window.scrollTo(0, 0);
  }
  document.getElementById("bakat").onclick = () => show(active - 1);
  document.getElementById("framat").onclick = () => show(active + 1);
  const modal = document.getElementById("metod");
  document.getElementById("oppna-metod").onclick = () => modal.showModal();
  document.getElementById("stang-metod").onclick = () => modal.close();
  modal.addEventListener("close", () => document.getElementById("oppna-metod").focus());
  document.getElementById("metod-kallor").textContent = "Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.";
  document.addEventListener("keydown", e => {
    if (modal.open || e.target.closest("button, a, input, select, textarea, summary, [role='region']")) return;
    if (["ArrowRight", "PageDown"].includes(e.key)) { show(active + 1); e.preventDefault(); }
    if (["ArrowLeft", "PageUp"].includes(e.key)) { show(active - 1); e.preventDefault(); }
  });
  let touch = null;
  document.addEventListener("touchstart", e => {
    touch = !modal.open && !e.target.closest("input, select, button, a, details") ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }, { passive: true });
  document.addEventListener("touchend", e => {
    if (!touch || modal.open) return;
    const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 2) show(active + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });
  document.addEventListener("touchcancel", () => { touch = null; }, { passive: true });
  function fromHash() { const i = stages.findIndex(s => "#" + s.id === location.hash); show(i < 0 ? 0 : i, false); }
  window.addEventListener("hashchange", fromHash);
  window.addEventListener("resize", () => draw(panels[active]));
  window.addEventListener("beforeprint", () => panels.forEach(draw));
  fromHash();
})();







