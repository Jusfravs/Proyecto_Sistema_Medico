"""
iconos.py
─────────
Sistema de iconos SVG en línea de Vectra Cure. Reemplaza por completo el uso de
emojis en el front. Cada icono es una silueta de 24×24 con trazo `currentColor`
(hereda color y tamaño del texto que lo rodea).

Uso en plantillas (la función se inyecta en el contexto Jinja desde `app.py`):

    {{ icono('map-pin') }}
    {{ icono('star', 'vc-icon-star') }}
    {{ icono('activity', 'vc-icon-lg') }}

Estilos: ver `.vc-icon` en `static/css/vectra.css`.
"""

from markupsafe import Markup

# Cada valor es el interior del <svg> (viewBox 0 0 24 24). Trazo, sin relleno,
# salvo `star`, que va relleno para las calificaciones.
_ICONOS = {
    # Navegación y acciones
    "arrow-right": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    "arrow-left": '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    "plus": '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    "x": '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    "check": '<polyline points="20 6 9 17 4 12"/>',
    "check-circle": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    "alert-triangle": '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    "lock": '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    "zap": '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',

    # Datos de una ficha
    "map-pin": '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    "wallet": '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    "calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    "star": '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',

    # Administración
    "user": '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    "users": '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',

    # Especialidades (siluetas de trazo, coherentes con el resto)
    "stethoscope": '<path d="M6 3v6a6 6 0 0 0 12 0V3"/><path d="M4 3h4M16 3h4"/><path d="M12 15v2a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="12" r="2"/>',
    "activity": '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    "tooth": '<path d="M7 3.5c-1.7 0-3 1.6-3 3.6 0 1.2.3 2 .7 3.3.3 1 .5 2.4.7 3.8.2 1.6.5 3.6 1.4 5.1.3.5.8 1.1 1.5 1.1 1 0 1.4-1.1 1.6-2.1l.6-3.2c.1-.5.4-.9 1-.9s.9.4 1 .9l.6 3.2c.2 1 .6 2.1 1.6 2.1.7 0 1.2-.6 1.5-1.1.9-1.5 1.2-3.5 1.4-5.1.2-1.4.4-2.8.7-3.8.4-1.3.7-2.1.7-3.3 0-2-1.3-3.6-3-3.6-1.5 0-2.3.6-3.2 1.1-.5.3-1.1.6-1.8.6s-1.3-.3-1.8-.6C9.3 4.1 8.5 3.5 7 3.5z"/>',
    "droplet": '<path d="M12 2.69 6.34 8.35a8 8 0 1 0 11.32 0z"/>',
    "paw": '<ellipse cx="5.5" cy="12.5" rx="2.1" ry="2.7"/><ellipse cx="18.5" cy="12.5" rx="2.1" ry="2.7"/><ellipse cx="9.5" cy="6.5" rx="2.1" ry="2.7"/><ellipse cx="14.5" cy="6.5" rx="2.1" ry="2.7"/><path d="M12 12.5c-2.6 0-4.7 2.1-4.7 4.4 0 1.8 1.4 2.6 3 2.6.9 0 1.2-.2 1.7-.2s.8.2 1.7.2c1.6 0 3-.8 3-2.6 0-2.3-2.1-4.4-4.7-4.4z"/>',
    "child": '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M8.5 14.5a4 4 0 0 0 7 0"/>',
}


def icono(nombre: str, cls: str = "") -> Markup:
    """Devuelve el <svg> del icono `nombre`. Cadena vacía si no existe."""
    cuerpo = _ICONOS.get(nombre)
    if cuerpo is None:
        return Markup("")
    clases = ("vc-icon " + cls).strip()
    return Markup(
        f'<svg class="{clases}" viewBox="0 0 24 24" width="24" height="24" '
        f'aria-hidden="true" focusable="false">{cuerpo}</svg>'
    )
