/* ============================================================================
 * Vectra Kit Builder — script de plugin de Figma (Run once)
 * ----------------------------------------------------------------------------
 * Crea dos páginas en el archivo abierto:
 *   · UI KIT     — tokens de color, tipografía y componentes de vectra.css
 *   · WIREFRAME  — 5 flujos low-fi de la app (1 = registro de paciente)
 * La "Página 1" no se toca. Reejecutar regenera UI KIT y WIREFRAME (idempotente).
 *
 * Fuente: vectra_cure/static/css/vectra.css y vectra_cure/templates/*.html
 * Fuente tipográfica: usa "Inter" (siempre disponible en Figma). El diseño real
 * usa "Instrument Sans" (títulos) y "Manrope" (texto); cámbialas luego si están
 * instaladas en tu Figma.
 * ==========================================================================*/

(async () => {
  if (figma.loadAllPagesAsync) { try { await figma.loadAllPagesAsync(); } catch (e) {} }

  // ---- Tokens (vectra.css :root) -------------------------------------------
  const C = {
    ink: "#112530", inkSoft: "#29414b", blue: "#276ef1", blueDark: "#1654c8",
    mist: "#edf6f7", mineral: "#87d7c6", sunrise: "#ffb36b", paper: "#ffffff",
    muted: "#5f7377", line: "#d7e5e7", lineDark: "#b9ced2",
    ok: "#176b5d", okBg: "#e3f7f1", warn: "#9a5a1c", warnBg: "#fff2e2",
    danger: "#8d2d1e", dangerBg: "#fff2ef", dangerBtn: "#d9482f",
    wire: "#e9eef0", wireDark: "#cfd9dc", wireText: "#8a9aa0",
  };
  const FONT = "Inter";
  const styles = ["Regular", "Medium", "Semi Bold", "Bold"];
  const okStyle = {};
  for (const s of styles) {
    try { await figma.loadFontAsync({ family: FONT, style: s }); okStyle[s] = true; } catch (e) {}
  }
  if (!okStyle["Regular"]) { await figma.loadFontAsync({ family: FONT, style: "Regular" }); okStyle["Regular"] = true; }
  const pick = (s) => (okStyle[s] ? s : (okStyle["Bold"] && /bold/i.test(s) ? "Bold" : "Regular"));

  // ---- Helpers ------------------------------------------------------------
  const hexToRgb = (h) => {
    const n = parseInt(h.slice(1), 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  };
  const fill = (hex) => [{ type: "SOLID", color: hexToRgb(hex) }];

  const text = (chars, opts = {}) => {
    const t = figma.createText();
    t.fontName = { family: FONT, style: pick(opts.style || "Regular") };
    t.characters = chars;
    t.fontSize = opts.size || 14;
    t.fills = fill(opts.color || C.ink);
    if (opts.spacing != null) t.letterSpacing = { unit: "PERCENT", value: opts.spacing };
    if (opts.lineHeight != null) t.lineHeight = { unit: "PIXELS", value: opts.lineHeight };
    if (opts.width) { t.textAutoResize = "HEIGHT"; t.resize(opts.width, t.height); }
    else t.textAutoResize = "WIDTH_AND_HEIGHT";
    if (opts.align) t.textAlignHorizontal = opts.align;
    return t;
  };

  const rect = (w, h, hex, radius = 0, strokeHex) => {
    const r = figma.createRectangle();
    r.resize(w, h);
    r.fills = fill(hex);
    r.cornerRadius = radius;
    if (strokeHex) { r.strokes = fill(strokeHex); r.strokeWeight = 1; }
    return r;
  };

  // auto-layout frame
  const box = (name, dir, opts = {}) => {
    const f = figma.createFrame();
    f.name = name;
    f.layoutMode = dir; // "VERTICAL" | "HORIZONTAL"
    f.itemSpacing = opts.gap != null ? opts.gap : 12;
    const p = opts.pad != null ? opts.pad : 0;
    f.paddingTop = opts.pt != null ? opts.pt : p;
    f.paddingBottom = opts.pb != null ? opts.pb : p;
    f.paddingLeft = opts.pl != null ? opts.pl : p;
    f.paddingRight = opts.pr != null ? opts.pr : p;
    f.primaryAxisSizingMode = opts.primary || "AUTO";
    f.counterAxisSizingMode = opts.counter || "AUTO";
    f.fills = opts.bg ? fill(opts.bg) : [];
    if (opts.radius != null) f.cornerRadius = opts.radius;
    if (opts.stroke) { f.strokes = fill(opts.stroke); f.strokeWeight = opts.strokeW || 1; }
    if (opts.w) {
      if (dir === "HORIZONTAL") { f.primaryAxisSizingMode = "FIXED"; f.resize(opts.w, Math.max(f.height, 1)); }
      else { f.counterAxisSizingMode = "FIXED"; f.resize(opts.w, Math.max(f.height, 1)); }
    }
    if (opts.align) f.counterAxisAlignItems = opts.align; // "MIN"|"CENTER"|"MAX"
    if (opts.justify) f.primaryAxisAlignItems = opts.justify;
    return f;
  };
  const add = (parent, ...kids) => { kids.forEach((k) => parent.appendChild(k)); return parent; };

  // ---- Componentes de kit ------------------------------------------------
  const swatch = (name, hex) => {
    const w = box("swatch/" + name, "VERTICAL", { gap: 8 });
    add(w, rect(150, 72, hex, 10, C.line),
        add(box("t", "VERTICAL", { gap: 2 }),
            text(name, { size: 12, style: "Semi Bold" }),
            text(hex.toUpperCase(), { size: 11, color: C.muted })));
    return w;
  };

  const button = (label, kind) => {
    const map = {
      primary: { bg: C.blue, fg: C.paper, stroke: C.blue },
      outline: { bg: C.paper, fg: C.ink, stroke: C.lineDark },
      danger: { bg: C.dangerBtn, fg: C.paper, stroke: C.dangerBtn },
    }[kind || "primary"];
    const b = box("btn/" + (kind || "primary"), "HORIZONTAL",
      { gap: 9, pt: 12, pb: 12, pl: 18, pr: 18, radius: 12, bg: map.bg, stroke: map.stroke,
        justify: "CENTER", align: "CENTER" });
    add(b, text(label, { size: 13, style: "Bold", color: map.fg }));
    return b;
  };

  const input = (placeholder, focus) => {
    const f = box("input", "HORIZONTAL",
      { pt: 12, pb: 12, pl: 12, pr: 12, radius: 10, bg: C.paper,
        stroke: focus ? C.blue : C.line, strokeW: focus ? 2 : 1, w: 280, align: "CENTER" });
    f.paddingTop = 12; f.paddingBottom = 12;
    add(f, text(placeholder, { size: 14, color: C.muted }));
    return f;
  };

  const pill = (label, bg, fg) => {
    const p = box("pill", "HORIZONTAL", { pt: 5, pb: 5, pl: 10, pr: 10, radius: 100, bg,
      align: "CENTER" });
    add(p, text(label, { size: 11, style: "Bold", color: fg }));
    return p;
  };

  const alert = (label, bg, border, fg) => {
    const a = box("alert", "HORIZONTAL", { pt: 13, pb: 13, pl: 16, pr: 16, radius: 13,
      bg, stroke: border, w: 360, align: "CENTER" });
    add(a, text(label, { size: 13, style: "Medium", color: fg, width: 320 }));
    return a;
  };

  const stars = () => {
    const s = box("stars", "HORIZONTAL", { gap: 3 });
    for (let i = 0; i < 5; i++) s.appendChild(rect(14, 14, i < 4 ? C.sunrise : C.lineDark, 3));
    return s;
  };

  const avatar = (initials) => {
    const a = box("avatar", "HORIZONTAL", { w: 48, bg: C.mineral, radius: 13,
      justify: "CENTER", align: "CENTER" });
    a.resize(48, 48); a.counterAxisSizingMode = "FIXED"; a.primaryAxisSizingMode = "FIXED";
    add(a, text(initials, { size: 15, style: "Bold", color: "#0c3b33" }));
    return a;
  };

  const kitCard = (title, body) => {
    const c = box("card", "VERTICAL", { gap: 8, pad: 20, radius: 15, bg: C.paper, stroke: C.line, w: 300 });
    add(c, text(title, { size: 15, style: "Bold" }), text(body, { size: 13, color: C.muted, width: 260 }));
    return c;
  };

  const section = (title, ...kids) => {
    const s = box("section/" + title, "VERTICAL", { gap: 18 });
    add(s, text(title.toUpperCase(), { size: 11, style: "Bold", color: C.blue, spacing: 12 }));
    const row = box("row", "HORIZONTAL", { gap: 20 });
    row.counterAxisAlignItems = "MIN";
    kids.forEach((k) => row.appendChild(k));
    add(s, row);
    return s;
  };

  // ============================ PÁGINA: UI KIT ============================
  const upsertPage = (name) => {
    let p = figma.root.children.find((pg) => pg.name === name);
    if (p) { try { p.children.slice().forEach((c) => c.remove()); } catch (e) {} }
    else { p = figma.createPage(); p.name = name; }
    return p;
  };

  const kit = upsertPage("UI KIT");
  figma.currentPage = kit;

  const kitRoot = box("Vectra Cure · UI Kit", "VERTICAL", { gap: 44, pad: 64, bg: "#f7fafa" });
  kitRoot.x = 0; kitRoot.y = 0;
  add(kitRoot,
    add(box("head", "VERTICAL", { gap: 6 }),
      text("VECTRA CURE", { size: 11, style: "Bold", color: C.blue, spacing: 14 }),
      text("UI Kit", { size: 40, style: "Bold" }),
      text("Tokens y componentes reales de vectra_cure/static/css/vectra.css", { size: 13, color: C.muted })));

  // Colores
  add(kitRoot, section("Color",
    swatch("ink", C.ink), swatch("ink-soft", C.inkSoft), swatch("blue", C.blue),
    swatch("blue-dark", C.blueDark), swatch("mist", C.mist), swatch("mineral", C.mineral),
    swatch("sunrise", C.sunrise), swatch("muted", C.muted), swatch("line", C.line),
    swatch("line-dark", C.lineDark), swatch("ok / ok-bg", C.okBg), swatch("warn-bg", C.warnBg),
    swatch("danger-bg", C.dangerBg), swatch("danger-btn", C.dangerBtn)));

  // Tipografía
  add(kitRoot, section("Tipografía",
    add(box("type", "VERTICAL", { gap: 14 }),
      text("Display / Hero — Instrument Sans", { size: 52, style: "Bold" }),
      text("Section title", { size: 40, style: "Bold" }),
      text("H3 · 22", { size: 22, style: "Semi Bold" }),
      text("Cuerpo · Manrope 15/1.6. El directorio compara opciones y el paciente reserva.", { size: 15, width: 620 }),
      text("EYEBROW · 11 · UPPERCASE · +12%", { size: 11, style: "Bold", color: C.blue, spacing: 12 }),
      text("Dato secundario · 13 · muted", { size: 13, color: C.muted }))));

  // Botones
  add(kitRoot, section("Botones",
    button("Explorar especialistas", "primary"),
    button("Publicar consultorio", "outline"),
    button("Cancelar cita", "danger")));

  // Formularios
  const formCol = box("f", "VERTICAL", { gap: 12 });
  const chkRow = box("chk", "HORIZONTAL", { gap: 10, align: "CENTER" });
  add(chkRow, rect(16, 16, C.paper, 4, C.lineDark), text("Pago en ventanilla", { size: 13 }));
  add(formCol,
    text("Correo electrónico", { size: 12, style: "Bold" }),
    input("nombre@correo.com"),
    text("Con foco", { size: 12, style: "Bold" }),
    input("nombre@correo.com", true),
    chkRow);
  add(kitRoot, section("Formularios", formCol));

  // Chips / tags
  add(kitRoot, section("Chips y estados",
    pill("✓ Verificado", C.okBg, C.ok),
    pill("Confirmada", C.mist, C.inkSoft),
    pill("Pendiente", C.warnBg, C.warn),
    pill("Cancelada", C.dangerBg, C.danger)));

  // Feedback
  add(kitRoot, section("Feedback",
    alert("Usamos tu zona de referencia hasta que compartas tu ubicación.", C.mist, C.line, C.ink),
    alert("Cita cancelada. Reverso simulado emitido.", "#ecfbf5", "#b9e6da", C.ok),
    alert("Saldo pendiente: el pago en efectivo se realiza en la ventanilla del consultorio.", C.dangerBg, "#ffd1c8", C.danger)));

  // Datos
  add(kitRoot, section("Datos",
    add(box("d", "HORIZONTAL", { gap: 12, align: "CENTER" }), stars(), text("4.7 · 12 reseñas", { size: 13, color: C.muted })),
    add(box("d2", "HORIZONTAL", { gap: 12, align: "CENTER" }), avatar("AR"), text("Dra. Andrea Rueda", { size: 14, style: "Bold" }))));

  // Cards
  const resultCard = box("result-card", "VERTICAL", { gap: 4, pad: 14, radius: 15, bg: C.paper, stroke: C.line, w: 300 });
  add(resultCard,
    add(box("top", "HORIZONTAL", { gap: 12, align: "CENTER" }), avatar("VS"),
      add(box("i", "VERTICAL", { gap: 2 }),
        text("Dra. Valeria Salazar", { size: 14, style: "Bold" }),
        text("Dermatología · ★ 4.8", { size: 13, color: C.muted }),
        text("2.1 km · Lun–Sáb 08:00–18:00", { size: 13, color: C.muted }))));

  const doctorCard = box("doctor-card", "VERTICAL", { gap: 0, radius: 18, bg: C.paper, stroke: C.line, w: 260 });
  doctorCard.clipsContent = true;
  add(doctorCard, rect(260, 150, C.wire, 0),
    add(box("body", "VERTICAL", { gap: 8, pad: 20 }),
      pill("✓ Perfil verificado", C.okBg, C.ok),
      text("Dr. Camilo Andrade", { size: 20, style: "Bold" }),
      text("Medicina General · Consultorio Vida Sana", { size: 13, color: C.muted }),
      add(box("r", "HORIZONTAL", { gap: 8, align: "CENTER" }), stars(), text("5.0 · 8 reseñas", { size: 12, color: C.muted }))));

  const modalCard = box("modal-card", "VERTICAL", { gap: 12, pad: 36, radius: 22, bg: C.paper, stroke: C.line, w: 360 });
  add(modalCard,
    text("RESERVA SEGURA", { size: 11, style: "Bold", color: C.blue, spacing: 10 }),
    text("Agenda tu cita", { size: 30, style: "Bold" }),
    text("Fran · Dermatología · consulta aprox. $40.00", { size: 13, color: C.muted }),
    input("Fecha"), input("Hora"),
    button("Continuar con mi reserva", "primary"));

  add(kitRoot, section("Cards", resultCard, doctorCard, modalCard, kitCard("Card genérica", "Borde, aire y una sombra mínima. Base de perfil, panel y detalle de cita.")));

  // Nav + footer
  const nav = box("nav", "HORIZONTAL", { pt: 20, pb: 20, pl: 32, pr: 32, bg: C.paper, stroke: C.line, w: 1000, justify: "SPACE_BETWEEN", align: "CENTER" });
  add(nav, text("Vectra Cure", { size: 18, style: "Bold" }),
    add(box("links", "HORIZONTAL", { gap: 28 }), text("Explorar", { size: 13, style: "Bold", color: C.muted }), text("Cómo funciona", { size: 13, style: "Bold", color: C.muted })),
    add(box("act", "HORIZONTAL", { gap: 16, align: "CENTER" }), text("Iniciar sesión", { size: 13, style: "Bold" }), button("Soy paciente", "primary")));
  const footer = box("footer", "HORIZONTAL", { pt: 40, pb: 40, pl: 32, pr: 32, bg: C.ink, w: 1000, gap: 60 });
  add(footer, text("Vectra Cure", { size: 16, style: "Bold", color: C.paper }),
    text("Atención clara y cercana para encontrar, comparar y reservar especialistas en Quito.", { size: 13, color: "#b6d0d2", width: 360 }));
  add(kitRoot, section("Navegación", nav, footer));

  kit.appendChild(kitRoot);

  // ============================ PÁGINA: WIREFRAME ============================
  const wf = upsertPage("WIREFRAME");
  figma.currentPage = wf;

  const SW = 300, SH = 620;

  // una "pantalla" wireframe: header + bloques
  const screen = (title, blocks) => {
    const s = box("screen/" + title, "VERTICAL", { gap: 10, pad: 16, radius: 14, bg: C.paper, stroke: C.wireDark, w: SW });
    s.primaryAxisSizingMode = "FIXED"; s.resize(SW, SH); s.clipsContent = true;
    add(s, add(box("hd", "HORIZONTAL", { gap: 8, pb: 8, justify: "SPACE_BETWEEN", align: "CENTER" }),
      text("Vectra Cure", { size: 11, style: "Bold" }), text("Menu", { size: 12, color: C.wireText })));
    blocks.forEach((bl) => {
      if (bl.t === "h") s.appendChild(text(bl.x, { size: 17, style: "Bold" }));
      else if (bl.t === "p") s.appendChild(text(bl.x, { size: 11, color: C.wireText, width: SW - 32 }));
      else if (bl.t === "eyebrow") s.appendChild(text(bl.x.toUpperCase(), { size: 9, style: "Bold", color: C.blue, spacing: 10 }));
      else if (bl.t === "field") {
        const f = box("field", "VERTICAL", { gap: 4 });
        add(f, text(bl.x, { size: 9, style: "Bold", color: C.wireText }), rect(SW - 32, 30, C.wire, 8, C.wireDark));
        s.appendChild(f);
      }
      else if (bl.t === "btn") {
        const b = box("wbtn", "HORIZONTAL", { pt: 10, pb: 10, radius: 9, bg: bl.kind === "outline" ? C.paper : C.blue, stroke: bl.kind === "outline" ? C.wireDark : C.blue, w: SW - 32, justify: "CENTER" });
        add(b, text(bl.x, { size: 11, style: "Bold", color: bl.kind === "outline" ? C.ink : C.paper }));
        s.appendChild(b);
      }
      else if (bl.t === "map") s.appendChild(rect(SW - 32, bl.h || 150, C.wire, 8, C.wireDark));
      else if (bl.t === "img") s.appendChild(rect(SW - 32, bl.h || 90, C.wire, 8, C.wireDark));
      else if (bl.t === "card") {
        const c = box("wcard", "VERTICAL", { gap: 5, pad: 10, radius: 9, bg: "#fbfdfd", stroke: C.wireDark, w: SW - 32 });
        add(c, text(bl.x, { size: 11, style: "Bold" }));
        (bl.lines || []).forEach((ln) => c.appendChild(text(ln, { size: 9, color: C.wireText })));
        s.appendChild(c);
      }
      else if (bl.t === "rows") {
        (bl.items || []).forEach((it) => {
          const r = box("wrow", "HORIZONTAL", { gap: 8, pad: 8, radius: 8, bg: "#fbfdfd", stroke: C.wireDark, w: SW - 32, align: "CENTER" });
          add(r, rect(28, 28, C.wire, 6), text(it, { size: 10, color: C.wireText, width: SW - 90 }));
          s.appendChild(r);
        });
      }
      else if (bl.t === "spacer") s.appendChild(rect(1, bl.h || 8, "#ffffff"));
    });
    return s;
  };

  const arrow = () => {
    const a = box("→", "HORIZONTAL", { justify: "CENTER", align: "CENTER" });
    a.resize(40, SH); a.primaryAxisSizingMode = "FIXED"; a.counterAxisSizingMode = "FIXED";
    add(a, text("→", { size: 22, color: C.muted }));
    return a;
  };

  const flow = (n, title, screens) => {
    const f = box("Flujo " + n, "VERTICAL", { gap: 16 });
    add(f, add(box("lbl", "VERTICAL", { gap: 4 }),
      text("FLUJO " + n, { size: 11, style: "Bold", color: C.blue, spacing: 12 }),
      text(title, { size: 22, style: "Bold" })));
    const row = box("screens", "HORIZONTAL", { gap: 0, align: "MIN" });
    screens.forEach((sc, i) => { row.appendChild(sc); if (i < screens.length - 1) row.appendChild(arrow()); });
    add(f, row);
    return f;
  };

  const wfRoot = box("Vectra Cure · Wireframes", "VERTICAL", { gap: 72, pad: 64, bg: "#f7fafa" });
  wfRoot.x = 0; wfRoot.y = 0;
  add(wfRoot, add(box("h", "VERTICAL", { gap: 6 }),
    text("VECTRA CURE", { size: 11, style: "Bold", color: C.blue, spacing: 14 }),
    text("Wireframes — 5 flujos", { size: 40, style: "Bold" }),
    text("Low-fi. Estructura y navegación, no diseño visual.", { size: 13, color: C.muted })));

  // ---- Flujo 1: Registro de paciente ----
  add(wfRoot, flow(1, "Registro de paciente", [
    screen("Landing", [
      { t: "eyebrow", x: "Red de salud" },
      { t: "h", x: "Encuentra atención confiable cerca de ti" },
      { t: "p", x: "Compara especialistas verificados y agenda con información clara." },
      { t: "img", h: 130 },
      { t: "btn", x: "Explorar especialistas" },
      { t: "btn", x: "Soy paciente", kind: "outline" },
    ]),
    screen("Modal · Crear cuenta", [
      { t: "eyebrow", x: "Tu atención comienza aquí" },
      { t: "h", x: "Crea tu cuenta de paciente" },
      { t: "field", x: "Nombre completo" },
      { t: "field", x: "Correo" },
      { t: "field", x: "Teléfono" },
      { t: "field", x: "Contraseña (mín. 6)" },
      { t: "btn", x: "Crear cuenta y explorar" },
      { t: "p", x: "¿Eres especialista? Publica tu consultorio" },
    ]),
    screen("Registro (página)", [
      { t: "h", x: "Crear cuenta" },
      { t: "card", x: "[ Soy paciente ] · Soy especialista", lines: ["control segmentado"] },
      { t: "eyebrow", x: "Datos personales" },
      { t: "field", x: "Nombre completo" },
      { t: "field", x: "Teléfono / WhatsApp" },
      { t: "field", x: "Correo electrónico" },
      { t: "field", x: "Contraseña" },
      { t: "btn", x: "Registrarme" },
    ]),
    screen("Directorio (sesión iniciada)", [
      { t: "eyebrow", x: "Directorio médico" },
      { t: "h", x: "Encuentra atención cerca de ti" },
      { t: "field", x: "Buscar nombre o consultorio" },
      { t: "field", x: "Especialidad · Orden" },
      { t: "map", h: 120 },
      { t: "rows", items: ["Dra. Salazar · Dermatología · 2.1 km", "Dr. Andrade · M. General · 0.8 km"] },
    ]),
  ]));

  // ---- Flujo 2: Buscar y agendar (completo) ----
  add(wfRoot, flow(2, "Buscar y agendar una cita", [
    screen("Directorio", [
      { t: "eyebrow", x: "Directorio médico" },
      { t: "field", x: "Buscar" },
      { t: "field", x: "Especialidad · Orden · Zona · Radio" },
      { t: "btn", x: "Actualizar resultados" },
      { t: "map", h: 110 },
      { t: "rows", items: ["Especialista + rating + distancia", "…"] },
    ]),
    screen("Ficha de especialista", [
      { t: "p", x: "← Volver al directorio" },
      { t: "card", x: "✓ Verificado #MED-48001", lines: ["Dra. Valeria Salazar", "Dermatología · ★ 4.8 (12)", "2.1 km · 09:00–18:30 · desde $45"] },
      { t: "btn", x: "Agendar cita" },
      { t: "img", h: 70 },
      { t: "card", x: "Reseñas de pacientes", lines: ["★★★★★ Camila — Atención rápida", "★★★★☆ Carlos — Consultorio limpio"] },
    ]),
    screen("Agendar", [
      { t: "eyebrow", x: "Reserva segura" },
      { t: "h", x: "Agenda con Dra. Salazar" },
      { t: "field", x: "Fecha" },
      { t: "field", x: "Hora (horas libres del día)" },
      { t: "field", x: "Motivo breve" },
      { t: "card", x: "Método de pago", lines: ["( ) Pago digital simulado", "( ) Pago en ventanilla"] },
      { t: "btn", x: "Continuar con mi reserva" },
    ]),
    screen("Pago simulado", [
      { t: "card", x: "Entorno simulado", lines: ["no se transfiere dinero real"] },
      { t: "h", x: "Vectra Cure Pay" },
      { t: "card", x: "Desglose", lines: ["Consulta Dermatología  $45.00", "Tasa de plataforma     $0.00", "Total                  $45.00"] },
      { t: "btn", x: "Aprobar pago simulado" },
      { t: "p", x: "Cancelar y volver" },
    ]),
    screen("Cita confirmada", [
      { t: "eyebrow", x: "Reserva completada" },
      { t: "h", x: "¡Cita confirmada!" },
      { t: "p", x: "Notificación enviada al teléfono y correo." },
      { t: "card", x: "Comprobante VC-2026-XXXX", lines: ["Especialista · Especialidad", "Consultorio · Dirección", "Fecha y hora · Total · Pago"] },
      { t: "btn", x: "Descargar ticket (.md)" },
      { t: "btn", x: "Ver / gestionar mi cita", kind: "outline" },
    ]),
  ]));

  // ---- Flujo 3: Agendar rápido (modal) ----
  add(wfRoot, flow(3, "Agendar rápido desde el directorio", [
    screen("Directorio · card", [
      { t: "eyebrow", x: "Directorio médico" },
      { t: "map", h: 110 },
      { t: "card", x: "Dra. Salazar · Dermatología", lines: ["2.1 km · ★ 4.8", "[ Ruta ]  [ Ver perfil ]  [ Agendar ]"] },
      { t: "card", x: "Dr. Andrade · M. General", lines: ["0.8 km · ★ 5.0"] },
    ]),
    screen("Modal · Agenda tu cita", [
      { t: "eyebrow", x: "Reserva segura" },
      { t: "h", x: "Agenda tu cita" },
      { t: "p", x: "Dra. Salazar · Dermatología · aprox. $45" },
      { t: "field", x: "Fecha" },
      { t: "field", x: "Hora" },
      { t: "field", x: "Motivo breve" },
      { t: "card", x: "Método de pago", lines: ["( ) Digital   ( ) Ventanilla"] },
      { t: "btn", x: "Continuar con mi reserva" },
      { t: "p", x: "Abrir la página completa de reserva" },
    ]),
    screen("Pago simulado", [
      { t: "h", x: "Vectra Cure Pay" },
      { t: "card", x: "Total  $45.00 USD", lines: ["Consulta  $45.00", "Tasa      $0.00"] },
      { t: "btn", x: "Aprobar pago simulado" },
    ]),
    screen("Cita confirmada", [
      { t: "h", x: "¡Cita confirmada!" },
      { t: "card", x: "Comprobante VC-2026-XXXX", lines: ["Ticket con todos los datos"] },
      { t: "btn", x: "Descargar ticket (.md)" },
    ]),
  ]));

  // ---- Flujo 4: Consultar / cancelar cita ----
  add(wfRoot, flow(4, "Consultar y cancelar una cita", [
    screen("Mis citas", [
      { t: "eyebrow", x: "Tu atención organizada" },
      { t: "h", x: "Mis citas" },
      { t: "p", x: "Solo tú ves las reservas de tu cuenta." },
      { t: "card", x: "Confirmada · Dra. Salazar", lines: ["Dermatología · 12/09 14:00", "Consultorio · $45 aprox.", "[ Ver cita ]"] },
      { t: "card", x: "Completada · Dr. Andrade", lines: ["M. General · 02/09 10:00"] },
    ]),
    screen("Detalle de la cita", [
      { t: "eyebrow", x: "Detalle de la reserva" },
      { t: "h", x: "Ticket #VC-2026-XXXX" },
      { t: "card", x: "Estado: Confirmada", lines: ["Paciente · Especialista", "Fecha/hora · Motivo · Total", "Pago: método y estado"] },
      { t: "btn", x: "Volver a descargar ticket", kind: "outline" },
      { t: "btn", x: "Cancelar cita", kind: "outline" },
    ]),
    screen("Cancelar cita", [
      { t: "eyebrow", x: "Cancelación" },
      { t: "h", x: "Cancelar cita #VC-2026-XXXX" },
      { t: "p", x: "Si el pago fue digital se emite reverso simulado y el turno se libera." },
      { t: "card", x: "Motivo", lines: ["( ) Imprevisto personal", "( ) Encontré atención más rápido", "( ) Ya no tengo síntomas", "( ) Costo / pago", "( ) Otros → detalle"] },
      { t: "btn", x: "Confirmar cancelación" },
    ]),
    screen("Procesando", [
      { t: "spacer", h: 180 },
      { t: "p", x: "Procesando reverso y liberando cupo médico…" },
    ]),
    screen("Cancelada + reverso", [
      { t: "h", x: "Ticket #VC-2026-XXXX" },
      { t: "card", x: "Estado: Cancelada", lines: ["Motivo de cancelación registrado", "Pago: Reembolso simulado emitido"] },
      { t: "p", x: "El turno vuelve a estar disponible." },
    ]),
  ]));

  // ---- Flujo 5: Alta de especialista ----
  add(wfRoot, flow(5, "Alta de especialista", [
    screen("Landing · para especialistas", [
      { t: "eyebrow", x: "También para especialistas" },
      { t: "h", x: "Haz visible tu atención donde tus pacientes buscan" },
      { t: "p", x: "Publica tu consultorio y organiza tu disponibilidad." },
      { t: "btn", x: "Publicar mi consultorio" },
    ]),
    screen("Registro (tipo médico)", [
      { t: "h", x: "Crear cuenta" },
      { t: "card", x: "Soy paciente · [ Soy especialista ]" },
      { t: "eyebrow", x: "Datos personales" },
      { t: "field", x: "Nombre · Teléfono · Correo · Contraseña" },
      { t: "eyebrow", x: "Verificación y consultorio" },
      { t: "field", x: "Especialidad · Nº colegiatura" },
      { t: "field", x: "Consultorio · Precio · Dirección" },
      { t: "field", x: "Latitud · Longitud · Horario" },
      { t: "field", x: "Foto del consultorio (opcional)" },
      { t: "btn", x: "Completar registro de especialista" },
    ]),
    screen("Panel profesional", [
      { t: "eyebrow", x: "Panel profesional" },
      { t: "h", x: "Todo lo esencial, de un vistazo" },
      { t: "card", x: "Próximas citas: 3", lines: ["12/09 14:00 · Camila M.", "13/09 10:00 · Carlos P."] },
      { t: "card", x: "Balance estimado: $180.00", lines: ["Reservas confirmadas"] },
      { t: "card", x: "Visibilidad: Activa", lines: ["★ 4.8 · 12 reseñas", "Ver mi perfil público →"] },
    ]),
  ]));

  wf.appendChild(wfRoot);

  // ---- Cerrar ----
  figma.currentPage = kit;
  figma.viewport.scrollAndZoomIntoView([kitRoot]);
  figma.notify("Vectra Kit Builder: páginas UI KIT y WIREFRAME creadas");
  figma.closePlugin("Listo: UI KIT + WIREFRAME (5 flujos)");
})().catch((err) => {
  figma.notify("Error en Vectra Kit Builder: " + err.message, { error: true });
  figma.closePlugin("Falló: " + err.message);
});
