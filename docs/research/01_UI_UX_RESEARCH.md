# Pontificia Universidad Católica del Ecuador (PUCE)
## Facultad de Ingeniería — Carrera de Desarrollo de Software
### Asignatura: Diseño de Experiencia de Usuario e Interfaces (UX/UI)
**Docente:** Ing. Andrés Ayala  
**Integrantes:** Isaac Unapucha, Justin Cedeño  
**Proyecto:** Vectra Cure — Plataforma de Geolocalización y Agendamiento Médico  
**Fecha de Entrega:** 30 de Agosto de 2026  

---

# 01. Documento de Investigación de Experiencia de Usuario (UI/UX Research)

---

## 1. El Problema Inicial (Problem Statement)

En el acceso a servicios de salud privados y especializados (medicina general, odontología, dermatología, pediatría y veterinaria), los usuarios enfrentan un proceso fragmentado, opaco y lleno de fricciones:

1. **Parálisis por falta de referencias confiables:** Al necesitar un especialista de forma urgente o programada, los pacientes dependen del boca a boca o de búsquedas dispersas en redes sociales sin validación de credenciales médicas reales.
2. **Opacidad de costos y tarifas:** La dificultad para conocer los precios de consulta de antemano genera desconfianza y abandono antes de acudir al centro médico.
3. **Pérdida de tiempo en coordinación:** La necesidad de realizar múltiples llamadas telefónicas o esperar respuestas tardías por WhatsApp para consultar turnos libres provoca retrasos críticos en la atención médica y veterinaria.

---

## 2. Objetivo de la Investigación

### 2.1. Objetivo General
Investigar los comportamientos, puntos de dolor, hábitos de búsqueda y disposición tecnológica de los usuarios en Ecuador para diseñar una plataforma web híbrida (*"LinkedIn + Marketplace"*) que optimice el descubrimiento geolocalizado, la validación social y el agendamiento autónomo de citas médicas.

### 2.2. Objetivos Específicos
* Determinar los factores más decisivos de selección médica (estrellas de reputación, cercanía geográfica, precios visibles y disponibilidad inmediata).
* Validar la aceptación y relevancia de un mapa interactivo geolocalizado (API de Google Maps) para ubicar consultorios en tiempo real.
* Conocer la disposición de los pacientes a agendar citas de forma 100% online y sus preferencias en métodos de pago (digital vs. efectivo en ventanilla).
* Construir arquetipos de usuario (*User Personas*) y mapas de empatía fundamentados en datos reales para guiar la arquitectura de información y el diseño de la interfaz (UI).

---

## 3. Preguntas de Investigación (Las 5 Áreas Clave)

Antes del diseño del instrumento de recolección, se plantearon las preguntas de investigación estratégicas:

1. **Contexto del Usuario:** ¿Qué rango de edad predomina en la búsqueda de servicios de salud digital y qué sistema de cobertura utilizan con mayor frecuencia?
2. **Objetivos del Usuario:** ¿Con qué frecuencia asisten a consultas médicas, odontológicas o veterinarias y qué buscan lograr al ingresar a un directorio de salud?
3. **Problemas y Frustraciones:** ¿Qué barreras generan mayor molestia al buscar turno (tiempos de espera, falta de referencias, precios ocultos, llamadas)?
4. **Comportamiento Real:** ¿Cómo eligen actualmente a un especialista y qué nivel de confianza otorgan a las calificaciones y reseñas de otros pacientes?
5. **Necesidades y Expectativas:** ¿Qué funciones consideran imprescindibles en una plataforma digital (mapa interactivo, agendamiento autónomo, métodos de pago transparentes)?

---

## 4. Segmentación Básica de la Audiencia

* **Criterio Demográfico:** Hombres y mujeres de 18 a 45+ años residentes en zonas urbanas de Ecuador.
* **Criterio Socioeconómico:** Personas con acceso a internet móvil/desktop, usuarios de atención médica pública, privada y seguros de salud.
* **Segmentos Específicos Identificados:**
  1. *Jóvenes profesionales y adultos independientes (18 a 35 años):* Alta afinidad digital, buscan inmediatez ante urgencias dentales o de salud general.
  2. *Padres de familia (28 a 45 años):* Priorizan credenciales verificadas y recomendaciones para atención pediátrica.
  3. *Dueños de mascotas:* Necesidad frecuente de atención veterinaria cercana y confiable.

