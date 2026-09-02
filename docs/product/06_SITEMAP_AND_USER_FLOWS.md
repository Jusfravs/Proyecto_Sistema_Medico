# 06. Mapa del Sitio y Flujos de Usuario (Sitemap & User Flows)

**Proyecto:** Vectra Cure — Plataforma de Geolocalización y Agendamiento Médico  
**Módulo:** Arquitectura de Navegación (Sitemap), Pantallas, Modales Flotantes y Diagramas de Flujo

---

## 1. Mapa del Sitio (Sitemap & Arquitectura de Pantallas)

```mermaid
graph TD
    %% Navegación Principal
    A[🏠 Home / Landing Page] -->|Botón Probar / Explorar| B[🗺️ App Principal / Split View Mapa + Directorio]
    A -->|Botón Navbar| C[❓ Sección ¿Cómo Funciona?]
    A -->|Botón Navbar| D[🔎 Barra Lateral: Consultar mi Cita Opción A]
    A -->|Botón Navbar| E[🪟 Ventana Flotante: Registro / Login]

    %% App Principal y Componentes
    B -->|Clic en Tarjeta| B1[🗂️ Side Drawer Expandido: Fotos & Reseñas]
    B1 -->|Clic Agendar| B2[📝 Modal de Agendamiento en 2 Pasos]
    B2 -->|Checkout| B3[💳 Pasarela: PayPal Mock / Efectivo Ventanilla]
    B3 -->|Confirmación| B4[📄 Pantalla de Éxito + Descarga Ticket .md]

    %% Búsqueda sin Resultados (Empty State)
    B -->|Sin resultados < 3km| B5[⚠️ Empty State: Ampliar a 5, 8, 10 km + Sugerencia Medicina General]

    %% Barra Lateral de Citas (Opción A)
    D -->|Ingresa Código Ticket o Celular| D1[📋 Ficha de Cita Activa]
    D1 -->|Acción 1| D2[⬇️ Volver a Descargar Ticket .md]
    D1 -->|Acción 2| D3[❌ Cancelar Cita: 5 Motivos + Carga + Visto Verde ✅]

    %% Ventana Flotante de Especialistas
    E -->|Opción A| E1[👤 Registro de Paciente]
    E -->|Opción B| E2[🩺 Registro de Especialista: ⏳ En Revisión 2-3 min -> Badge 🛡️]

    %% Footer
    A --> F[📄 Footer Global]
    B --> F
    F --> F1[🩺 Catálogo de 5 Especialidades]
    F --> F2[📜 Políticas de Inasistencia & Cancelación]
    F --> F3[❓ Preguntas Frecuentes FAQ]
    F --> F4[✉️ Formulario de Contacto de Soporte]
```

---

## 2. Descripción de Pantallas y Componentes de Navegación

### 2.1. Pantalla 1: Home / Landing Page (Estilo Skiper UI / Recent Design)
* **Hero Section Dinámico:** Titular de alto impacto (*"Encuentra especialistas médicos verificados cerca de ti en segundos"*), microanimaciones fluidas y botón principal: `[ ⚡ Probar Plataforma / Explorar Mapa ]`.
* **Showcase de Características:** Tarjetas interactivas con las ventajas clave (Transparencia en precios, insignias de verificación 🛡️, geolocalización en tiempo real y agendamiento sin llamadas).
* **Catálogo de 5 Especialidades:** Selector visual con iconos (Medicina General, Odontología, Dermatología, Veterinaria, Pediatría).
* **Estadísticas de Confianza:** Indicadores de satisfacción, tiempos de agendamiento y validación social.

---

### 2.2. Pantalla 2: Aplicación Principal (Split View — Mapa + Directorio)
* **Barra Superior de Filtros:**
  * Buscador rápido por nombre o síntoma estilo Google Maps.
  * Chips interactivos: `[ ⭐ Mejor Calificados ]` *(primero)*, `[ 📍 Más Cercanos ]`, `[ 🕒 Abierto Ahora ]`, `[ 💵 Económico ]`.
* **Panel de Tarjetas (Izquierda):** Scroll vertical con la jerarquía oficial (Foto, 🛡️ Verificado, Nombre, ⭐ Estrellas arriba, 📍 Distancia abajo, Horarios y Precio aprox.).
* **Mapa Interactivo (Derecha):** Pines personalizados por especialidad con popup flotante al pasar el cursor.

---

### 2.3. Componente 3: Side Drawer Expandido (Detalle del Doctor)
* Se despliega hacia la derecha al hacer clic en una tarjeta.
* **Contenido:** Galería horizontal de fotos del consultorio (Google Maps Scrape), tarifas aproximadas por tratamiento y lista de comentarios de pacientes verificados.
* **Cierre fluido:** Se contrae hacia la izquierda al scrollear o hacer clic fuera.

---

### 2.4. Componente 4: Barra Lateral "Consultar mi Cita" (Opción A)
* Accesible desde el Navbar mediante un botón destacado.
* Se despliega una barra lateral limpia con un campo de búsqueda:
  * **Input:** Ingrese su *Código de Ticket (ej. `VC-8942`)* o *Número de Teléfono*.
* **Resultado:** Muestra la ficha de la cita agendada, el saldo pendiente o pagado, el botón para **volver a descargar el archivo `.md` del ticket** y el botón para **cancelar la cita** (con reverso simulado).

---

