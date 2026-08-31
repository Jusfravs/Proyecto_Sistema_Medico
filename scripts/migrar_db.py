"""
migrar_db.py
------------
Aplica los scripts SQL de ``database/`` sobre el PostgreSQL configurado en
``vectra_cure/.env`` sin necesidad de abrir pgAdmin.

La fuente de verdad del esquema sigue siendo ``database/*.sql`` (los mantiene
el equipo de base de datos); este script solo los ejecuta en orden.

Uso (desde la raiz del repo, con el venv activo):

    python scripts/migrar_db.py            # migracion V1->V2 + verificacion
    python scripts/migrar_db.py --fresh    # esquema completo + semilla + verificacion
    python scripts/migrar_db.py --check    # solo diagnostico, no modifica nada
"""

import sys
from pathlib import Path

import psycopg
from dotenv import dotenv_values

RAIZ = Path(__file__).resolve().parent.parent
DB_DIR = RAIZ / "database"
ENV_FILE = RAIZ / "vectra_cure" / ".env"

TABLAS_V2 = ("usuarios", "perfiles_medicos", "disponibilidades_medicas", "citas", "resenas")


def _dsn() -> str:
    env = dotenv_values(ENV_FILE)
    if env.get("DATABASE_URL"):
        return (
            env["DATABASE_URL"]
            .replace("postgresql+psycopg", "postgresql")
            .replace("+psycopg", "")
        )
    faltan = [k for k in ("DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME") if not env.get(k)]
    if faltan:
        sys.exit("Faltan variables en vectra_cure/.env: " + ", ".join(faltan))
    return (
        f"host={env['DB_HOST']} port={env['DB_PORT']} dbname={env['DB_NAME']} "
        f"user={env['DB_USER']} password={env['DB_PASSWORD']}"
    )


def _estado(cur) -> dict:
    cur.execute(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema = 'public' AND table_name = ANY(%s)",
        (list(TABLAS_V2),),
    )
    presentes = {r[0] for r in cur.fetchall()}
    cur.execute(
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_name = 'citas' AND column_name = 'paciente_usuario_id'"
    )
    est = {t: (t in presentes) for t in TABLAS_V2}
    est["citas.paciente_usuario_id"] = cur.fetchone() is not None
    return est


def _mostrar_estado(est: dict) -> None:
    print("Estado actual del esquema:")
    for clave, ok in est.items():
        print(f"  [{'x' if ok else ' '}] {clave}")


def _ejecutar(conn, nombre: str) -> None:
    ruta = DB_DIR / nombre
    if not ruta.exists():
        sys.exit(f"No existe {ruta}")
    print(f"\n-> Ejecutando {nombre} ...")
    with conn.cursor() as cur:
        cur.execute(ruta.read_text(encoding="utf-8"))
    conn.commit()
    print(f"   {nombre} aplicado.")


def main() -> None:
    modo = sys.argv[1] if len(sys.argv) > 1 else "--migrate"
    if modo not in ("--migrate", "--migrar", "--fresh", "--check"):
        sys.exit(f"Modo desconocido: {modo}. Usa --migrate, --fresh o --check.")

    with psycopg.connect(_dsn(), autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT current_database(), version()")
            base, version = cur.fetchone()
            print(f"Conectado a la base '{base}' - {version.split(',')[0]}\n")
            est = _estado(cur)
        _mostrar_estado(est)

        if modo == "--check":
            return
        if modo == "--fresh":
            _ejecutar(conn, "01_schema_postgresql.sql")
            _ejecutar(conn, "02_seed_demo_postgresql.sql")
        elif all(est.values()):
            print("\nEl esquema ya esta en V2. Nada que migrar.")
        else:
            _ejecutar(conn, "04_migracion_v2_postgresql.sql")

        _ejecutar(conn, "03_verificar_postgresql.sql")

    print("\nListo. Reinicia el servidor Flask y recarga la pagina.")


if __name__ == "__main__":
    main()