---

## 5. Metodología de Investigación

* **Tipo de Investigación:** Mixta (Cuantitativa y Cualitativa con enfoque en Diseño Centrado en el Usuario — ISO 9241-210:2019).
* **Técnica Primaria:** Encuesta estructurada administrada a través de Google Forms a una muestra real de **N = 25 personas**, complementada con entrevistas a profundidad.
* **Técnica Secundaria:** *Desk Research* y *Benchmarking* de plataformas de agendamiento y directorios médicos.

---

## 6. Análisis Detallado de Resultados Cuantitativos (Muestra: N = 25)

A continuación se presenta el desglose estadístico de las respuestas obtenidas y su correspondiente **Insight UX** aplicado a la arquitectura y diseño de Vectra Cure:

```
                               DISTRIBUCIÓN DE EDAD (N=25)
  ┌──────────────────────────────┬────────────┬─────────────┬──────────────────────────┐
  │ Rango de Edad                │ Frecuencia │ Porcentaje  │ Representación Gráfica   │
  ├──────────────────────────────┼────────────┼─────────────┼──────────────────────────┤
  │ a) 18 a 25 años              │ 9 personas │ 36.0%       │ █████████ (36%)          │
  │ b) 26 a 35 años              │ 10 personas│ 40.0%       │ ██████████ (40%)         │
  │ c) 36 a 45 años              │ 4 personas │ 16.0%       │ ████ (16%)               │
  │ d) 46 años o más             │ 2 personas │ 8.0%        │ ██ (8%)                  │
  └──────────────────────────────┴────────────┴─────────────┴──────────────────────────┘
```

---

### Pregunta 1: ¿En qué rango de edad te encuentras?
* **Resultados:** 18 a 25 años: 9 (36%) | 26 a 35 años: 10 (40%) | 36 a 45 años: 4 (16%) | 46 o más: 2 (8%).
* **💡 Insight UX Aplicado:** El **76% de los usuarios tiene entre 18 y 35 años**. Este segmento es altamente digital y móvil. Justifica un diseño visual moderno, minimalista (estilo Apple Desktop), con tipografía geométrica legible (*Plus Jakarta Sans* e *Inter*) y flujos de agendamiento que no superen los 2 pasos.

---

### Pregunta 2: ¿Qué sistema de salud utilizas principalmente para tus atenciones?
* **Resultados:** Clínicas privadas / Pago directo: 10 (40%) | Sistema público: 7 (28%) | Seguro privado: 5 (20%) | Mixto: 3 (12%).
* **💡 Insight UX Aplicado:** El **60% acude a la medicina privada (directa o aseguradora)**. La plataforma debe enfatizar la transparencia de precios de consulta particular y permitir a futuro la visualización de convenios con aseguradoras.

---

### Pregunta 3: ¿Con qué frecuencia asistes a consultas médicas, odontológicas o veterinarias?
* **Resultados:** Cada 3 a 6 meses: 10 (40%) | Una vez al año: 7 (28%) | Solo emergencias: 5 (20%) | Mensualmente: 3 (12%).
* **💡 Insight UX Aplicado:** Más del **52% de los usuarios asiste al menos 2 veces al año o de forma mensual**. Esto valida incluir especialidades de alta rotación y mantenimiento como Odontología, Dermatología y Veterinaria en el menú principal.

---

### Pregunta 4: ¿Cómo sueles encontrar a un nuevo especialista cuando lo necesitas?
* **Resultados:** Recomendación de familiares/amigos: 14 (56%) | Búsqueda en internet/redes: 6 (24%) | Directorio de seguro: 3 (12%) | Médicos fijos: 2 (8%).
* **💡 Insight UX Aplicado:** La **validación social ("boca a boca") es el canal dominante (56%)**. En la interfaz, las reseñas verificadas y los testimonios de otros pacientes deben tener un protagonismo visual superior a los datos comerciales.

---

