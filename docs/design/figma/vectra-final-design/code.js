/* ============================================================================
 * Vectra · Diseño Final — plugin de Figma con UI
 * ----------------------------------------------------------------------------
 * Importa las capturas reales de la app (docs/design/figma/screens/*.png) a
 * una página nueva "DISEÑO FINAL": cada pantalla como frame a escala, agrupada
 * por dispositivo (Escritorio / Móvil) y rotulada, con una leyenda de los
 * tokens de color y tipografía reales de vectra.css.
 *
 * Idempotente: reejecutar borra y recrea la página DISEÑO FINAL.
 * ==========================================================================*/

figma.showUI(__html__, { width: 360, height: 360 });

const C = {
  ink: "#112530", inkSoft: "#29414b", blue: "#276ef1", blueDark: "#1654c8",
  mist: "#edf6f7", mineral: "#87d7c6", sunrise: "#ffb36b", paper: "#ffffff",
  muted: "#5f7377", line: "#d7e5e7", lineDark: "#b9ced2",
  okBg: "#e3f7f1", warnBg: "#fff2e2", dangerBg: "#fff2ef", dangerBtn: "#d9482f",
};

const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};
const fill = (hex) => [{ type: "SOLID", color: hexToRgb(hex) }];

let FONT_OK = { Regular: false, Bold: false, "Semi Bold": false };
const pick = (s) => (FONT_OK[s] ? s : "Regular");

const text = (chars, opts) => {
  opts = opts || {};
  const t = figma.createText();
  t.fontName = { family: "Inter", style: pick(opts.style || "Regular") };
  t.characters = chars;
  t.fontSize = opts.size || 13;
  t.fills = fill(opts.color || C.ink);
  if (opts.spacing != null) t.letterSpacing = { unit: "PERCENT", value: opts.spacing };
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  return t;
};
const rect = (w, h, hex, radius, strokeHex) => {
  const r = figma.createRectangle();
  r.resize(Math.max(w, 1), Math.max(h, 1));
  r.fills = fill(hex);
  r.cornerRadius = radius || 0;
  if (strokeHex) { r.strokes = fill(strokeHex); r.strokeWeight = 1; }
  return r;
};
const box = (name, dir, o) => {
  o = o || {};
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.itemSpacing = o.gap != null ? o.gap : 12;
  const p = o.pad != null ? o.pad : 0;
  f.paddingTop = o.pt != null ? o.pt : p;
  f.paddingBottom = o.pb != null ? o.pb : p;
  f.paddingLeft = o.pl != null ? o.pl : p;
  f.paddingRight = o.pr != null ? o.pr : p;
  f.primaryAxisSizingMode = o.primary || "AUTO";
  f.counterAxisSizingMode = o.counter || "AUTO";
  f.fills = o.bg ? fill(o.bg) : [];
  if (o.radius != null) f.cornerRadius = o.radius;
  if (o.stroke) { f.strokes = fill(o.stroke); f.strokeWeight = 1; }
  if (o.w) {
    if (dir === "HORIZONTAL") { f.primaryAxisSizingMode = "FIXED"; f.resize(o.w, Math.max(f.height, 1)); }
    else { f.counterAxisSizingMode = "FIXED"; f.resize(o.w, Math.max(f.height, 1)); }
  }
  if (o.align) f.counterAxisAlignItems = o.align;
  return f;
};
const add = (parent, kids) => { kids.forEach((k) => parent.appendChild(k)); return parent; };

const niceName = (raw) => {
  // "02-directorio-desktop" -> "02 · Directorio (Escritorio)"
  const m = raw.match(/^(\d+)[-_]?(.*?)[-_](desktop|escritorio|mobile|movil|m)$/i);
  if (!m) return raw;
  const num = m[1];
  const slug = m[2].replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const dev = /mobile|movil|^m$/i.test(m[3]) ? "Móvil" : "Escritorio";
  return `${num} · ${slug} (${dev})`;
};
const isMobile = (raw) => /(mobile|movil)(\b|$)|[-_]m$/i.test(raw);

