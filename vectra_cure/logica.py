"""
logica.py
─────────
Reglas de negocio de Vectra Cure. Son funciones puras que operan SOBRE
instancias de los modelos (que entrega el compañero de BD) — aquí no hay
ninguna clase ORM ni acceso a `db.session`. Así el `models.py` real puede
ser puramente estructural (atributos + relaciones).

Fuentes: docs/product/03_USER_FLOW_AND_BOOKING.md (pago, ticket, cancelación),
docs/architecture/04_TECHNICAL_ARCHITECTURE.md (enums),
docs/design/02_DESIGN_SYSTEM.md (formato del recibo).
"""

from __future__ import annotations

import math
import random
import re
from datetime import date, datetime

from werkzeug.security import check_password_hash, generate_password_hash

import constantes as C

# ══════════════════════════════════════════════════════════════════
# CONTRASEÑAS  (nunca se guardan en claro)
# ══════════════════════════════════════════════════════════════════

def hashear_password(plano: str) -> str:
    return generate_password_hash(plano)


def verificar_password(hash_guardado: str, plano: str) -> bool:
    if not hash_guardado:
        return False
    return check_password_hash(hash_guardado, plano)


# ══════════════════════════════════════════════════════════════════
# VALIDACIÓN DE FORMULARIOS  (estilo `_texto_requerido` del curso)
# ══════════════════════════════════════════════════════════════════

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def texto_requerido(valor: str | None, etiqueta: str) -> str:
    valor = (valor or "").strip()
    if not valor:
        raise ValueError(f"El campo {etiqueta} es obligatorio.")
    return valor


def email_valido(valor: str | None) -> str:
    valor = texto_requerido(valor, "correo").lower()
    if not _EMAIL_RE.match(valor):
        raise ValueError("El correo electrónico no tiene un formato válido.")
    return valor


def numero_no_negativo(valor, etiqueta: str, conversion=float):
    try:
        num = conversion(valor)
    except (TypeError, ValueError):
        raise ValueError(f"El campo {etiqueta} debe ser numérico.")
    if num < 0:
        raise ValueError(f"El campo {etiqueta} no puede ser negativo.")
    return num


def opcion_valida(valor, permitidas, etiqueta: str):
    if valor not in permitidas:
        raise ValueError(f"El valor de {etiqueta} no es válido.")
    return valor


def parse_fecha(valor: str | None) -> date:
    try:
        return date.fromisoformat((valor or "").strip())
    except ValueError:
        raise ValueError("La fecha de la cita no es válida (formato AAAA-MM-DD).")


def fecha_no_pasada(valor: str | date) -> date:
    """Acepta solo hoy o una fecha futura, también cuando llega desde un POST."""
    fecha = parse_fecha(valor) if isinstance(valor, str) else valor
    if fecha < date.today():
        raise ValueError("No puedes agendar una cita en una fecha que ya pasó.")
    return fecha


def bloques_disponibles(perfil, fecha: date) -> tuple[str, ...]:
    """Devuelve bloques de la matriz que caben en la disponibilidad del día."""
    dia = fecha.weekday()
    rangos = [d for d in perfil.disponibilidades if d.activo and d.dia_semana == dia]
    if not rangos:
        return ()
    return tuple(
        hora for hora in C.BLOQUES_HORARIOS
        if any(d.hora_inicio <= hora < d.hora_fin for d in rangos)
    )


def resumen_disponibilidad(perfil) -> str:
    """Texto breve para cards; no sustituye el dato estructurado."""
    activos = [d for d in perfil.disponibilidades if d.activo]
    if not activos:
        return perfil.horario_atencion
    dias = sorted({d.dia_semana for d in activos})
    inicio = min(d.hora_inicio for d in activos)
    fin = max(d.hora_fin for d in activos)
    etiquetas = [C.NOMBRE_DIA_SEMANA[d] for d in dias]
    dias_texto = f"{etiquetas[0]}–{etiquetas[-1]}" if len(etiquetas) > 1 else etiquetas[0]
    return f"{dias_texto}, {inicio}–{fin}"


# ══════════════════════════════════════════════════════════════════
# PAGO SIMULADO  (03 §2)
# ══════════════════════════════════════════════════════════════════

def estado_pago_inicial(metodo: str) -> str:
    """PayPal Mock -> pagado simulado ; efectivo -> pendiente en ventanilla."""
    if metodo == C.PAGO_PAYPAL_MOCK:
        return C.ESTADO_PAGO_PAGADO
    return C.ESTADO_PAGO_PENDIENTE


def simular_reverso(cita) -> None:
    """Si la cita estaba pagada digitalmente, emite el reembolso simulado."""
    if cita.estado_pago == C.ESTADO_PAGO_PAGADO:
        cita.estado_pago = C.ESTADO_PAGO_REEMBOLSADO


# ══════════════════════════════════════════════════════════════════
# CÓDIGO Y TICKET DE LA CITA  (03 §4)
# ══════════════════════════════════════════════════════════════════

def generar_codigo_ticket(cuando: date | None = None) -> str:
    anio = (cuando or date.today()).year
    return f"VC-{anio}-{random.randint(1000, 9999)}"