### Pregunta 5: ¿Cuál es tu mayor molestia al momento de buscar y agendar una cita?
* **Resultados:** Tiempos de espera largos: 9 (36%) | Falta de referencias claras de calidad: 8 (32%) | Dificultad para saber precios: 5 (20%) | Contacto por teléfono/mensajes: 3 (12%).
* **💡 Insight UX Aplicado:** Los dos mayores dolores son el **tiempo de espera (36%)** y la **incertidumbre de calidad (32%)**. La UI de la tarjeta médica debe resolver ambos de un vistazo: badge de disponibilidad *"Abierto Hoy"* y la insignia `🛡️ Especialista Verificado`.

---

### Pregunta 6: ¿Qué tan útil sería una plataforma web que te muestre en un mapa a los especialistas cercanos a ti?
* **Resultados:** Muy útil: 17 (68%) | Algo útil: 6 (24%) | Poco útil: 1 (4%) | Nada útil: 1 (4%).
* **💡 Insight UX Aplicado:** El **92% valida positivamente la integración del mapa interactivo**. Esto respalda técnicamente la arquitectura de pantalla dividida (*Split View: Catálogo + Google Maps*).

---

### Pregunta 7: ¿Qué factor sería el más decisivo para elegir a un médico dentro de esta plataforma?
* **Resultados:** Calificaciones y reseñas: 11 (44%) | Cercanía geográfica: 7 (28%) | Precio visible: 4 (16%) | Disponibilidad el mismo día: 3 (12%).
* **💡 Insight UX Aplicado:** **Las estrellas y valoraciones (44%) superan a la distancia (28%)**. Por este motivo, la jerarquía visual de la tarjeta médica sitúa **las estrellas ⭐ en la parte superior**, justo debajo del nombre, y la distancia en km en un nivel secundario.

---

### Pregunta 8: ¿Te sentirías cómodo agendando una cita 100% online sin tener que hablar con una persona?
* **Resultados:** Sí, es la opción más rápida: 11 (44%) | Sí, si la página transmite seguridad: 9 (36%) | No, prefiero WhatsApp: 4 (16%) | No, prefiero llamar: 1 (4%).
* **💡 Insight UX Aplicado:** El **80% está listo para el agendamiento 100% autónomo**, condicionado a que el diseño transmita seriedad y confianza clínica. El modal de reserva debe ser sobrio y libre de elementos distractores.

---

### Pregunta 9: ¿Qué método de pago preferirías utilizar para pagar la consulta dentro de la plataforma?
* **Resultados:** Transferencia bancaria directa: 11 (44%) | Tarjeta de crédito/débito: 7 (28%) | Billetera digital (PayPal/PayPhone): 4 (16%) | Efectivo en ventanilla: 3 (12%).
* **💡 Insight UX Aplicado:** Coexisten preferencias por pago digital anticipado y pago físico. El sistema debe ofrecer la opción de **PayPal Mock (Simulado)** y **Pago en Efectivo en Ventanilla**, indicando en el ticket el estado de pago correspondiente.

---

### Pregunta 10: ¿Estarías dispuesto a pagar un pequeño recargo a cambio de la facilidad de agendar rápido?
* **Resultados:** Sí, si ahorra tiempo: 6 (24%) | Solo en emergencias: 8 (32%) | No, solo el costo exacto: 8 (32%) | No usaría la web con recargo: 3 (12%).
* **💡 Insight UX Aplicado:** El **64% es reticente a un recargo regular** o solo lo aceptaría en emergencias. El modelo de negocio para el paciente debe ser de **tarifa de servicio $0.00 USD**, monetizando a través del especialista.

---

## 7. Síntesis de Insights: De la Investigación al Diseño UI

```
┌───────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Hallazgo de la Investigación (Data)           │ Decisión de Diseño en Vectra Cure (UI/UX)              │
├───────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 76% usuarios entre 18 y 35 años               │ UI minimalista Apple Desktop, modo Claro/Oscuro y 60s. │
│ 44% prioriza Calificaciones y Reseñas         │ ⭐ Estrellas ubicadas en la cabecera de la tarjeta.    │
│ 92% aprueba la visualización en Mapa          │ Layout Split View interactivo con pines por categoría. │
│ 80% prefiere agendamiento digital directo     │ Reserva en modal de 2 pasos sin llamadas ni WhatsApp.  │
│ 56% busca por confianza y referencias         │ Insignia visible "🛡️ Especialista Verificado #48291".   │
│ 64% prefiere no pagar sobrecostos             │ Tasa de gestión $0.00 en ticket + Pago en ventanilla.  │
└───────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 8. Mapas de Empatía (Empathy Maps)

### Mapa de Empatía 1: Paciente con Urgencia Dental / Salud General (Camila, 28 años)

```
                       MAPA DE EMPATÍA — PACIENTE URBANO
