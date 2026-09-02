"""
generar_especialistas_zona.py
─────────────────────────────
Genera `database/05_seed_zona_centro_norte_postgresql.sql`: una semilla
ADICIVA e idempotente con >=20 especialistas repartidos de forma uniforme
dentro del polígono de Quito delimitado por cuatro hitos:

    Miraflores  ->  La Vicentina  ->  Parque Metropolitano Guangüiltagua
                ->  Parque Ecológico Rumipamba  ->  (cierra en Miraflores)

El muestreo es una rejilla con "jitter" determinista (semilla fija) filtrada
por point-in-polygon (ray casting): cubre toda el área sin huecos ni grumos.

Uso:
    python scripts/generar_especialistas_zona.py            # escribe el .sql
    python scripts/generar_especialistas_zona.py --n 24     # nº objetivo
    python scripts/generar_especialistas_zona.py --stdout   # imprime, no escribe

El .sql resultante se ejecuta en pgAdmin sobre la base `vectra_cure`
DESPUÉS de `02_seed_demo_postgresql.sql`, o con:
    python scripts/migrar_db.py   (no lo aplica; usar psql/pgAdmin)
"""

from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

# ── Polígono (lat, lng) en el orden que dio el enunciado ───────────────
#    Coordenadas aproximadas de cada hito dentro de Quito.
VERTICES = [
    (-0.20390, -78.50100),  # Miraflores (suroeste)
    (-0.21480, -78.48650),  # La Vicentina (sureste)
    (-0.18100, -78.46000),  # Parque Metropolitano Guangüiltagua (noreste)
    (-0.18660, -78.49440),  # Parque Ecológico Rumipamba (noroeste)
]

# Hash de contraseña reutilizado de la semilla demo: "medico123".
HASH_MEDICO = (
    "scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a"
    "64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405"
    "f410d57823b938ff46"
)

ESPECIALIDADES = (
    "Medicina General",
    "Odontología",
    "Dermatología",
    "Veterinaria",
    "Pediatría",
)

# Rango de precio de consulta (USD) por especialidad.
PRECIO = {
    "Medicina General": (22, 32),
    "Odontología": (30, 46),
    "Dermatología": (40, 58),
    "Veterinaria": (18, 28),
    "Pediatría": (25, 40),
}

NOMBRES_M = ["Alejandro", "Camilo", "Sebastián", "Andrés", "Mateo", "Daniel",
             "Esteban", "Francisco", "Joaquín", "Nicolás", "Rafael", "Tomás"]
NOMBRES_F = ["Valeria", "Daniela", "María Fernanda", "Camila", "Andrea",
             "Gabriela", "Paula", "Lucía", "Carolina", "Isabel", "Renata",
             "Verónica"]
APELLIDOS = ["Morales", "Salazar", "Andrade", "Rueda", "Ponce", "Lara",
             "Villacís", "Cevallos", "Jaramillo", "Vásconez", "Terán",
             "Espinoza", "Yépez", "Guerrero", "Naranjo", "Cifuentes",
             "Montalvo", "Recalde", "Zambrano", "Almeida", "Carrión",
             "Benítez", "Landázuri", "Ordóñez"]

# Sub-zonas para etiquetar la dirección según dónde cae el punto.
BARRIOS = [
    ("La Floresta", -0.2050, -78.4880),
    ("La Vicentina", -0.2140, -78.4870),
    ("Miraflores", -0.2030, -78.5000),
    ("González Suárez", -0.2010, -78.4790),
    ("La Paz", -0.1980, -78.4830),
    ("Bellavista", -0.1900, -78.4770),
    ("El Batán", -0.1870, -78.4830),
    ("La Pradera", -0.1970, -78.4880),
    ("El Dorado", -0.2080, -78.4950),
]