### 2.5. Componente 5: Ventana Flotante de Registro & Login
* Modal flotante centrado con efecto *glassmorphism*.
* **Conmutador (Switch):**
  * `[ 👤 Soy Paciente ]` -> Registro rápido con Nombre, Teléfono y Email.
  * `[ 🩺 Soy Especialista ]` -> Formulario en 2 pasos:
    1. **Verificación de Títulos:** Datos personales, Universidad, N° Colegiatura -> Animación de carga -> Mensaje de bienvenida *"¡Registro Exitoso!"* -> Estado: `⏳ En revisión de credenciales (2-3 min)` -> Activación automática de insignia `🛡️ Verificado`.
    2. **Consultorio y Horarios:** Ubicación en mapa, precio base y **Matriz dinámica de Horarios** (Lunes a Domingo, bloques de 2 horas de 08:00 a 20:00).

---

### 2.6. Componente 6: Pantalla de Búsqueda sin Resultados (Empty State)
* **Mensaje:** *"No hemos encontrado especialistas en tu zona inmediata. ¿Deseas ampliar tu radio de búsqueda?"*
* **Selectores de Radio Rápido:** `[ 📍 5 km ]` • `[ 📍 8 km ]` • `[ 📍 10 km ]`.
* **Sugerencia de Urgencia:** Recomendación destacada de especialistas en Medicina General cercanos disponibles hoy.

---

### 2.7. Componente 7: Footer Global
* **Servicios:** Enlaces directos para filtrar por las 5 especialidades.
* **Políticas:** Protocolo hospitalario de inasistencia (15 min tolerancia) y política de cancelación.
* **FAQ:** Acordeón con respuestas a dudas sobre reservas y pagos en ventanilla.
* **Contacto:** Formulario funcional de soporte técnico.

---

## 3. Flujos de Usuario Detallados (User Flows)

### 📌 User Flow 1: Búsqueda, Agendamiento y Facturación (Invitado / Paciente)

```mermaid
flowchart TD
    A([Inicio: Usuario entra a la Home]) --> B[Clic en botón 'Probar / Explorar Mapa']
    B --> C[Entra a Split View: Mapa + Directorio]
    C --> D{¿Hay especialistas en < 3 km?}
    D -->|No| E[Muestra Empty State: Opciones 5, 8, 10 km + Sugerencia Medicina General]
    E --> F[Usuario selecciona nuevo radio o sugerencia]
    D -->|Sí| G[Lista de Especialistas Filtrada]
    F --> G
    G --> H[Clic en Tarjeta de Especialista]
    H --> I[Abre Side Drawer con Fotos y Reseñas]
    I --> J[Clic en 'Agendar Cita Rápida']
    J --> K[Paso 1: Llena Ficha de Paciente y Horario]
    K --> L{Paso 2: Elige Método de Pago}
    L -->|PayPal Mock| M[Simula Aprobación de Pago -> Estado: PAGADO]
    L -->|Efectivo Ventanilla| N[Sin tarjeta -> Estado: PENDIENTE EN VENTANILLA]
    M --> O[Pantalla de Confirmación de Cita]
    N --> O
    O --> P[Envío de Mensaje de Texto a Teléfono y Correo]
    O --> Q[Clic en 'Descargar Ticket de Cita .md']
    Q --> R([Fin: Paciente tiene su recibo listo])
```

---

### 📌 User Flow 2: Consulta y Cancelación de Cita Agendada

```mermaid
flowchart TD
    A([Inicio: Paciente entra a la Web]) --> B[Clic en 'Consultar mi Cita' en Navbar - Opción A]
    B --> C[Se despliega Barra Lateral de Consulta]
    C --> D[Ingresa Código de Ticket o Teléfono]
    D --> E{¿Existe la Cita?}
    E -->|No| F[Muestra error amigable: 'Cita no encontrada']
    E -->|Sí| G[Muestra Tarjeta con Detalles de la Cita]
    G --> H{¿Qué acción desea realizar?}
    H -->|Descargar Ticket| I[Descarga archivo .md del recibo]
    H -->|Cancelar Cita| J[Modal: Selecciona 1 de los 5 motivos de cancelación]
    J --> K[Animación de Carga de Reverso: 2-3 segs]
    K --> L[Despliegue de Visto Gigante Verde ✅]
    L --> M[Sistema libera el turno en la agenda médica]
    M --> N([Fin: Cita Cancelada y Reembolso Simulado])
```

---

### 📌 User Flow 3: Onboarding y Registro de Especialista Médico

```mermaid
flowchart TD
    A([Inicio: Doctor entra a la Web]) --> B[Clic en 'Registrarse' en Navbar]
    B --> C[Abre Ventana Flotante -> Elige 'Soy Especialista']
    C --> D[Paso 1: Datos Personales, Universidad, Teléfono y N° Colegiatura]
    D --> E[Paso 2: Nombre Consultorio, Ubicación en Mapa y Tarifa Aprox.]
    E --> F[Paso 3: Matriz de Horarios L-D de 08:00 a 20:00 en bloques de 2h]
    F --> G[Clic en 'Completar Registro']
    G --> H[Mensaje de Bienvenida: '¡Registro Exitoso!']
    H --> I[Estado: ⏳ En revisión de credenciales 2-3 min]
    I --> J[Asignación automática de Insignia 'Especialista Verificado 🛡️']
    J --> K([Fin: Perfil verificado y listo en el sistema])
```
