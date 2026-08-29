"""
auth.py
───────
Decoradores de seguridad para autenticación y control de acceso por roles.
Adaptado del proyecto del curso (`tienda_online/auth.py`): mismo patrón con
`@wraps`, `session` y `flash` + `redirect`.

Roles: 'paciente' | 'medico' | 'admin'  (ver constantes.ROLES)
"""

from functools import wraps

from flask import flash, redirect, session, url_for


def login_requerido(vista):
    """Exige que el usuario haya iniciado sesión."""

    @wraps(vista)
    def envoltura(*args, **kwargs):
        if "usuario_id" not in session:
            flash("Debes iniciar sesión para acceder a esa página.", "danger")
            return redirect(url_for("login"))
        return vista(*args, **kwargs)

    return envoltura


def rol_requerido(*roles):
    """
    Fábrica de decoradores: exige sesión iniciada y que el rol del usuario
    esté entre `roles`. Uso: @rol_requerido("admin") o @rol_requerido("admin", "medico").

    Defensa contra ejecución directa por URL / curl / Postman: si no cumple,
    redirige con mensaje y NO ejecuta la vista.
    """

    def decorador(vista):
        @wraps(vista)
        def envoltura(*args, **kwargs):
            if "usuario_id" not in session:
                flash("Debes iniciar sesión para acceder a esa página.", "danger")
                return redirect(url_for("login"))
            if session.get("usuario_rol") not in roles:
                flash("No tienes permisos para acceder a esa página.", "danger")
                return redirect(url_for("inicio"))
            return vista(*args, **kwargs)

        return envoltura

    return decorador