CALLES = ["Av. La Coruña", "Isabel La Católica", "Av. 12 de Octubre",
          "Toledo", "Andalucía", "Vizcaya", "Guipúzcoa", "Madrid",
          "Av. González Suárez", "Coruña", "Francisco Salazar",
          "Av. Eloy Alfaro", "Portugal", "República de El Salvador",
          "Av. 6 de Diciembre", "Whymper", "Diego de Almagro", "Orellana"]

RESENAS_TEXTO = [
    "Atención puntual y clara.", "Explicó el diagnóstico con detalle.",
    "Consultorio limpio y bien ubicado.", "Muy profesional, volvería.",
    "Trato amable y sin apuros.", "Resolvió mi duda en la primera cita.",
    "Buena relación precio-atención.", "Fácil de llegar y estacionar.",
]
RESENAS_NOMBRES = ["Camila Mendoza", "Carlos Pazmiño", "Esteban Andrade",
                   "Andrea Torres", "Mateo Vega", "Lucía Fernández",
                   "Paúl Herrera", "Sofía Cabrera"]


def punto_en_poligono(lat: float, lng: float, poly: list[tuple[float, float]]) -> bool:
    """Ray casting. `poly` es lista de (lat, lng)."""
    dentro = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        yi, xi = poly[i]
        yj, xj = poly[j]
        if (xi > lng) != (xj > lng):
            corte_y = (yj - yi) * (lng - xi) / (xj - xi) + yi
            if lat < corte_y:
                dentro = not dentro
        j = i
    return dentro


def barrio_de(lat: float, lng: float) -> str:
    return min(BARRIOS, key=lambda b: (b[1] - lat) ** 2 + (b[2] - lng) ** 2)[0]


def muestrear(n_objetivo: int, rnd: random.Random) -> list[tuple[float, float]]:
    lats = [v[0] for v in VERTICES]
    lngs = [v[1] for v in VERTICES]
    lat0, lat1 = min(lats), max(lats)
    lng0, lng1 = min(lngs), max(lngs)

    # Rejilla lo bastante fina para que, tras descartar los de fuera del
    # polígono, queden >= n_objetivo. Se agranda si hace falta.
    for filas in range(5, 12):
        cols = filas + 1
        puntos: list[tuple[float, float]] = []
        for r in range(filas):
            for c in range(cols):
                lat = lat0 + (lat1 - lat0) * (r + 0.5) / filas
                lng = lng0 + (lng1 - lng0) * (c + 0.5) / cols
                # jitter <= media celda para romper la regularidad
                lat += (rnd.random() - 0.5) * (lat1 - lat0) / filas * 0.8
                lng += (rnd.random() - 0.5) * (lng1 - lng0) / cols * 0.8
                if punto_en_poligono(lat, lng, VERTICES):
                    puntos.append((round(lat, 8), round(lng, 8)))
        if len(puntos) >= n_objetivo:
            rnd.shuffle(puntos)
            return puntos[:n_objetivo]
    return puntos[:n_objetivo]


def sql_literal(texto: str) -> str:
    return "'" + texto.replace("'", "''") + "'"