figma.ui.onmessage = async (msg) => {
  if (!msg || msg.type !== "import") return;
  try {
    if (figma.loadAllPagesAsync) await figma.loadAllPagesAsync();
    for (const s of ["Regular", "Bold", "Semi Bold"]) {
      try { await figma.loadFontAsync({ family: "Inter", style: s }); FONT_OK[s] = true; } catch (e) {}
    }
    if (!FONT_OK.Regular) { await figma.loadFontAsync({ family: "Inter", style: "Regular" }); FONT_OK.Regular = true; }

    // ---- página ----
    let page = figma.root.children.find((p) => p.name === "DISEÑO FINAL");
    if (page) { try { page.children.slice().forEach((c) => c.remove()); } catch (e) {} }
    else { page = figma.createPage(); page.name = "DISEÑO FINAL"; }

    const root = box("Vectra Cure · Diseño final", "VERTICAL", { gap: 56, pad: 64, bg: "#f4f8f8" });
    root.x = 0; root.y = 0;

    // encabezado
    const header = box("h", "VERTICAL", { gap: 6 });
    add(header, [
      text("VECTRA CURE", { size: 11, style: "Bold", color: C.blue, spacing: 14 }),
      text("Diseño final", { size: 40, style: "Bold" }),
      text("Capturas de la aplicación real (Flask + vectra.css). Estado actual, no maqueta.", { size: 13, color: C.muted }),
    ]);
    root.appendChild(header);

    // leyenda de tokens
    const legend = box("Tokens", "VERTICAL", { gap: 16 });
    add(legend, [text("TOKENS", { size: 11, style: "Bold", color: C.blue, spacing: 12 })]);
    const swRow = box("sw", "HORIZONTAL", { gap: 12 });
    [["ink", C.ink], ["ink-soft", C.inkSoft], ["blue", C.blue], ["blue-dark", C.blueDark],
     ["mist", C.mist], ["mineral", C.mineral], ["sunrise", C.sunrise], ["muted", C.muted],
     ["line", C.line], ["line-dark", C.lineDark], ["ok-bg", C.okBg], ["warn-bg", C.warnBg],
     ["danger-bg", C.dangerBg], ["danger-btn", C.dangerBtn]].forEach(([n, hex]) => {
      const sw = box("swatch", "VERTICAL", { gap: 6 });
      add(sw, [rect(110, 56, hex, 8, C.line),
        text(n, { size: 11, style: "Semi Bold" }),
        text(hex.toUpperCase(), { size: 10, color: C.muted })]);
      swRow.appendChild(sw);
    });
    legend.appendChild(swRow);
    legend.appendChild(text("Tipografía: Instrument Sans (títulos) · Manrope (texto) · fallback Arial. Iconos: sistema SVG propio.", { size: 12, color: C.muted }));
    root.appendChild(legend);

    // ---- pantallas ----
    const groups = { Escritorio: [], "Móvil": [] };
    for (const it of msg.items) {
      const img = figma.createImage(it.bytes);
      let size;
      try { size = await img.getSizeAsync(); } catch (e) { size = { width: it.w || 1200, height: it.h || 800 }; }
      const mob = isMobile(it.name);
      const dispW = mob ? 300 : 1160;
      const dispH = Math.max(1, Math.round(dispW * size.height / size.width));

      const card = box("card/" + it.name, "VERTICAL", { gap: 8 });
      const fr = figma.createFrame();
      fr.name = niceName(it.name);
      fr.resize(dispW, dispH);
      fr.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: img.hash }];
      fr.cornerRadius = 10;
      fr.clipsContent = true;
      fr.strokes = fill(C.lineDark);
      fr.strokeWeight = 1;
      add(card, [text(niceName(it.name), { size: 12, style: "Bold" }), fr]);
      (mob ? groups["Móvil"] : groups.Escritorio).push(card);
    }

    const perRow = { Escritorio: 2, "Móvil": 4 };
    for (const g of ["Escritorio", "Móvil"]) {
      if (!groups[g].length) continue;
      const sec = box("Seccion/" + g, "VERTICAL", { gap: 28 });
      add(sec, [
        add(box("sh", "VERTICAL", { gap: 4 }), [
          text(g.toUpperCase(), { size: 22, style: "Bold", color: C.blue, spacing: 4 }),
          text(groups[g].length + " pantallas", { size: 12, color: C.muted }),
        ]),
      ]);
      const grid = box("grid", "VERTICAL", { gap: 40 });
      for (let i = 0; i < groups[g].length; i += perRow[g]) {
        const row = box("row", "HORIZONTAL", { gap: 40, align: "MIN" });
        groups[g].slice(i, i + perRow[g]).forEach((c) => row.appendChild(c));
        grid.appendChild(row);
      }
      sec.appendChild(grid);
      root.appendChild(sec);
    }

    page.appendChild(root);
    try {
      if (figma.setCurrentPageAsync) await figma.setCurrentPageAsync(page);
      figma.viewport.scrollAndZoomIntoView([root]);
    } catch (e) {}

    figma.ui.postMessage({ type: "done", count: msg.items.length });
    figma.notify("DISEÑO FINAL: " + msg.items.length + " pantallas importadas");
    setTimeout(() => figma.closePlugin("Listo"), 800);
  } catch (err) {
    figma.ui.postMessage({ type: "error", message: err.message });
    figma.notify("Error: " + err.message, { error: true });
  }
};