┌───────────────────────────────────────────┬───────────────────────────────────────────┐
│ ¿QUÉ PIENSA Y SIENTE?                     │ ¿QUÉ VE?                                  │
│ • "Necesito que me atiendan ya".          │ • Clínicas en redes sin horarios claros.  │
│ • Temor a cobros excesivos o sorpresa.    │ • Páginas web desactualizadas o densas.   │
│ • Desea confirmar su cita en silencio.    │ • En Vectra Cure: Mapa con distancia real.│
├───────────────────────────────────────────┼───────────────────────────────────────────┤
│ ¿QUÉ OYE?                                 │ ¿QUÉ DICE Y HACE?                         │
│ • "Pide cita por teléfono y espera".      │ • "No tengo tiempo para llamar".          │
│ • Amigos que recomiendan sus doctores.    │ • Busca en su móvil desde la oficina.     │
│ • Quejas de turnos cancelados a destiempo.│ • Compara precios aproximados de consulta.│
├───────────────────────────────────────────┴───────────────────────────────────────────┤
│ ESFUERZOS (Pains / Frustraciones)         │ RESULTADOS (Gains / Beneficios Deseados)  │
│ • Dolor agudo e incertidumbre de horario. │ • Agendar en 1 minuto sin hablar con nadie│
│ • Odia las esperas en líneas telefónicas. │ • Recibir su ticket .md con precio claro. │
└───────────────────────────────────────────┴───────────────────────────────────────────┘
```

---

### Mapa de Empatía 2: Padre de Familia — Urgencia Pediátrica (Carlos y Andrea, 34 años)

```
                       MAPA DE EMPATÍA — PADRE DE FAMILIA
