"""
config.py
─────────
Configuración central de Vectra Cure. La aplicación usa PostgreSQL en todos los
entornos de ejecución; SQLite queda reservado exclusivamente para las pruebas.
"""

import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _database_uri() -> str:
    url = os.getenv("DATABASE_URL")
    if url:
        return url

    requeridas = ("DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME")
    faltantes = [nombre for nombre in requeridas if os.getenv(nombre) is None]
    if faltantes:
        raise RuntimeError(
            "Configuración PostgreSQL incompleta. Faltan: " + ", ".join(faltantes)
        )

    dialecto = os.getenv("DB_DIALECT", "postgresql+psycopg")
    usuario = quote_plus(os.environ["DB_USER"])
    clave = quote_plus(os.environ["DB_PASSWORD"])
    host = os.environ["DB_HOST"]
    puerto = os.environ["DB_PORT"]
    nombre = os.environ["DB_NAME"]
    return f"{dialecto}://{usuario}:{clave}@{host}:{puerto}/{nombre}"


def _booleano_entorno(nombre: str, default: bool = False) -> bool:
    valor = os.getenv(nombre)
    if valor is None:
        return default
    return valor.strip().lower() in {"1", "true", "yes", "on"}


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "vectra-cure-clave-desarrollo-2026")

    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = _booleano_entorno("APP_DEBUG", False)

    # Subida de fotos de consultorio / especialista (ActividadPUCE, Parte 2A)
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
    ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False
