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

## 2. `vectra-diseno-final.js` — DISEÑO FINAL (frames nativos)

Plugin **"Run once"** (sin UI). Pega el contenido en el `code.js` de un plugin
de desarrollo y ejecútalo.

Crea la página **DISEÑO FINAL** con 14 pantallas clave recreadas como **frames
nativos de Figma** (editables), usando los colores, la tipografía y los
componentes reales de `vectra.css` — no son capturas:

landing · directorio · ficha de especialista · agendar · pago simulado ·
cita confirmada · registro paciente · registro especialista · mis citas ·
detalle de cita · cancelar cita · panel profesional · login · modal agendar.

## 3. `vectra-final-design/` — alternativa: importar capturas

Plugin **con UI** (`manifest.json` + `code.js` + `ui.html`). Si en vez de
frames nativos prefieres las **capturas reales** de la app en Figma: crea un
plugin de desarrollo "con UI", reemplaza los tres archivos, y arrastra los PNG
de [`screens/`](./screens). Crea la página **DISEÑO FINAL** con cada captura
como frame a escala.

> Los dos plugins escriben en la misma página "DISEÑO FINAL"; usa uno u otro.

### `screens/` — capturas de la app real

Generadas con Chrome headless contra el servidor Flask local. Numeradas por
flujo; sufijo `-desktop` / `-mobile`. Solo las usa el plugin de la opción 3.
