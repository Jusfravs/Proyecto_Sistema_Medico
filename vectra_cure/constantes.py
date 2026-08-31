"""
constantes.py
─────────────
Valores fijos del dominio de Vectra Cure. Tomados de:
  · docs/architecture/04_TECHNICAL_ARCHITECTURE.md  (enums de rol, especialidad, pago, estado)
  · docs/product/03_USER_FLOW_AND_BOOKING.md        (métodos de pago, motivos de cancelación, bloques horarios)
  · docs/product/06_SITEMAP_AND_USER_FLOWS.md       (radios de búsqueda)

No hay nada de base de datos aquí: solo texto y tuplas que usan las rutas,
la lógica y las plantillas.
"""

# ── Roles de usuario ────────────────────────────────────────────────
ROL_PACIENTE = "paciente"
ROL_MEDICO = "medico"
ROL_ADMIN = "admin"
ROLES = (ROL_PACIENTE, ROL_MEDICO, ROL_ADMIN)

# ── Especialidades MVP (5) ─────────────────────────────────────────
ESPECIALIDADES = (
    "Medicina General",
    "Odontología",
    "Dermatología",
    "Veterinaria",
    "Pediatría",
)

# Íconos para las tarjetas del directorio (docs/design/02_DESIGN_SYSTEM / docs/product/06_SITEMAP)
ICONO_ESPECIALIDAD = {
    "Medicina General": "🩺",
    "Odontología": "🦷",
    "Dermatología": "🧴",
    "Veterinaria": "🐾",
    "Pediatría": "👶",
}

# ── Métodos y estados de pago (03 §2 / 04) ─────────────────────────
PAGO_PAYPAL_MOCK = "PAYPAL_MOCK"
PAGO_EFECTIVO = "EFECTIVO_VENTANILLA"
METODOS_PAGO = (PAGO_PAYPAL_MOCK, PAGO_EFECTIVO)

METODO_PAGO_ETIQUETA = {
    PAGO_PAYPAL_MOCK: "Pago digital (PayPal Mock simulado)",
    PAGO_EFECTIVO: "Pago en efectivo (ventanilla del consultorio)",
}

ESTADO_PAGO_PAGADO = "PAGADO_SIMULADO"
ESTADO_PAGO_PENDIENTE = "PENDIENTE_VENTANILLA"
ESTADO_PAGO_REEMBOLSADO = "REEMBOLSADO_SIMULADO"
ESTADOS_PAGO = (ESTADO_PAGO_PAGADO, ESTADO_PAGO_PENDIENTE, ESTADO_PAGO_REEMBOLSADO)

ESTADO_PAGO_ETIQUETA = {
    ESTADO_PAGO_PAGADO: "Pagado · transacción simulada",
    ESTADO_PAGO_PENDIENTE: "Pendiente · pago en ventanilla",
    ESTADO_PAGO_REEMBOLSADO: "Reembolso simulado emitido",
}

LEYENDA_SALDO_PENDIENTE = (
    "Saldo pendiente: el pago en efectivo debe realizarse en la ventanilla de "
    "recepción del consultorio médico previo a su ingreso a la consulta."
)

# ── Estados de la cita (04) ────────────────────────────────────────
ESTADO_CITA_CONFIRMADA = "CONFIRMADA"
ESTADO_CITA_COMPLETADA = "COMPLETADA"
ESTADO_CITA_CANCELADA = "CANCELADA"
ESTADO_CITA_NO_SHOW = "NO_SHOW"
ESTADOS_CITA = (
    ESTADO_CITA_CONFIRMADA,
    ESTADO_CITA_COMPLETADA,
    ESTADO_CITA_CANCELADA,
    ESTADO_CITA_NO_SHOW,
)

ESTADO_CITA_ETIQUETA = {
    ESTADO_CITA_CONFIRMADA: "Confirmada",
    ESTADO_CITA_COMPLETADA: "Completada",
    ESTADO_CITA_CANCELADA: "Cancelada",
    ESTADO_CITA_NO_SHOW: "No asistió",
}

# ── Motivos de cancelación (03 §3.1) ──────────────────────────────
MOTIVOS_CANCELACION = (
    "Problemas de horario o imprevisto personal",
    "Encontré atención médica en otro lugar más rápido",
    "Ya no presento molestias o síntomas médicos",
    "Inconveniente con el costo o método de pago",
    "Otros",
)

# ── Matriz horaria: bloques de 2 h entre 08:00 y 20:00 (03 §2) ────
BLOQUES_HORARIOS = (
    "08:00", "10:00", "12:00", "14:00", "16:00", "18:00",
)

DIAS_SEMANA = (
    (0, "Lunes"), (1, "Martes"), (2, "Miércoles"), (3, "Jueves"),
    (4, "Viernes"), (5, "Sábado"), (6, "Domingo"),
)
NOMBRE_DIA_SEMANA = dict(DIAS_SEMANA)
DISPONIBILIDAD_DEMO = ((0, "08:00", "18:00"), (1, "08:00", "18:00"),
                       (2, "08:00", "18:00"), (3, "08:00", "18:00"),
                       (4, "08:00", "18:00"), (5, "09:00", "13:00"))

TOLERANCIA_MINUTOS = 15  # protocolo hospitalario de inasistencia (03 §3.3)

# ── Búsqueda geográfica (06 §2.6) ─────────────────────────────────
RADIO_INICIAL_KM = 3
RADIOS_AMPLIACION_KM = (5, 8, 10)

# ── Ordenamientos del directorio (06 §2.2) ────────────────────────
ORDEN_RATING = "rating"
ORDEN_DISTANCIA = "distancia"
ORDEN_PRECIO = "precio"
ORDENES = (ORDEN_RATING, ORDEN_DISTANCIA, ORDEN_PRECIO)

# ── Negocio ───────────────────────────────────────────────────────
TASA_PLATAFORMA = 0.00  # $0.00 al paciente (05, Pregunta 10)
HORARIO_ATENCION_DEFECTO = "09:00 - 18:30"

# ── Ubicación de referencia (Quito) para el cálculo de distancia ──
UBICACION_REFERENCIA = (-0.180653, -78.467834)  # Centro-norte de Quito
