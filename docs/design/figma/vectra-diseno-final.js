/* ============================================================================
 * Vectra · Diseño Final (frames nativos) — script de plugin de Figma (Run once)
 * ----------------------------------------------------------------------------
 * Crea la página "DISEÑO FINAL" con las pantallas clave recreadas como frames
 * NATIVOS de Figma (editables), usando los colores, la tipografía y los
 * componentes reales de vectra_cure/static/css/vectra.css. No son capturas.
 *
 * Idempotente: reejecutar regenera la página. No toca "Página 1", "UI KIT"
 * ni "WIREFRAME".
 * Fuente tipográfica: Inter (swap a Instrument Sans / Manrope si las tienes).
 * ==========================================================================*/

(async () => {
  if (figma.loadAllPagesAsync) { try { await figma.loadAllPagesAsync(); } catch (e) {} }

  const C = {
    ink: "#112530", inkSoft: "#29414b", blue: "#276ef1", blueDark: "#1654c8",
    mist: "#edf6f7", mineral: "#87d7c6", sunrise: "#ffb36b", paper: "#ffffff",
    muted: "#5f7377", line: "#d7e5e7", lineDark: "#b9ced2",
    ok: "#176b5d", okBg: "#e3f7f1", warn: "#9a5a1c", warnBg: "#fff2e2",
    danger: "#8d2d1e", dangerBg: "#fff2ef", dangerBtn: "#d9482f",
    ground: "#f4f8f8",
  };
  const okStyle = {};
  for (const s of ["Regular", "Medium", "Semi Bold", "Bold"]) {
    try { await figma.loadFontAsync({ family: "Inter", style: s }); okStyle[s] = true; } catch (e) {}
  }
  if (!okStyle.Regular) { await figma.loadFontAsync({ family: "Inter", style: "Regular" }); okStyle.Regular = true; }
  const pick = (s) => (okStyle[s] ? s : (/bold/i.test(s) && okStyle.Bold ? "Bold" : "Regular"));

  const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }; };
  const fill = (hex) => [{ type: "SOLID", color: hexToRgb(hex) }];
  const grad = (a, b) => [{ type: "GRADIENT_LINEAR", gradientTransform: [[0.7, 0.7, 0], [-0.7, 0.7, 0.3]], gradientStops: [{ position: 0, color: Object.assign({ a: 1 }, hexToRgb(a)) }, { position: 1, color: Object.assign({ a: 1 }, hexToRgb(b)) }] }];

  const T = (chars, o) => {
    o = o || {};
    const t = figma.createText();
    t.fontName = { family: "Inter", style: pick(o.style || "Regular") };
    t.characters = chars;
    t.fontSize = o.size || 15;
    t.fills = fill(o.color || C.ink);
    if (o.spacing != null) t.letterSpacing = { unit: "PERCENT", value: o.spacing };
    if (o.lh != null) t.lineHeight = { unit: "PERCENT", value: o.lh };
    if (o.w) { t.textAutoResize = "HEIGHT"; t.resize(o.w, Math.max(t.height, 1)); }
    else t.textAutoResize = "WIDTH_AND_HEIGHT";
    if (o.align) t.textAlignHorizontal = o.align;
    return t;
  };
  const R = (w, h, hex, radius, strokeHex) => {
    const r = figma.createRectangle();
    r.resize(Math.max(w, 1), Math.max(h, 1));
    r.fills = Array.isArray(hex) ? hex : fill(hex);
    r.cornerRadius = radius || 0;
    if (strokeHex) { r.strokes = fill(strokeHex); r.strokeWeight = 1; }
    return r;
  };
  const F = (name, dir, o) => {
    o = o || {};
    const f = figma.createFrame();
    f.name = name;
    f.layoutMode = dir;
    f.itemSpacing = o.gap != null ? o.gap : 12;
    const p = o.pad != null ? o.pad : 0;
    f.paddingTop = o.pt != null ? o.pt : p; f.paddingBottom = o.pb != null ? o.pb : p;
    f.paddingLeft = o.pl != null ? o.pl : p; f.paddingRight = o.pr != null ? o.pr : p;
    f.primaryAxisSizingMode = o.primary || "AUTO";
    f.counterAxisSizingMode = o.counter || "AUTO";
    f.fills = o.bg ? (Array.isArray(o.bg) ? o.bg : fill(o.bg)) : [];
    if (o.radius != null) f.cornerRadius = o.radius;
    if (o.stroke) { f.strokes = fill(o.stroke); f.strokeWeight = 1; }
    if (o.clip) f.clipsContent = true;
    if (o.w) {
      if (dir === "HORIZONTAL") { f.primaryAxisSizingMode = "FIXED"; f.resize(o.w, Math.max(f.height, 1)); }
      else { f.counterAxisSizingMode = "FIXED"; f.resize(o.w, Math.max(f.height, 1)); }
    }
    if (o.align) f.counterAxisAlignItems = o.align;
    if (o.justify) f.primaryAxisAlignItems = o.justify;
    if (o.grow) f.layoutGrow = 1;
    if (o.stretch) f.layoutAlign = "STRETCH";
    return f;
  };
  const A = (parent, kids) => { kids.forEach((k) => k && parent.appendChild(k)); return parent; };

  // ---------------- Componentes reales -----------------------------------
  const icon = (hex) => R(20, 20, hex || C.blue, 6);

  const btn = (label, kind, o) => {
    o = o || {};
    const map = {
      primary: { bg: C.blue, fg: C.paper, st: C.blue },
      outline: { bg: C.paper, fg: C.ink, st: C.lineDark },
      danger: { bg: C.dangerBtn, fg: C.paper, st: C.dangerBtn },
    }[kind || "primary"];
    const b = F("btn", "HORIZONTAL", { gap: 9, pt: o.sm ? 8 : 12, pb: o.sm ? 8 : 12, pl: o.sm ? 14 : 18, pr: o.sm ? 14 : 18, radius: o.sm ? 10 : 12, bg: map.bg, stroke: map.st, align: "CENTER", justify: "CENTER" });
    if (o.block) { b.layoutAlign = "STRETCH"; b.primaryAxisAlignItems = "CENTER"; }
    A(b, [T(label, { size: o.sm ? 12 : 13, style: "Bold", color: map.fg }), o.arrow ? T("→", { size: 13, style: "Bold", color: map.fg }) : null]);
    return b;
  };
  const field = (label, ph, o) => {
    o = o || {};
    const c = F("field", "VERTICAL", { gap: 6 });
    if (o.w) { c.counterAxisSizingMode = "FIXED"; c.resize(o.w, 1); }
    if (o.grow) c.layoutGrow = 1;
    const input = F("input", "HORIZONTAL", { pt: 12, pb: 12, pl: 12, pr: 12, radius: 10, bg: C.paper, stroke: o.focus ? C.blue : C.line, align: "CENTER" });
    input.layoutAlign = "STRETCH";
    input.appendChild(T(ph, { size: 14, color: C.muted }));
    const kids = [];
    if (label) kids.push(T(label, { size: 12, style: "Bold" }));
    kids.push(input);
    A(c, kids);
    return c;
  };
  const chip = (label, bg, fg) => A(F("chip", "HORIZONTAL", { pt: 5, pb: 5, pl: 9, pr: 9, radius: 100, bg: bg || C.okBg, align: "CENTER" }), [T(label, { size: 10, style: "Bold", color: fg || C.ok })]);
  const tag = (label, kind) => {
    const m = { ok: [C.okBg, C.ok], warn: [C.warnBg, C.warn], danger: [C.dangerBg, C.danger], "": [C.mist, C.inkSoft] }[kind || ""];
    return A(F("tag", "HORIZONTAL", { pt: 5, pb: 5, pl: 10, pr: 10, radius: 100, bg: m[0], align: "CENTER" }), [T(label, { size: 11, style: "Bold", color: m[1] })]);
  };
  const stars = (n) => { const s = F("stars", "HORIZONTAL", { gap: 2 }); for (let i = 0; i < 5; i++) s.appendChild(R(14, 14, i < (n || 5) ? C.sunrise : C.lineDark, 3)); return s; };
  const avatar = (ini, sz) => { sz = sz || 48; const a = F("avatar", "HORIZONTAL", { w: sz, bg: grad(C.mineral, "#b9e8dc"), radius: 13, justify: "CENTER", align: "CENTER" }); a.resize(sz, sz); a.primaryAxisSizingMode = "FIXED"; a.counterAxisSizingMode = "FIXED"; A(a, [T(ini, { size: sz > 56 ? 20 : 15, style: "Bold", color: "#0c3b33" })]); return a; };
  const eyebrow = (x) => T(x.toUpperCase(), { size: 11, style: "Bold", color: C.blue, spacing: 12 });
  const card = (w, kids, o) => { o = o || {}; const c = F("card", "VERTICAL", { gap: o.gap != null ? o.gap : 10, pad: o.pad || 28, radius: 18, bg: C.paper, stroke: C.line, w: w }); A(c, kids); return c; };
  const divider = (w) => R(w, 1, C.line);

  const nav = (w) => {
    const n = F("nav", "HORIZONTAL", { w: w, pt: 18, pb: 18, pl: 124, pr: 124, bg: C.paper, stroke: C.line, justify: "SPACE_BETWEEN", align: "CENTER" });
    A(n, [
      A(F("logo", "HORIZONTAL", { gap: 8, align: "CENTER" }), [R(22, 22, C.blue, 6), T("Vectra Cure", { size: 20, style: "Bold" })]),
      A(F("links", "HORIZONTAL", { gap: 28 }), [T("Explorar", { size: 13, style: "Bold", color: C.muted }), T("Cómo funciona", { size: 13, style: "Bold", color: C.muted })]),
      A(F("act", "HORIZONTAL", { gap: 16, align: "CENTER" }), [T("Iniciar sesión", { size: 13, style: "Bold" }), btn("Soy paciente", "primary", { sm: true })]),
    ]);
    return n;
  };
  const footer = (w) => {
    const f = F("footer", "HORIZONTAL", { w: w, pt: 56, pb: 56, pl: 124, pr: 124, gap: 60, bg: C.ink });
    A(f, [
      A(F("fa", "VERTICAL", { gap: 10, w: 380 }), [
        A(F("fl", "HORIZONTAL", { gap: 8, align: "CENTER" }), [R(20, 20, C.blue, 6), T("Vectra Cure", { size: 16, style: "Bold", color: C.paper })]),
        T("Atención clara y cercana para encontrar, comparar y reservar especialistas en Quito.", { size: 13, color: "#b6d0d2", w: 360 }),
      ]),
      A(F("fb", "VERTICAL", { gap: 8 }), [T("PARA PACIENTES", { size: 12, style: "Bold", color: C.paper, spacing: 8 }), T("Explorar especialistas", { size: 13, color: "#b6d0d2" }), T("Cómo funciona", { size: 13, color: "#b6d0d2" })]),
      A(F("fc", "VERTICAL", { gap: 8 }), [T("PARA PROFESIONALES", { size: 12, style: "Bold", color: C.paper, spacing: 8 }), T("Publicar mi consultorio", { size: 13, color: "#b6d0d2" })]),
    ]);
    return f;
  };

  // marco de pantalla: nombre + frame del ancho dado
  const screen = (title, w, build) => {
    const wrap = F("wrap/" + title, "VERTICAL", { gap: 10 });
    const s = F(title, "VERTICAL", { w: w, gap: 0, bg: C.paper, clip: true });
    build(s, w);
    A(wrap, [T(title, { size: 13, style: "Bold" }), s]);
    return wrap;
  };
  const shell = (w, kids, o) => {
    o = o || {};
    const inner = Math.min(1192, w - 96);
    const sec = F("section", "VERTICAL", { w: w, pt: o.pt != null ? o.pt : 100, pb: o.pb != null ? o.pb : 100, gap: 0, bg: o.bg || C.paper, align: "CENTER" });
    const cont = F("shell", "VERTICAL", { w: inner, gap: o.gap != null ? o.gap : 20 });
    A(cont, kids);
    sec.appendChild(cont);
    return sec;
  };

  // ================= PANTALLAS =================
  const DW = 1440;

  // ---- Landing ----
  const landing = screen("01 · Landing", DW, (s, w) => {
    s.appendChild(nav(w));
    // hero
    const hero = F("hero", "HORIZONTAL", { w: w, pt: 96, pb: 90, pl: 124, pr: 124, gap: 64, bg: grad("#ffffff", "#ecf7f7"), align: "CENTER" });
    A(hero, [
      A(F("hl", "VERTICAL", { gap: 22, w: 620 }), [
        eyebrow("Red de salud topográfica"),
        T("Encuentra atención confiable cerca de ti.", { size: 58, style: "Bold", lh: 104, w: 600 }),
        T("Navega el mapa médico de tu ciudad con precisión. Compara especialistas verificados y agenda con información clara, humana y transparente.", { size: 18, color: C.inkSoft, lh: 160, w: 540 }),
        A(F("ha", "HORIZONTAL", { gap: 12 }), [btn("Explorar especialistas", "primary", { arrow: true }), btn("Publicar mi consultorio", "outline")]),
      ]),
      A(F("hv", "VERTICAL", { grow: true }), [R(460, 440, grad("#dff2f1", "#cde9e7"), 220)]),
    ]);
    s.appendChild(hero);
    // especialidades
    s.appendChild(shell(w, [
      eyebrow("Empieza por lo que necesitas"),
      T("Una ruta de atención que se entiende desde el primer vistazo.", { size: 44, style: "Bold", w: 720 }),
      T("El directorio es el lugar para comparar opciones; esta página solo te ayuda a orientarte.", { size: 16, color: C.muted, w: 610 }),
      (() => {
        const g = F("esp", "HORIZONTAL", { gap: 14, pt: 20 });
        ["Medicina General", "Odontología", "Dermatología", "Veterinaria", "Pediatría"].forEach((e) => {
          const c = F("e", "VERTICAL", { w: 218, gap: 14, pad: 20, radius: 18, bg: C.paper, stroke: C.line, primary: "FIXED" });
          c.resize(218, 205);
          A(c, [icon(C.blue), T(e, { size: 22, style: "Bold", w: 178 }), A(F("x", "HORIZONTAL", { gap: 6 }), [T("Explorar especialidad", { size: 13, style: "Bold", color: C.blue }), T("→", { size: 13, style: "Bold", color: C.blue })])]);
          g.appendChild(c);
        });
        return g;
      })(),
    ]));
    // destacados
    s.appendChild(shell(w, [
      eyebrow("Especialistas recomendados"),
      T("Confianza que se puede comparar.", { size: 44, style: "Bold", w: 720 }),
      (() => {
        const g = F("dr", "HORIZONTAL", { gap: 17, pt: 20 });
        [["Dr. Alejandro Morales", "Odontología · Centro Dental Santa Mónica", 5, 4],
         ["Dra. Valeria Salazar", "Dermatología · Clínica Piel & Salud", 5, 12],
         ["Dr. Camilo Andrade", "Medicina General · Consultorio Vida Sana", 4, 5]].forEach(([n, sub, r, rv]) => {
          const c = F("d", "VERTICAL", { w: 360, gap: 0, radius: 18, bg: C.paper, stroke: C.line, clip: true, primary: "FIXED" });
          A(c, [R(360, 150, grad("#cde9e7", "#fee5c9"), 0),
            A(F("b", "VERTICAL", { gap: 8, pad: 20 }), [chip("Perfil verificado"), T(n, { size: 22, style: "Bold" }), T(sub, { size: 13, color: C.muted }),
              A(F("r", "HORIZONTAL", { gap: 8, align: "CENTER" }), [stars(r), T("· " + rv + " reseñas · Atiende esta semana", { size: 13, color: C.muted })])])]);
          g.appendChild(c);
        });
        return g;
      })(),
    ], { bg: C.mist }));
    // pasos
    s.appendChild(shell(w, [
      eyebrow("El camino a tu bienestar"),
      T("Cuatro pasos, sin perderte en el proceso.", { size: 44, style: "Bold", w: 720 }),
      (() => {
        const g = F("steps", "HORIZONTAL", { gap: 22, pt: 20 });
        [["01 / EXPLORA", "Ubica lo que necesitas", "Busca por especialidad, zona, calificación o precio aproximado."],
         ["02 / COMPARA", "Conoce tus opciones", "Revisa disponibilidad, ubicación, credenciales y reseñas."],
         ["03 / AGENDA", "Elige tu momento", "Selecciona una fecha vigente y un bloque realmente disponible."],
         ["04 / CONFIRMA", "Guarda tu cita", "Recibe un ticket y administra la reserva desde tu cuenta."]].forEach(([k, h, d]) => {
          const c = F("s", "VERTICAL", { w: 270, gap: 12, pt: 28, pl: 4, pr: 4, primary: "FIXED" });
          c.resize(270, 210);
          const bar = F("bar", "VERTICAL", { w: 270 }); bar.appendChild(R(270, 2, C.blue));
          A(c, [bar, T(k, { size: 11, style: "Bold", color: C.blue, spacing: 12 }), T(h, { size: 22, style: "Bold", w: 250 }), T(d, { size: 13, color: C.muted, w: 250 })]);
          g.appendChild(c);
        });
        return g;
      })(),
    ]));
    // final CTA
    const fin = F("final", "VERTICAL", { w: w, pt: 100, pb: 100, pl: 124, pr: 124, gap: 20, bg: C.ink, align: "CENTER" });
    A(fin, [eyebrow("También para especialistas"),
      T("Haz visible tu atención donde tus pacientes ya están buscando.", { size: 48, style: "Bold", color: C.paper, align: "CENTER", w: 820 }),
      T("Publica tu consultorio, organiza tu disponibilidad y conecta con personas que necesitan tu especialidad.", { size: 15, color: "#c7dfe0", align: "CENTER", w: 560 }),
      btn("Publicar mi consultorio", "primary")]);
    s.appendChild(fin);
    s.appendChild(footer(w));
  });

  // ---- Directorio ----
  const directorio = screen("02 · Directorio", DW, (s, w) => {
    s.appendChild(nav(w));
    const ex = F("explorer", "HORIZONTAL", { w: w, gap: 0 });
    ex.counterAxisSizingMode = "FIXED"; ex.resize(w, 760);
    const drawer = F("drawer", "VERTICAL", { w: 440, gap: 12, pt: 29, pb: 32, pl: 23, pr: 23, bg: C.paper, stroke: C.line, stretch: true, clip: true });
    A(drawer, [
      eyebrow("Directorio médico"),
      T("Encuentra atención cerca de ti.", { size: 34, style: "Bold", w: 390 }),
      T("Usamos La Floresta – La Vicentina (parques) como referencia hasta que compartas tu ubicación.", { size: 13, color: C.muted, w: 390 }),
      T("QUÉ BUSCAS", { size: 10, style: "Bold", color: C.muted, spacing: 9 }),
      field("", "Nombre o consultorio", { w: 394 }),
      A(F("fr", "HORIZONTAL", { gap: 9, w: 394 }), [field("", "Todas las especialidades", { grow: true }), field("", "Mejor calificación", { grow: true })]),
      divider(394),
      T("DÓNDE", { size: 10, style: "Bold", color: C.muted, spacing: 9 }),
      A(F("fr2", "HORIZONTAL", { gap: 9, w: 394 }), [field("", "La Floresta – La Vicentina", { grow: true }), field("", "3 km alrededor", { grow: true })]),
      btn("Usar mi ubicación", "outline", { block: true }),
      btn("Actualizar resultados", "primary", { block: true }),
      T("32 ESPECIALISTAS A 5 KM · LA FLORESTA – LA VICENTINA", { size: 11, style: "Bold", color: C.muted, spacing: 10, w: 394 }),
      (() => {
        const list = F("list", "VERTICAL", { gap: 10 });
        [["VS", "Dra. Valeria Salazar", "Dermatología · ★ 4.8", "2.1 km · Lun–Sáb 08:00–18:00"],
         ["CA", "Dr. Camilo Andrade", "Medicina General · ★ 5.0", "0.8 km · Lun–Sáb 08:00–18:00"],
         ["DR", "Dra. Daniela Rueda", "Pediatría · ★ 4.6", "1.5 km · Lun–Sáb 08:00–18:00"]].forEach(([ini, n, sp, meta]) => {
          const rc = F("rc", "VERTICAL", { w: 394, gap: 0, radius: 15, bg: C.paper, stroke: C.line });
          A(rc, [A(F("rt", "HORIZONTAL", { gap: 12, pad: 14, align: "CENTER" }), [avatar(ini),
            A(F("ri", "VERTICAL", { gap: 2 }), [T(n, { size: 14, style: "Bold" }), T(sp, { size: 13, color: C.muted }), T(meta, { size: 13, color: C.muted })])])]);
          list.appendChild(rc);
        });
        return list;
      })(),
    ]);
    const map = F("map", "VERTICAL", { grow: true, stretch: true, bg: grad("#dceeed", "#e9f3f0"), justify: "CENTER", align: "CENTER" });
    A(map, [T("Mapa · Leaflet + OpenStreetMap  ·  pines de especialistas", { size: 13, color: C.muted })]);
    A(ex, [drawer, map]);
    s.appendChild(ex);
  });

  // ---- Ficha especialista ----
  const ficha = screen("03 · Ficha de especialista", DW, (s, w) => {
    s.appendChild(nav(w));
    s.appendChild(shell(w, [
      T("←  Volver al directorio", { size: 13, style: "Bold", color: C.muted }),
      A(F("dg", "HORIZONTAL", { gap: 22, pt: 8 }), [
        A(F("aside", "VERTICAL", { gap: 14, w: 348 }), [
          card(348, [
            tag("Verificado #MED-48001", "ok"),
            A(F("id", "HORIZONTAL", { gap: 13, align: "CENTER" }), [avatar("VS", 64), A(F("t", "VERTICAL", { gap: 2 }), [T("Dra. Valeria Salazar", { size: 24, style: "Bold" }), T("Dermatología", { size: 13, color: C.muted })])]),
            A(F("r", "HORIZONTAL", { gap: 8, align: "CENTER" }), [stars(5), T("4.8 (12 reseñas)", { size: 13, color: C.muted })]),
            divider(292),
            T("A 2.1 km · Av. de los Especialistas 101, Quito", { size: 13, color: C.muted, w: 292 }),
            T("Lun–Sáb, 09:00–18:30", { size: 13, color: C.muted }),
            T("Consulta desde aprox. $45.00 USD · Tasa $0.00", { size: 13, color: C.muted, w: 292 }),
          ]),
          (() => { const cc = F("cta", "VERTICAL", { w: 348, gap: 12, pad: 18, radius: 16, bg: grad("#ffffff", C.mist), stroke: C.line }); A(cc, [T("Elige fecha y una hora realmente libre. Reservas a tu nombre.", { size: 13, color: C.muted, w: 300 }), btn("Agendar cita rápida", "primary", { block: true })]); return cc; })(),
        ]),
        A(F("main", "VERTICAL", { gap: 18, grow: true }), [
          card(760, [T("Consultorio", { size: 22, style: "Bold" }), A(F("g", "HORIZONTAL", { gap: 10 }), [R(180, 120, grad("#cde9e7", "#eef9f7"), 12), R(180, 120, grad("#eef9f7", "#fee5c9"), 12), R(180, 120, grad("#fee5c9", "#cde9e7"), 12)])]),
          card(760, [T("Reseñas de pacientes", { size: 22, style: "Bold" }),
            A(F("rv1", "VERTICAL", { gap: 4, pt: 6 }), [A(F("h", "HORIZONTAL", { gap: 8, align: "CENTER" }), [stars(5), T("Camila Mendoza · 2026-08-20", { size: 12, color: C.muted })]), T("Atención rápida y profesional.", { size: 13, color: C.muted })]),
            divider(704),
            A(F("rv2", "VERTICAL", { gap: 4 }), [A(F("h", "HORIZONTAL", { gap: 8, align: "CENTER" }), [stars(4), T("Carlos Pazmiño · 2026-08-14", { size: 12, color: C.muted })]), T("Consultorio limpio y puntual.", { size: 13, color: C.muted })])]),
          card(760, [T("Deja tu reseña", { size: 22, style: "Bold" }), field("Calificación", "5 de 5", { w: 704 }), field("Comentario (opcional)", "Cuéntanos tu experiencia", { w: 704 }), btn("Publicar reseña", "primary", { block: true })]),
        ]),
      ]),
    ], { pt: 78, pb: 78 }));
  });

  // ---- helper de página centrada con una card ----
  const centered = (title, w, cardW, kids, pt) => screen(title, w, (s) => {
    s.appendChild(nav(w));
    const sec = F("sec", "VERTICAL", { w: w, pt: pt || 78, pb: 78, bg: C.paper, align: "CENTER" });
    sec.appendChild(card(cardW, kids, { pad: 36, gap: 14 }));
    s.appendChild(sec);
    s.appendChild(footer(w));
  });

  const agendar = centered("04 · Agendar", DW, 740, [
    eyebrow("Reserva segura"),
    T("Agenda con Dra. Valeria Salazar", { size: 40, style: "Bold", w: 668 }),
    T("Dermatología · Clínica Piel & Salud · Consulta aproximada $45.00", { size: 13, color: C.muted, w: 668 }),
    A(F("bg", "HORIZONTAL", { gap: 14, w: 668 }), [field("Fecha", "AAAA / MM / DD", { grow: true }), field("Hora", "Elige una fecha primero", { grow: true })]),
    field("Motivo breve de consulta", "Ej. Consulta de control", { w: 668 }),
    (() => { const fs = F("pay", "VERTICAL", { gap: 8, pt: 10, w: 668 }); fs.appendChild(R(668, 1, C.line)); A(fs, [T("Método de pago", { size: 12, style: "Bold", color: C.muted }), A(F("o1", "HORIZONTAL", { gap: 9, align: "CENTER" }), [R(16, 16, C.blue, 8), T("Pago digital simulado", { size: 13 })]), A(F("o2", "HORIZONTAL", { gap: 9, align: "CENTER" }), [R(16, 16, C.paper, 8, C.lineDark), T("Pago en ventanilla", { size: 13 })])]); return fs; })(),
    btn("Continuar con mi reserva", "primary", { block: true }),
  ]);

  const pago = centered("05 · Pago simulado", DW, 440, [
    tag("Entorno simulado · no se transfiere dinero real", "warn"),
    T("Vectra Cure Pay", { size: 40, style: "Bold" }),
    T("Estás a punto de aprobar el pago simulado de tu consulta con Dra. Valeria Salazar.", { size: 13, color: C.muted, w: 368 }),
    divider(368),
    A(F("m1", "HORIZONTAL", { w: 368, justify: "SPACE_BETWEEN" }), [T("Consulta Dermatología", { size: 13, color: C.muted }), T("$45.00 USD", { size: 13 })]),
    A(F("m2", "HORIZONTAL", { w: 368, justify: "SPACE_BETWEEN" }), [T("Tasa de plataforma", { size: 13, color: C.muted }), T("$0.00 USD", { size: 13 })]),
    divider(368),
    A(F("mt", "HORIZONTAL", { w: 368, justify: "SPACE_BETWEEN" }), [T("Total", { size: 16, style: "Bold" }), T("$45.00 USD", { size: 16, style: "Bold" })]),
    btn("Aprobar pago simulado", "primary", { block: true }),
    T("Cancelar y volver", { size: 13, color: C.muted }),
  ]);

  const exito = screen("06 · Cita confirmada", DW, (s, w) => {
    s.appendChild(nav(w));
    const sec = F("sec", "VERTICAL", { w: w, pt: 78, pb: 78, gap: 18, bg: C.paper, align: "CENTER" });
    A(sec, [
      A(F("mark", "HORIZONTAL", { w: 68, bg: C.okBg, radius: 34, justify: "CENTER", align: "CENTER" }), [T("✓", { size: 30, style: "Bold", color: C.ok })]),
      T("RESERVA COMPLETADA", { size: 11, style: "Bold", color: C.blue, spacing: 12, align: "CENTER" }),
      T("¡Cita confirmada!", { size: 44, style: "Bold", align: "CENTER" }),
      T("Notificación enviada a +593 99 200 1000 y paciente@correo.com.", { size: 13, color: C.muted, align: "CENTER", w: 520 }),
      (() => {
        const tk = F("ticket", "VERTICAL", { w: 520, gap: 0, radius: 18, bg: C.paper, stroke: C.line, clip: true });
        A(tk, [A(F("hd", "VERTICAL", { gap: 8, pt: 24, pb: 20, pl: 26, pr: 26, bg: grad("#ffffff", "#f3f9fa"), align: "CENTER" }), [T("COMPROBANTE DE CITA", { size: 11, style: "Bold", color: C.blue, spacing: 10 }), T("VC-2026-3005", { size: 28, style: "Bold", spacing: 8 })]),
          R(520, 1, C.lineDark),
          (() => { const b = F("body", "VERTICAL", { gap: 0, pt: 20, pb: 24, pl: 26, pr: 26 });
            [["Especialista", "Dra. Valeria Salazar"], ["Especialidad", "Dermatología"], ["Consultorio", "Clínica Piel & Salud"], ["Fecha y hora", "2026-09-12 · 14:00"], ["Tolerancia", "15 min"], ["Total aprox.", "$45.00 USD"], ["Pago", "Pagado · transacción simulada"]].forEach((row, i) => {
              const r = F("r", "HORIZONTAL", { w: 468, pt: 7, pb: 7, justify: "SPACE_BETWEEN" });
              A(r, [T(row[0], { size: 13, color: C.muted }), T(row[1], { size: 13 })]);
              if (i) b.appendChild(R(468, 1, C.line));
              b.appendChild(r);
            });
            return b; })()]);
        return tk;
      })(),
      A(F("acts", "HORIZONTAL", { gap: 12, pt: 6 }), [btn("Descargar ticket (.md)", "primary"), btn("Ver / gestionar mi cita", "outline")]),
    ]);
    s.appendChild(sec);
  });

  const regPac = centered("07 · Registro de paciente", DW, 880, [
    eyebrow("Tu atención comienza aquí"),
    T("Crear cuenta", { size: 32, style: "Bold" }),
    A(F("seg", "HORIZONTAL", { gap: 6, pt: 6, pb: 6, pl: 5, pr: 5, radius: 12, bg: C.mist, w: 808 }), [
      A(F("a1", "HORIZONTAL", { grow: true, pt: 10, pb: 10, radius: 8, bg: C.paper, justify: "CENTER" }), [T("Soy paciente", { size: 13, style: "Bold", color: C.blue })]),
      A(F("a2", "HORIZONTAL", { grow: true, pt: 10, pb: 10, radius: 8, justify: "CENTER" }), [T("Soy especialista", { size: 13, style: "Bold", color: C.inkSoft })]),
    ]),
    T("Datos personales", { size: 16, style: "Bold", pt: 8 }),
    A(F("g", "HORIZONTAL", { gap: 16, w: 808 }), [field("Nombre completo", "Nombre y apellido", { grow: true }), field("Teléfono / WhatsApp", "+593 …", { grow: true })]),
    A(F("g2", "HORIZONTAL", { gap: 16, w: 808 }), [field("Correo electrónico", "nombre@correo.com", { grow: true }), field("Contraseña (mín. 6)", "••••••", { grow: true })]),
    btn("Registrarme", "primary", { block: true }),
    T("¿Ya tienes cuenta? Inicia sesión", { size: 13, color: C.muted }),
  ]);

  const regMed = centered("08 · Registro de especialista", DW, 880, [
    eyebrow("Tu atención comienza aquí"),
    T("Crear cuenta", { size: 32, style: "Bold" }),
    T("Datos personales", { size: 16, style: "Bold" }),
    A(F("g", "HORIZONTAL", { gap: 16, w: 808 }), [field("Nombre completo", "", { grow: true }), field("Teléfono / WhatsApp", "", { grow: true })]),
    A(F("g2", "HORIZONTAL", { gap: 16, w: 808 }), [field("Correo electrónico", "", { grow: true }), field("Contraseña", "", { grow: true })]),
    T("Verificación de títulos y consultorio", { size: 16, style: "Bold", pt: 8 }),
    A(F("g3", "HORIZONTAL", { gap: 16, w: 808 }), [field("Especialidad", "Dermatología", { grow: true }), field("N° de colegiatura", "MED-…", { grow: true })]),
    A(F("g4", "HORIZONTAL", { gap: 16, w: 808 }), [field("Nombre del consultorio", "", { grow: true }), field("Precio aprox. (USD)", "45.00", { grow: true })]),
    field("Dirección", "Calle y número, sector, Quito", { w: 808 }),
    A(F("g5", "HORIZONTAL", { gap: 16, w: 808 }), [field("Latitud", "-0.196", { grow: true }), field("Longitud", "-78.483", { grow: true }), field("Horario", "09:00 - 18:30", { grow: true })]),
    field("Foto del consultorio (opcional)", "Subir imagen", { w: 808 }),
    btn("Completar registro de especialista", "primary", { block: true }),
  ]);

  const misCitas = screen("09 · Mis citas", DW, (s, w) => {
    s.appendChild(nav(w));
    s.appendChild(shell(w, [
      eyebrow("Tu atención organizada"),
      T("Mis citas", { size: 44, style: "Bold" }),
      T("Solo tú puedes ver y administrar las reservas asociadas a tu cuenta.", { size: 16, color: C.muted, w: 610 }),
      (() => {
        const g = F("g", "HORIZONTAL", { gap: 16, pt: 12 });
        [["Confirmada", "Dra. Valeria Salazar", "Dermatología · 12/09/2026 a las 14:00", "Clínica Piel & Salud · $45.00 aprox."],
         ["Completada", "Dr. Camilo Andrade", "Medicina General · 02/09/2026 a las 10:00", "Consultorio Vida Sana · $25.00 aprox."]].forEach(([st, n, l1, l2]) => {
          const c = F("c", "VERTICAL", { w: 380, gap: 8, pad: 26, radius: 17, bg: C.paper, stroke: C.line, primary: "FIXED" });
          c.resize(380, 214);
          A(c, [chip(st, C.mist, C.inkSoft), T(n, { size: 22, style: "Bold" }), T(l1, { size: 13, color: C.muted, w: 320 }), T(l2, { size: 13, color: C.muted, w: 320 }), btn("Ver cita", "outline", { sm: true })]);
          g.appendChild(c);
        });
        return g;
      })(),
    ]));
  });

  const detalle = centered("10 · Detalle de cita", DW, 880, [
    A(F("ch", "HORIZONTAL", { w: 808, justify: "SPACE_BETWEEN", align: "MIN" }), [
      A(F("l", "VERTICAL", { gap: 6 }), [eyebrow("Detalle de la reserva"), T("Ticket #VC-2026-3005", { size: 32, style: "Bold" }), tag("Confirmada", "")]),
      T("2026-09-01 18:00", { size: 13, color: C.muted }),
    ]),
    divider(808),
    A(F("g", "HORIZONTAL", { gap: 16, w: 808 }), [
      A(F("c1", "VERTICAL", { gap: 6, grow: true }), [T("PACIENTE", { size: 12, style: "Bold", color: C.muted, spacing: 7 }), T("Nombre · teléfono · correo", { size: 13, color: C.muted }), T("ESPECIALISTA", { size: 12, style: "Bold", color: C.muted, spacing: 7, pt: 10 }), T("Dra. Valeria Salazar · Dermatología\nClínica Piel & Salud · Dirección", { size: 13, color: C.muted, w: 380 })]),
      A(F("c2", "VERTICAL", { gap: 6, grow: true }), [T("CITA", { size: 12, style: "Bold", color: C.muted, spacing: 7 }), T("2026-09-12 · 14:00\nMotivo: Consulta de control\nTotal aprox.: $45.00 USD", { size: 13, color: C.muted, w: 380 }), T("PAGO", { size: 12, style: "Bold", color: C.muted, spacing: 7, pt: 10 }), T("Pago digital simulado\nEstado: Pagado · transacción simulada", { size: 13, color: C.muted, w: 380 })]),
    ]),
    A(F("acts", "HORIZONTAL", { gap: 9, pt: 6 }), [btn("Volver a descargar ticket (.md)", "outline"), btn("Cancelar cita", "danger")]),
  ]);

  const cancelar = centered("11 · Cancelar cita", DW, 760, [
    eyebrow("Cancelación"),
    T("Cancelar cita #VC-2026-3005", { size: 40, style: "Bold", w: 688 }),
    T("Cuéntanos el motivo. Si tu pago fue digital, se emitirá un reverso / reembolso simulado y el turno quedará disponible para otros pacientes.", { size: 13, color: C.muted, w: 688 }),
    (() => {
      const g = F("m", "VERTICAL", { gap: 8, pt: 6 });
      ["Problemas de horario o imprevisto personal", "Encontré atención médica en otro lugar más rápido", "Ya no presento molestias o síntomas médicos", "Inconveniente con el costo o método de pago", "Otros"].forEach((m, i) => {
        A(g, [A(F("r", "HORIZONTAL", { gap: 10, align: "CENTER" }), [R(16, 16, i === 0 ? C.blue : C.paper, 8, i === 0 ? C.blue : C.lineDark), T((i + 1) + ". " + m, { size: 13, style: "Medium" })])]);
      });
      return g;
    })(),
    A(F("acts", "HORIZONTAL", { gap: 9, pt: 4 }), [btn("Confirmar cancelación", "danger"), btn("Volver", "outline")]),
  ]);

  const panel = screen("12 · Panel profesional", DW, (s, w) => {
    s.appendChild(nav(w));
    s.appendChild(shell(w, [
      eyebrow("Panel profesional"),
      T("Todo lo esencial, de un vistazo.", { size: 44, style: "Bold", w: 720 }),
      (() => {
        const g = F("g", "HORIZONTAL", { gap: 16, pt: 12 });
        [["Próximas citas", "3", "12/09 14:00 · Camila M.\n13/09 10:00 · Carlos P."],
         ["Balance estimado", "$180.00", "Suma demostrativa de reservas confirmadas."],
         ["Visibilidad del perfil", "Activa", "★ 4.8 · 12 reseñas\nVer mi perfil público →"]].forEach(([l, big, sub]) => {
          const c = F("c", "VERTICAL", { w: 380, gap: 10, pad: 26, radius: 17, bg: C.paper, stroke: C.line, primary: "FIXED" });
          c.resize(380, 214);
          A(c, [T(l, { size: 13, color: C.muted }), T(big, { size: 44, style: "Bold" }), T(sub, { size: 13, color: C.muted, w: 320 })]);
          g.appendChild(c);
        });
        return g;
      })(),
    ]));
  });

  const login = centered("13 · Iniciar sesión", DW, 440, [
    eyebrow("Bienvenido de vuelta"),
    T("Iniciar sesión", { size: 40, style: "Bold" }),
    field("Correo electrónico", "nombre@correo.com", { w: 368 }),
    field("Contraseña", "••••••", { w: 368 }),
    btn("Ingresar", "primary", { block: true }),
    T("¿No tienes cuenta? Regístrate", { size: 13, color: C.muted }),
  ]);

  const modal = screen("14 · Modal · Agenda tu cita", DW, (s, w) => {
    const bg = F("bg", "VERTICAL", { w: w, pt: 120, pb: 120, bg: "#0d1c24", align: "CENTER" });
    bg.opacity = 1;
    const m = card(454, [
      eyebrow("Reserva segura"),
      T("Agenda tu cita", { size: 36, style: "Bold" }),
      T("Dra. Valeria Salazar · Dermatología · consulta aprox. $45.00", { size: 13, color: C.muted, w: 382 }),
      field("Fecha", "AAAA / MM / DD", { w: 382 }),
      field("Hora", "Elige una fecha primero", { w: 382 }),
      T("Elige una fecha para ver las horas libres.", { size: 13, color: C.muted }),
      field("Motivo breve de consulta", "Ej. Consulta de control", { w: 382 }),
      (() => { const fs = F("pay", "VERTICAL", { gap: 8, pt: 10, w: 382 }); fs.appendChild(R(382, 1, C.line)); A(fs, [T("Método de pago", { size: 12, style: "Bold", color: C.muted }), A(F("o1", "HORIZONTAL", { gap: 9, align: "CENTER" }), [R(16, 16, C.blue, 8), T("Pago digital simulado", { size: 13 })]), A(F("o2", "HORIZONTAL", { gap: 9, align: "CENTER" }), [R(16, 16, C.paper, 8, C.lineDark), T("Pago en ventanilla", { size: 13 })])]); return fs; })(),
      btn("Continuar con mi reserva", "primary", { block: true }),
      T("Abrir la página completa de reserva", { size: 13, color: C.muted }),
    ], { pad: 36, gap: 12 });
    bg.appendChild(m);
    s.appendChild(bg);
  });

  // ================= PÁGINA =================
  let page = figma.root.children.find((p) => p.name === "DISEÑO FINAL");
  if (page) { try { page.children.slice().forEach((c) => c.remove()); } catch (e) {} }
  else { page = figma.createPage(); page.name = "DISEÑO FINAL"; }

  const root = F("Vectra Cure · Diseño final (frames)", "VERTICAL", { gap: 64, pad: 64, bg: C.ground });
  root.x = 0; root.y = 0;
  A(root, [
    A(F("h", "VERTICAL", { gap: 6 }), [
      T("VECTRA CURE", { size: 11, style: "Bold", color: C.blue, spacing: 14 }),
      T("Diseño final", { size: 40, style: "Bold" }),
      T("Pantallas clave recreadas como frames nativos con los tokens reales de vectra.css. Editable en Figma.", { size: 13, color: C.muted }),
    ]),
  ]);

  const rowA = F("fila", "HORIZONTAL", { gap: 80, align: "MIN" });
  [landing, directorio, ficha, agendar, pago, exito, regPac, regMed, misCitas, detalle, cancelar, panel, login, modal].forEach((sc) => rowA.appendChild(sc));
  root.appendChild(rowA);

  page.appendChild(root);
  try {
    if (figma.setCurrentPageAsync) await figma.setCurrentPageAsync(page);
    figma.viewport.scrollAndZoomIntoView([root]);
  } catch (e) {}
  figma.notify("DISEÑO FINAL: 14 pantallas nativas creadas");
  figma.closePlugin("Listo: DISEÑO FINAL (frames nativos)");
})().catch((err) => {
  figma.notify("Error: " + err.message, { error: true });
  figma.closePlugin("Falló: " + err.message);
});