def generar_sql(n: int) -> str:
    rnd = random.Random(20260901)  # determinista
    puntos = muestrear(n, rnd)

    filas_usuario = []
    filas_perfil = []
    filas_resena = []
    usados_apellido: set[str] = set()

    for i, (lat, lng) in enumerate(puntos):
        especialidad = ESPECIALIDADES[i % len(ESPECIALIDADES)]
        femenino = rnd.random() < 0.5
        pila = NOMBRES_F if femenino else NOMBRES_M
        nombre_pila = rnd.choice(pila)
        apellido = rnd.choice([a for a in APELLIDOS if a not in usados_apellido]
                              or APELLIDOS)
        usados_apellido.add(apellido)
        titulo = "Dra." if femenino else "Dr."
        nombre = f"{titulo} {nombre_pila} {apellido}"

        email = f"medico.zn{i:02d}@vectra.demo"
        telefono = f"+593 98 4{i:02d} {1000 + i:04d}"
        colegiatura = f"MED-481{i:02d}"
        verificado = "TRUE" if rnd.random() < 0.8 else "FALSE"
        barrio = barrio_de(lat, lng)
        clinica_kind = {
            "Odontología": "Centro Odontológico",
            "Dermatología": "Clínica Dermatológica",
            "Veterinaria": "Veterinaria",
            "Pediatría": "Centro Pediátrico",
            "Medicina General": "Consultorio Médico",
        }[especialidad]
        clinica = f"{clinica_kind} {barrio}"
        calle = rnd.choice(CALLES)
        direccion = f"{calle} N{rnd.randint(20, 45)}-{rnd.randint(10, 99)}, {barrio}, Quito"
        pmin, pmax = PRECIO[especialidad]
        precio = round(rnd.uniform(pmin, pmax), 2)
        galeria = (
            f'["https://picsum.photos/seed/vczn{i}-0/800/600", '
            f'"https://picsum.photos/seed/vczn{i}-1/800/600"]'
        )

        filas_usuario.append(
            f"  ({sql_literal(nombre)}, {sql_literal(email)}, "
            f"{sql_literal(telefono)}, 'medico', {sql_literal(HASH_MEDICO)}, TRUE)"
        )
        filas_perfil.append(
            f"  ({sql_literal(email)}, {sql_literal(especialidad)}, "
            f"{sql_literal(colegiatura)}, {verificado}, {sql_literal(clinica)}, "
            f"{sql_literal(direccion)}, {lat:.8f}::numeric, {lng:.8f}::numeric, "
            f"{precio:.2f}::numeric, {sql_literal(galeria)}::jsonb)"
        )
        for _ in range(rnd.randint(2, 4)):
            filas_resena.append(
                f"  ({sql_literal(email)}, {sql_literal(rnd.choice(RESENAS_NOMBRES))}, "
                f"{rnd.randint(4, 5)}, {sql_literal(rnd.choice(RESENAS_TEXTO))})"
            )

    centro_lat = sum(p[0] for p in puntos) / len(puntos)
    centro_lng = sum(p[1] for p in puntos) / len(puntos)

    return f"""\
-- 05_seed_zona_centro_norte_postgresql.sql
-- ─────────────────────────────────────────────────────────────────────
-- Semilla ADITIVA e idempotente: {len(puntos)} especialistas repartidos dentro del
-- polígono Miraflores → La Vicentina → P. M. Guangüiltagua → P. E. Rumipamba.
-- Generado por scripts/generar_especialistas_zona.py (semilla fija).
-- Ejecutar en pgAdmin sobre la base vectra_cure DESPUÉS de 02_seed_demo.
-- Centroide del reparto: {centro_lat:.6f}, {centro_lng:.6f}

DO $$
BEGIN
  IF current_database() <> 'vectra_cure' THEN
    RAISE EXCEPTION 'Conéctate a la base vectra_cure antes de ejecutar esta semilla.';
  END IF;
  IF to_regclass('public.perfiles_medicos') IS NULL
     OR to_regclass('public.disponibilidades_medicas') IS NULL THEN
    RAISE EXCEPTION 'Esquema incompleto. Ejecuta 01_schema_postgresql.sql primero.';
  END IF;
END $$;

BEGIN;

-- 1) Cuentas de especialista (contraseña demo: medico123)
INSERT INTO usuarios (nombre, email, telefono, rol, password_hash, activo)
VALUES
{",\n".join(filas_usuario)}
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  rol = EXCLUDED.rol,
  password_hash = EXCLUDED.password_hash,
  activo = TRUE,
  fecha_actualizacion = CURRENT_TIMESTAMP;

-- 2) Perfiles médicos con geolocalización dentro del polígono
INSERT INTO perfiles_medicos (
  usuario_id, especialidad, num_colegiatura, verificado, nombre_clinica,
  direccion, latitud, longitud, precio_aprox, foto, galeria,
  horario_atencion, activo
)
SELECT
  u.id, v.especialidad, v.colegiatura, v.verificado, v.clinica,
  v.direccion, v.latitud, v.longitud, v.precio, NULL, v.galeria,
  '09:00 - 18:30', TRUE
FROM (VALUES
{",\n".join(filas_perfil)}
) AS v(email, especialidad, colegiatura, verificado, clinica, direccion,
       latitud, longitud, precio, galeria)
JOIN usuarios u ON u.email = v.email
ON CONFLICT (usuario_id) DO UPDATE SET
  especialidad = EXCLUDED.especialidad,
  num_colegiatura = EXCLUDED.num_colegiatura,
  verificado = EXCLUDED.verificado,
  nombre_clinica = EXCLUDED.nombre_clinica,
  direccion = EXCLUDED.direccion,
  latitud = EXCLUDED.latitud,
  longitud = EXCLUDED.longitud,
  precio_aprox = EXCLUDED.precio_aprox,
  galeria = EXCLUDED.galeria,
  horario_atencion = EXCLUDED.horario_atencion,
  activo = TRUE,
  fecha_actualizacion = CURRENT_TIMESTAMP;

-- 3) Disponibilidad estándar (lun-vie 08-18, sáb 09-13) para los nuevos perfiles
INSERT INTO disponibilidades_medicas (perfil_medico_id, dia_semana, hora_inicio, hora_fin, activo)
SELECT pm.id, d.dia_semana, d.hora_inicio, d.hora_fin, TRUE
FROM perfiles_medicos pm
JOIN usuarios u ON u.id = pm.usuario_id AND u.email LIKE 'medico.zn%@vectra.demo'
CROSS JOIN (VALUES
  (0, '08:00', '18:00'), (1, '08:00', '18:00'), (2, '08:00', '18:00'),
  (3, '08:00', '18:00'), (4, '08:00', '18:00'), (5, '09:00', '13:00')
) AS d(dia_semana, hora_inicio, hora_fin)
WHERE NOT EXISTS (
  SELECT 1 FROM disponibilidades_medicas dm
  WHERE dm.perfil_medico_id = pm.id AND dm.dia_semana = d.dia_semana
    AND dm.hora_inicio = d.hora_inicio AND dm.hora_fin = d.hora_fin
);

-- 4) Reseñas demostrativas
INSERT INTO resenas (medico_id, paciente_nombre, calificacion, comentario)
SELECT pm.id, v.paciente, v.calificacion, v.comentario
FROM (VALUES
{",\n".join(filas_resena)}
) AS v(email, paciente, calificacion, comentario)
JOIN usuarios u ON u.email = v.email
JOIN perfiles_medicos pm ON pm.usuario_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM resenas r
  WHERE r.medico_id = pm.id AND r.paciente_nombre = v.paciente
    AND r.comentario = v.comentario
);

-- 5) Recalcular rating y conteo desde las reseñas reales
UPDATE perfiles_medicos pm
SET num_resenas = resumen.cantidad,
    rating_promedio = resumen.promedio,
    fecha_actualizacion = CURRENT_TIMESTAMP
FROM (
  SELECT medico_id, COUNT(*)::integer AS cantidad,
         ROUND(AVG(calificacion)::numeric, 2) AS promedio
  FROM resenas GROUP BY medico_id
) AS resumen
WHERE pm.id = resumen.medico_id;

COMMIT;

SELECT 'Semilla de zona centro-norte cargada: ' || COUNT(*) || ' perfiles medico.zn*'
FROM usuarios WHERE email LIKE 'medico.zn%@vectra.demo';
"""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--n", type=int, default=24, help="nº de especialistas (>=20)")
    ap.add_argument("--stdout", action="store_true", help="imprime en vez de escribir")
    args = ap.parse_args()

    n = max(20, args.n)
    sql = generar_sql(n)

    if args.stdout:
        print(sql)
        return

    destino = Path(__file__).resolve().parents[1] / "database" / "05_seed_zona_centro_norte_postgresql.sql"
    destino.write_text(sql, encoding="utf-8")
    print(f"Escrito: {destino}  ({n} especialistas objetivo)")


if __name__ == "__main__":
    main()