┌───────────────────────────────────────────┬───────────────────────────────────────────┐
│ ¿QUÉ PIENSA Y SIENTE?                     │ ¿QUÉ VE?                                  │
│ • Preocupación extrema por la salud de su │ • Consultorios pediátricos saturados.     │
│   hijo con fiebre.                        │ • Reseñas de otros padres en internet.    │
│ • "Necesito saber si este doctor es bueno"│ • En Vectra Cure: Badge 🛡️ Verificado.    │
├───────────────────────────────────────────┼───────────────────────────────────────────┤
│ ¿QUÉ OYE?                                 │ ¿QUÉ DICE Y HACE?                         │
│ • Recomendaciones de familiares de doctores│ • "Quiero ver las opiniones de otros padres│
│ • Noticias sobre clínicas no autorizadas. │ • Revisa la colegiatura y fotos de clínica│
├───────────────────────────────────────────┴───────────────────────────────────────────┤
│ ESFUERZOS (Pains / Frustraciones)         │ RESULTADOS (Gains / Beneficios Deseados)  │
│ • Miedo a caer en manos inexpertas.       │ • Certeza de que el médico es certificado│
│ • Desesperación cuando su médico no atiende│ • Saber que puede pagar en ventanilla.   │
└───────────────────────────────────────────┴───────────────────────────────────────────┘
```

---

## 9. Arquetipos de Usuario (User-Personas)

### User Persona 1: Camila Mendoza
* **Edad:** 28 años | **Ocupación:** Diseñadora Gráfica / Trabajo Remoto
* **Perfil:** Joven profesional con estilo de vida dinámico. Utiliza herramientas digitales para resolver su día a día.
* **Objetivos:** Encontrar atención odontológica inmediata ante un dolor de muela imprevisto.
* **Frustraciones:** Perder tiempo llamando a clínicas o esperando turnos de semanas en el sistema tradicional.
* **Necesidades:** Búsqueda rápida en mapa por cercanía (< 2 km), calificación ⭐ 4.5+ y agendamiento 100% online.
* **Herramientas Clave:** Smartphone, Google Maps, WhatsApp.

---

### User Persona 2: Carlos Pazmiño
* **Edad:** 34 años | **Ocupación:** Ingeniero Industrial / Padre de Familia
* **Perfil:** Padre primerizo responsable. Busca atención pediátrica de confianza cuando su hijo presenta síntomas repentinos.
* **Objetivos:** Validar credenciales de médicos antes de agendar y ubicar consultorios con atención el mismo día.
* **Frustraciones:** Falta de transparencia en títulos y opiniones no verificadas.
* **Necesidades:** Insignia `🛡️ Especialista Verificado`, fotos de las instalaciones en el panel lateral (*Side Drawer*) y opción de pago en recepción.
* **Herramientas Clave:** Laptop en casa, banca móvil, correo electrónico.

---

### User Persona 3: Esteban Andrade
* **Edad:** 31 años | **Ocupación:** Desarrollador de Software / Dueño de Mascota
* **Perfil:** Amante de los animales, vive con su perro "Toby". Considera a su mascota como parte de su familia.
* **Objetivos:** Tener a mano una clínica veterinaria con servicio de urgencias y turnos disponibles en fin de semana.
* **Frustraciones:** Veterinarias cerradas sin previo aviso o con costos abusivos en emergencias.
* **Necesidades:** Filtro específico de *Veterinaria*, mapa con tiempo en auto y descarga de ticket de atención.
* **Herramientas Clave:** GPS en móvil, billeteras digitales.

---

### User Persona 4: Dra. Valeria Salazar (Especialista Médico)
* **Edad:** 42 años | **Ocupación:** Médica Especialista en Dermatología
* **Perfil:** Especialista colegiada con consultorio privado. Desea modernizar la captación de sus pacientes.
* **Objetivos:** Llenar sus horas libres de consulta y evitar pacientes que no asisten a sus turnos (*No-Shows*).
* **Frustraciones:** Comisiones abusivas de directorios tradicionales y desorganización de agenda.
* **Necesidades:** Perfil verificado en el mapa, gestión ágil de su matriz horaria y protocolo de tolerancia de 15 minutos.
* **Herramientas Clave:** Portal web, agenda digital, notificaciones por correo.

---

## 10. Principios de Diseño Universal y 10 Heurísticas de Jakob Nielsen Aplicadas

1. **Visibilidad del Estado del Sistema:** La plataforma indica con etiquetas en tiempo real si el consultorio está *"Abierto Ahora"*, los horarios libres y el estado del especialista (*En revisión 2-3 min / Verificado 🛡️*).
2. **Relación entre el Sistema y el Mundo Real:** Uso de términos y símbolos familiares (iconos médicos 🦷, 🐾, 👶, precios aproximados en USD y distancias en km/minutos).
3. **Control y Libertad del Usuario:** El panel lateral (*Side Drawer*) se despliega al clic y se contrae al scrollear o hacer clic fuera sin forzar cambios de página.
4. **Consistencia y Estándares:** Convenciones estándar de interfaz web (barra de navegación superior, buscador tipo Google Maps, footer con enlaces esenciales).
5. **Prevención de Errores:** Precios etiquetados como *"aprox."*, selectores de radio acotados (5, 8, 10 km) y recordatorio de pago en ventanilla previo a la consulta.
6. **Reconocimiento antes que Recuerdo:** Toda la información decisiva (⭐ estrellas, distancia, horario, precio base) está condensada en la tarjeta principal.
7. **Flexibilidad y Eficiencia de Uso:** El usuario puede buscar directamente como invitado o iniciar sesión para consultar su historial.
8. **Diseño Estético y Minimalista (KISS):** Inspirado en Apple Desktop con espaciados generosos, ausencia de saturación visual y soporte para Modo Claro y Modo Oscuro.
9. **Ayuda para Reconocer y Diagnosticar Errores:** En caso de no encontrar especialistas en < 3 km, el sistema despliega un mensaje constructivo con botones para ampliar el radio a 5, 8 o 10 km y sugiere alternativas en Medicina General.
10. **Ayuda y Documentación:** Sección de Preguntas Frecuentes (FAQ) en el footer, política de inasistencias clara (15 min tolerancia) y formulario de contacto de soporte funcional.