def render_ticket(cita) -> str:
    """
    Recibo estilo caja registradora térmica (03 §4). `cita` debe exponer:
    codigo_ticket, fecha_creacion, paciente_nombre/email/telefono, medico
    (con .usuario.nombre, .especialidad, .nombre_clinica, .direccion,
    .num_colegiatura, .verificado), fecha, hora, motivo, precio_aprox,
    estado_pago.
    """
    m = cita.medico
    nombre_medico = m.usuario.nombre if m and m.usuario else "N/D"
    if m and m.verificado:
        nombre_medico += f" (Verificado 🛡️ #{m.num_colegiatura})"

    if cita.estado_pago == C.ESTADO_PAGO_PAGADO:
        bloque_pago = "[X] PAGADO - TRANSACCIÓN SIMULADA (PayPal Mock)"
        aviso = ""
    elif cita.estado_pago == C.ESTADO_PAGO_PENDIENTE:
        bloque_pago = "[X] PENDIENTE - PAGO EN EFECTIVO EN VENTANILLA"
        aviso = "\n  (Favor acercarse a la recepción 10 min antes del turno)"
    else:
        bloque_pago = "[X] REVERSO / REEMBOLSO SIMULADO EMITIDO"
        aviso = ""

    creada = cita.fecha_creacion or datetime.now()
    lineas = [
        "=" * 60,
        "                     VECTRA CURE",
        "         Plataforma de Citación Médica Digital",
        "=" * 60,
        f"TICKET DE RESERVA #{cita.codigo_ticket}",
        f"Fecha de Emisión: {creada:%Y-%m-%d %H:%M}",
        "-" * 60,
        "DATOS DEL PACIENTE:",
        f"  Nombre: {cita.paciente_nombre}",
        f"  Teléfono: {cita.paciente_telefono}",
        f"  Email: {cita.paciente_email}",
        "",
        "ESPECIALISTA Y CONSULTORIO:",
        f"  Doctor: {nombre_medico}",
        f"  Especialidad: {m.especialidad if m else 'N/D'}",
        f"  Clínica: {m.nombre_clinica if m else 'N/D'}",
        f"  Dirección: {m.direccion if m else 'N/D'}",
        "-" * 60,
        "DETALLE DE LA CITA:",
        f"  Fecha Cita: {cita.fecha:%Y-%m-%d}",
        f"  Hora Cita:  {cita.hora} (Tolerancia: {C.TOLERANCIA_MINUTOS} min)",
        f"  Motivo:     {cita.motivo or 'No especificado'}",
        "-" * 60,
        "DESGLOSE DE FACTURACIÓN:",
        f"  Consulta (Aprox.):             $ {float(cita.precio_aprox):>7.2f} USD",
        f"  Tasa de Plataforma:            $ {C.TASA_PLATAFORMA:>7.2f} USD",
        "  -----------------------------------------",
        f"  TOTAL ESTIMADO:                $ {float(cita.precio_aprox):>7.2f} USD",
        "",
        "ESTADO DEL PAGO:",
        f"  {bloque_pago}{aviso}",
        "=" * 60,
        "  Notificación de confirmación enviada a WhatsApp y Correo.",
        "             ¡Gracias por confiar en Vectra Cure!",
        "=" * 60,
    ]
    return "\n".join(lineas)


# ══════════════════════════════════════════════════════════════════
# GEOLOCALIZACIÓN Y RATING
# ══════════════════════════════════════════════════════════════════

def calcular_distancia_km(lat1, lon1, lat2, lon2) -> float:
    """Haversine. Devuelve km con 2 decimales."""
    r = 6371.0
    p1, p2 = math.radians(float(lat1)), math.radians(float(lat2))
    dphi = math.radians(float(lat2) - float(lat1))
    dlmb = math.radians(float(lon2) - float(lon1))
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return round(r * 2 * math.asin(math.sqrt(a)), 2)


def distancia_a_referencia(perfil, lat=None, lng=None) -> float:
    origen_lat, origen_lng = (lat, lng) if lat is not None and lng is not None else C.UBICACION_REFERENCIA
    return calcular_distancia_km(origen_lat, origen_lng, perfil.latitud, perfil.longitud)


def recalcular_rating(perfil) -> None:
    """Actualiza rating_promedio y num_resenas a partir de `perfil.resenas`."""
    calificaciones = [r.calificacion for r in perfil.resenas]
    perfil.num_resenas = len(calificaciones)
    perfil.rating_promedio = round(sum(calificaciones) / len(calificaciones), 2) if calificaciones else 5.0


def ordenar_directorio(perfiles, orden: str, lat=None, lng=None):
    if orden == C.ORDEN_PRECIO:
        return sorted(perfiles, key=lambda p: float(p.precio_aprox))
    if orden == C.ORDEN_DISTANCIA:
        return sorted(perfiles, key=lambda p: distancia_a_referencia(p, lat, lng))
    # Por defecto: mejor calificados primero (05, Pregunta 7)
    return sorted(perfiles, key=lambda p: float(p.rating_promedio), reverse=True)
