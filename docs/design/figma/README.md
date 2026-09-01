# Figma — plugins de generación

Dos plugins de desarrollo de Figma para poblar el archivo de diseño desde el
código real. Ambos son idempotentes (reejecutar regenera su página; no tocan
"Página 1").

## 1. `vectra-kit-builder.js` — UI KIT + WIREFRAME

Plugin **"Run once"** (sin UI). Pega el contenido en el `code.js` de un plugin
de desarrollo y ejecútalo.

- **UI KIT**: tokens de color y tipografía de `vectra_cure/static/css/vectra.css`,
  y componentes (botones, inputs, chips, alertas, estrellas, avatar, cards, nav, footer).
- **WIREFRAME**: los 5 flujos (registro de paciente · buscar y agendar · agendar
  rápido · consultar/cancelar · alta de especialista) a 3 breakpoints
  (375 / 768 / 1280). Low-fi.

## 2. `vectra-final-design/` — DISEÑO FINAL

Plugin **con UI** (`manifest.json` + `code.js` + `ui.html`). Crea un plugin de
desarrollo "con UI" y reemplaza los tres archivos.

Al abrirlo, arrastra los PNG de [`screens/`](./screens) (o elígelos). Crea la
página **DISEÑO FINAL** con cada captura como frame a escala, agrupada por
Escritorio / Móvil, más una leyenda de tokens.

### `screens/` — capturas de la app real

Generadas con Chrome headless contra el servidor Flask local
(`docs/design/figma/screens/*.png`). Para regenerarlas: levantar la app y
volver a correr el script de captura (ver historial de commits). Numeradas por
flujo; sufijo `-desktop` / `-mobile`.
