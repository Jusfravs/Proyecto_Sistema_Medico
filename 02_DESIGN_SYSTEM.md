# 02. Sistema de Diseño (Design System)

**Proyecto:** Vectra Cure — Plataforma de Geolocalización y Agendamiento Médico  
**Módulo:** Tokens de Color, Tipografía, Componentes y Estética Apple Desktop

---

## 1. Filosofía Visual

* **Estética Apple Desktop:** Sobria, nítida, moderna, de alta confianza clínica y serenidad humana.
* **Espaciado y Superficies:** Márgenes amplios (*whitespace*), bordes suaves redondeados (`rounded-2xl`), sombras difusas sutiles y efectos de desenfoque de fondo (*glassmorphism* / `backdrop-blur`).
* **Soporte Dual Theme:** Modo Claro (Clean Light) y Modo Oscuro (Refined Dark).

---

## 2. Paleta de Colores Oficial

### 2.1. Tokens Semánticos de Marca

| Rol | Token | Código HEX | Uso en la Interfaz |
| :--- | :--- | :--- | :--- |
| **Primario** | `primary-blue` | `#0284C7` | Botones de acción, enlaces activos, pines del mapa. |
| **Primario Hover** | `primary-dark` | `#0369A1` | Estados hover y encabezados de alto contraste. |
| **Secundario / Acento** | `accent-mint` | `#10B981` | Insignia de verificación (🛡️), etiqueta "Abierto Ahora" y confirmaciones. |
| **Fondo Acento** | `accent-light` | `#D1FAE5` | Fondo de badges de estado y chips activos. |

---

### 2.2. Tema Claro (Clean Light Theme)

| Elemento | Token | Código HEX | Descripción |
| :--- | :--- | :--- | :--- |
| **Fondo General** | `bg-main` | `#F8FAFC` (Slate 50) | Suave, descansa la vista frente al blanco puro. |
| **Superficies / Tarjetas** | `bg-surface` | `#FFFFFF` (Pure White) | Tarjetas, modales y barra de búsqueda con sombra sutil. |
| **Texto Principal** | `text-primary` | `#0F172A` (Slate 900) | Títulos, nombres de doctores y precios nítidos. |
| **Texto Secundario** | `text-secondary` | `#64748B` (Slate 500) | Distancias, horarios y cantidad de reseñas. |
| **Bordes** | `border-subtle` | `#E2E8F0` (Slate 200) | Líneas divisorias y contornos limpios. |

---

### 2.3. Tema Oscuro (Refined Dark Theme — Apple Style)

| Elemento | Token | Código HEX | Descripción |
| :--- | :--- | :--- | :--- |
| **Fondo General** | `bg-dark-main` | `#090D16` (Deep Space Dark) | Fondo ultra profundo sin fatiga visual. |
| **Superficies / Tarjetas** | `bg-dark-surface` | `#131B2E` (Dark Slate) | Tarjetas elevadas con contorno `border-slate-800`. |
| **Texto Principal** | `text-dark-primary`| `#F8FAFC` (Slate 50) | Títulos nítidos de alto contraste. |
| **Texto Secundario** | `text-dark-secondary`| `#94A3B8` (Slate 400) | Datos secundarios y distancias. |
| **Bordes** | `border-dark-subtle`| `#1E293B` (Slate 800) | Bordes sobrios minimalistas. |

---

## 3. Tipografía Oficial

### 3.1. Familias Tipográficas
* **Títulos y Botones (Display):** `Plus Jakarta Sans`
  * *Fuente:* [Google Fonts — Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
  * *Pesos:* 600 (SemiBold), 700 (Bold).
  * *Carácter:* Moderna, geométrica, elegante y con presencia sólida.
* **Cuerpo de Texto y Datos (Body & UI):** `Inter`
  * *Fuente:* [Google Fonts — Inter](https://fonts.google.com/specimen/Inter)
  * *Pesos:* 400 (Regular), 500 (Medium).
  * *Carácter:* Máxima legibilidad para distancias numéricas, horas y precios.

### 3.2. Escala Tipográfica
```css
/* Escala de Tipografía */
--font-h1:   36px / 44px 'Plus Jakarta Sans', sans-serif; /* Títulos principales */
--font-h2:   24px / 32px 'Plus Jakarta Sans', sans-serif; /* Secciones y modales */
--font-h3:   18px / 26px 'Plus Jakarta Sans', sans-serif; /* Título de tarjeta médica */
--font-body: 15px / 24px 'Inter', sans-serif;             /* Párrafos y descripciones */
--font-data: 13px / 18px 'Inter', sans-serif;             /* Distancias, horarios, precios */
```

---

## 4. Componentes UI Clave

### 4.1. Tarjeta del Especialista (Doctor Card) — Jerarquía Oficial

```
┌─────────────────────────────────────────────────────────────┐
│ [ FOTO DEL CONSULTORIO / ESPECIALISTA (Google Maps Scrape) ]│
│ 🏷️ Insignia: "🛡️ Especialista Verificado #MED-48291"       │
├─────────────────────────────────────────────────────────────┤
│ Dr. Alejandro Morales                                       │
│ 🦷 Odontología (Endodoncia)                                 │
│                                                             │
│ ⭐ 4.9 ★★★★★ (128 reseñas verificadas)                     │
│ 📍 A 1.2 km de tu ubicación (5 min en auto)                 │
│ 🕒 Abierto hoy: 09:00 - 18:30 • Próximo turno: Hoy 15:00   │
│ 💵 Consulta desde aprox. $35.00 USD                         │
│                                                             │
│ [ 👤 Ver Perfil ]             [ ⚡ Agendar Cita Rápida ]     │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.2. Panel Lateral Interactivo (*Slide-Over Drawer*)

* **Comportamiento:** Al hacer clic en `Ver Perfil` o sobre la tarjeta, se despliega suavemente un panel lateral hacia la derecha.
* **Contenido Dinámico:**
  1. **Galería de Fotos:** Imágenes del consultorio e instalaciones.
  2. **Contenido adaptado al filtro:** Reseñas detalladas de pacientes si se filtró por reputación, o desglose de tarifas si se filtró por precio.
  3. **Cierre Inteligente:** Se contrae automáticamente hacia la izquierda al scrollear o hacer clic fuera del panel.
