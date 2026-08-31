"""
app.py
──────
Servidor Flask de Vectra Cure: plataforma de geolocalización y agendamiento
médico respaldada por PostgreSQL.
"""

from pathlib import Path
from uuid import uuid4
from datetime import date
from urllib.parse import urlparse

from flask import (
    Flask, abort, flash, redirect, render_template, request, Response, session, url_for,
)
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.utils import secure_filename

import constantes as C
import logica as L
from auth import login_requerido, rol_requerido
from config import Config

from models import db, Cita, DisponibilidadMedica, PerfilMedico, Resena, Usuario


app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)


@app.errorhandler(SQLAlchemyError)
def error_base_datos(error):
    """Evita exponer consultas, credenciales o rutas internas al visitante."""
    try:
        db.session.rollback()
    except SQLAlchemyError:
        pass
    app.logger.exception("Error de base de datos no controlado")
    html = app.jinja_env.get_template("error_base_datos.html").render()
    return Response(html, status=503, mimetype="text/html")


# ══════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════

def _usuario_actual():
    uid = session.get("usuario_id")
    return db.session.get(Usuario, uid) if uid else None


def _iniciar_sesion(usuario):
    session["usuario_id"] = usuario.id
    session["usuario_nombre"] = usuario.nombre
    session["usuario_rol"] = usuario.rol


def _destino_usuario(usuario):
    if usuario.rol == C.ROL_ADMIN:
        return url_for("panel_admin")
    return url_for("directorio")


def _url_interna(destino):
    """Evita redirecciones hacia dominios externos a partir de `next`."""
    if not destino:
        return None
    parsed = urlparse(destino)
    return destino if not parsed.netloc and destino.startswith("/") else None


def _cita_del_paciente(codigo):
    cita = _cita_por_codigo(codigo)
    usuario = _usuario_actual()
    if not usuario or cita.paciente_usuario_id != usuario.id:
        abort(403)
    return cita


@app.context_processor
def _inyectar_globales():
    return {
        "usuario_actual": _usuario_actual(),
        "ESPECIALIDADES": C.ESPECIALIDADES,
        "ICONO_ESPECIALIDAD": C.ICONO_ESPECIALIDAD,
        "constantes": C,
        "L": L,
        "hoy": date.today().isoformat(),
    }


def _guardar_imagen(archivo):
    if archivo is None or not archivo.filename:
        return None
    nombre = secure_filename(archivo.filename)
    ext = Path(nombre).suffix.lower()
    if ext not in app.config["ALLOWED_IMAGE_EXTENSIONS"]:
        raise ValueError("Solo se permiten imágenes JPG, JPEG, PNG, GIF o WEBP.")
    carpeta = Path(app.config["UPLOAD_FOLDER"])
    carpeta.mkdir(parents=True, exist_ok=True)
    final = f"{uuid4().hex}{ext}"
    archivo.save(carpeta / final)
    return final


def _cita_por_codigo(codigo):
    cita = db.session.query(Cita).filter_by(codigo_ticket=codigo).first()
    if cita is None:
        abort(404)
    return cita


def _codigo_ticket_unico():
    for _ in range(20):
        codigo = L.generar_codigo_ticket()
        if not db.session.query(Cita).filter_by(codigo_ticket=codigo).first():
            return codigo
    raise RuntimeError("No se pudo generar un código de ticket único.")


def _turno_ocupado(medico_id, fecha, hora):
    return db.session.query(Cita).filter(
        Cita.medico_id == medico_id,
        Cita.fecha == fecha,
        Cita.hora == hora,
        Cita.estado.in_((C.ESTADO_CITA_CONFIRMADA, C.ESTADO_CITA_COMPLETADA)),
    ).first() is not None


@app.errorhandler(413)
def _imagen_muy_grande(_e):
    flash("La imagen no puede superar los 5 MB.", "danger")
    return redirect(request.referrer or url_for("inicio"))


# ══════════════════════════════════════════════════════════════════
# PÚBLICO — LANDING Y DIRECTORIO  (06 §2.1, §2.2)
# ══════════════════════════════════════════════════════════════════

@app.route("/")
def inicio():
    destacados = L.ordenar_directorio(
        db.session.query(PerfilMedico).filter_by(activo=True).all(),
        C.ORDEN_RATING,
    )[:3]
    return render_template("index.html", destacados=destacados)


@app.route("/directorio")
def directorio():
    especialidad = request.args.get("especialidad") or None
    orden = request.args.get("orden", C.ORDEN_RATING)
    q = (request.args.get("q") or "").strip().lower()
    try:
        lat = float(request.args.get("lat", C.UBICACION_REFERENCIA[0]))
        lng = float(request.args.get("lng", C.UBICACION_REFERENCIA[1]))
        radio = float(request.args.get("radio", C.RADIO_INICIAL_KM))
    except ValueError:
        lat, lng, radio = (*C.UBICACION_REFERENCIA, C.RADIO_INICIAL_KM)
    radio = radio if radio in (C.RADIO_INICIAL_KM, *C.RADIOS_AMPLIACION_KM) else C.RADIO_INICIAL_KM
    if orden not in C.ORDENES:
        orden = C.ORDEN_RATING

    consulta = db.session.query(PerfilMedico).filter_by(activo=True)
    if especialidad in C.ESPECIALIDADES:
        consulta = consulta.filter_by(especialidad=especialidad)

    perfiles = consulta.all()
    if q:
        perfiles = [p for p in perfiles if q in p.usuario.nombre.lower() or q in p.nombre_clinica.lower()]
    distancias = {p.id: L.distancia_a_referencia(p, lat, lng) for p in perfiles}
    perfiles = [p for p in perfiles if distancias[p.id] <= radio]
    perfiles = L.ordenar_directorio(perfiles, orden, lat, lng)

    return render_template(
        "directorio.html",
        perfiles=perfiles, distancias=distancias,
        especialidad=especialidad, orden=orden, q=q, lat=lat, lng=lng, radio=radio,
        map_tile_url=app.config["MAP_TILE_URL"], map_attribution=app.config["MAP_ATTRIBUTION"],
        route_service_url=app.config["ROUTE_SERVICE_URL"],
    )


@app.route("/especialista/<int:medico_id>")
def especialista(medico_id):
    perfil = db.get_or_404(PerfilMedico, medico_id)
    return render_template(
        "especialista.html",
        perfil=perfil,
        distancia=L.distancia_a_referencia(perfil),
        bloques=C.BLOQUES_HORARIOS,
        motivos_cancelacion=C.MOTIVOS_CANCELACION,
    )


# ══════════════════════════════════════════════════════════════════
# AUTENTICACIÓN  (06 §2.5)
# ══════════════════════════════════════════════════════════════════

@app.route("/registro", methods=["GET", "POST"])
def registro():
    if request.method == "POST":
        tipo = request.form.get("tipo", "paciente")
        try:
            nombre = L.texto_requerido(request.form.get("nombre"), "nombre")
            email = L.email_valido(request.form.get("email"))
            telefono = L.texto_requerido(request.form.get("telefono"), "teléfono")
            password = request.form.get("password", "")
            if len(password) < 6:
                raise ValueError("La contraseña debe tener al menos 6 caracteres.")
            if db.session.query(Usuario).filter_by(email=email).first():
                raise ValueError("Ya existe una cuenta con ese correo.")

            usuario = Usuario(
                nombre=nombre, email=email, telefono=telefono,
                rol=C.ROL_MEDICO if tipo == "medico" else C.ROL_PACIENTE,
            )
            usuario.password_hash = L.hashear_password(password)
            db.session.add(usuario)
            db.session.flush()

            if tipo == "medico":
                foto = _guardar_imagen(request.files.get("foto"))
                perfil = PerfilMedico(
                    usuario_id=usuario.id,
                    especialidad=L.opcion_valida(
                        request.form.get("especialidad"), C.ESPECIALIDADES, "especialidad"),
                    num_colegiatura=L.texto_requerido(
                        request.form.get("num_colegiatura"), "N° de colegiatura"),
                    nombre_clinica=L.texto_requerido(
                        request.form.get("nombre_clinica"), "nombre del consultorio"),
                    direccion=L.texto_requerido(request.form.get("direccion"), "dirección"),
                    latitud=float(request.form.get("latitud") or C.UBICACION_REFERENCIA[0]),
                    longitud=float(request.form.get("longitud") or C.UBICACION_REFERENCIA[1]),
                    precio_aprox=L.numero_no_negativo(request.form.get("precio_aprox"), "precio aprox."),
                    horario_atencion=request.form.get("horario_atencion") or C.HORARIO_ATENCION_DEFECTO,
                    foto=foto,
                    verificado=True,  # simulado: "en revisión 2-3 min" -> verificado
                )
                db.session.add(perfil)
                db.session.flush()
                for dia, inicio, fin in C.DISPONIBILIDAD_DEMO:
                    db.session.add(DisponibilidadMedica(
                        perfil_medico_id=perfil.id, dia_semana=dia,
                        hora_inicio=inicio, hora_fin=fin,
                    ))

            db.session.commit()
        except ValueError as err:
            db.session.rollback()
            flash(str(err), "danger")
            return render_template("registro.html", datos=request.form, tipo=tipo)
        except IntegrityError:
            db.session.rollback()
            flash("Ya existe una cuenta con ese correo.", "danger")
            return render_template("registro.html", datos=request.form, tipo=tipo)

        _iniciar_sesion(usuario)
        if tipo == "medico":
            flash("Tu perfil profesional quedó verificado y visible en el mapa.", "success")
        else:
            flash("Cuenta creada. Ya puedes explorar y reservar tu atención.", "success")
        return redirect(url_for("directorio", destacado=perfil.id) if tipo == "medico" else url_for("directorio"))

    return render_template("registro.html", datos={}, tipo=request.args.get("tipo", "paciente"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        usuario = db.session.query(Usuario).filter_by(email=email).first()

        if usuario and usuario.activo and L.verificar_password(usuario.password_hash, password):
            _iniciar_sesion(usuario)
            flash(f"¡Bienvenido, {usuario.nombre}!", "success")
            return redirect(_url_interna(request.form.get("next")) or _destino_usuario(usuario))

        flash("Correo o contraseña incorrectos.", "danger")

    return render_template("login.html", next_url=_url_interna(request.args.get("next")))


@app.route("/logout")
def logout():
    session.clear()
    flash("Sesión cerrada correctamente.", "success")
    return redirect(url_for("inicio"))


# ══════════════════════════════════════════════════════════════════
# PERFIL DEL USUARIO  (CRUD Usuario: read / update propios)
# ══════════════════════════════════════════════════════════════════

@app.route("/perfil")
@login_requerido
def perfil():
    return render_template("perfil.html", usuario=_usuario_actual())


@app.route("/perfil/editar", methods=["POST"])
@login_requerido
def editar_perfil():
    usuario = _usuario_actual()
    try:
        usuario.nombre = L.texto_requerido(request.form.get("nombre"), "nombre")
        usuario.telefono = L.texto_requerido(request.form.get("telefono"), "teléfono")
        nueva = request.form.get("password", "")
        if nueva:
            if len(nueva) < 6:
                raise ValueError("La contraseña debe tener al menos 6 caracteres.")
            usuario.password_hash = L.hashear_password(nueva)
        db.session.commit()
        session["usuario_nombre"] = usuario.nombre
        flash("Perfil actualizado.", "success")
    except ValueError as err:
        db.session.rollback()
        flash(str(err), "danger")
    return redirect(url_for("perfil"))


# ══════════════════════════════════════════════════════════════════
# AGENDAMIENTO DE CITAS  (03 §1, §2 / 06 User Flow 1)  — CRUD Cita: create
# ══════════════════════════════════════════════════════════════════

@app.route("/agendar/<int:medico_id>", methods=["GET", "POST"])
@rol_requerido(C.ROL_PACIENTE)
def agendar(medico_id):
    perfil = db.get_or_404(PerfilMedico, medico_id)
    usuario = _usuario_actual()

    if request.method == "POST":
        try:
            datos = {
                "medico_id": perfil.id,
                "paciente_usuario_id": usuario.id,
                "paciente_nombre": usuario.nombre,
                "paciente_email": usuario.email,
                "paciente_telefono": usuario.telefono,
                "fecha": request.form.get("fecha", ""),
                "hora": L.opcion_valida(request.form.get("hora"), C.BLOQUES_HORARIOS, "hora"),
                "motivo": (request.form.get("motivo") or "").strip(),
                "metodo_pago": L.opcion_valida(
                    request.form.get("metodo_pago"), C.METODOS_PAGO, "método de pago"),
            }
            fecha = L.fecha_no_pasada(datos["fecha"])
            datos["hora"] = L.opcion_valida(
                datos["hora"], L.bloques_disponibles(perfil, fecha), "hora")
            if _turno_ocupado(perfil.id, fecha, datos["hora"]):
                raise ValueError("Ese turno ya está reservado. Elige otro horario.")
        except ValueError as err:
            flash(str(err), "danger")
            return render_template(
                "agendar.html", perfil=perfil, bloques=C.BLOQUES_HORARIOS,
                datos=request.form, usuario=usuario,
            )

        if datos["metodo_pago"] == C.PAGO_PAYPAL_MOCK:
            # Pasarela simulada: se confirma en /pago/aprobar
            return render_template("pago.html", perfil=perfil, datos=datos)
        # Efectivo: se crea directamente
        return _crear_cita(datos)

    return render_template(
        "agendar.html", perfil=perfil, bloques=C.BLOQUES_HORARIOS, datos={}, usuario=usuario,
    )


@app.route("/pago/aprobar", methods=["POST"])
@rol_requerido(C.ROL_PACIENTE)
def aprobar_pago():
    usuario = _usuario_actual()
    datos = {
        "medico_id": int(request.form["medico_id"]),
        "paciente_usuario_id": usuario.id,
        "paciente_nombre": usuario.nombre,
        "paciente_email": usuario.email,
        "paciente_telefono": usuario.telefono,
        "fecha": request.form["fecha"],
        "hora": request.form["hora"],
        "motivo": request.form.get("motivo", ""),
        "metodo_pago": C.PAGO_PAYPAL_MOCK,
    }
    return _crear_cita(datos)


def _crear_cita(datos):
    perfil = db.get_or_404(PerfilMedico, datos["medico_id"])
    try:
        fecha = L.fecha_no_pasada(datos["fecha"])
        hora = L.opcion_valida(datos["hora"], L.bloques_disponibles(perfil, fecha), "hora")
    except ValueError as err:
        flash(str(err), "danger")
        return redirect(url_for("agendar", medico_id=perfil.id))
    if _turno_ocupado(perfil.id, fecha, datos["hora"]):
        flash("Ese turno acaba de ser reservado por otra persona. Elige otro horario.", "danger")
        return redirect(url_for("agendar", medico_id=perfil.id))

    try:
        cita = Cita(
            medico_id=perfil.id,
            paciente_usuario_id=datos["paciente_usuario_id"],
            paciente_nombre=datos["paciente_nombre"],
            paciente_email=datos["paciente_email"],
            paciente_telefono=datos["paciente_telefono"],
            fecha=fecha,
            hora=hora,
            motivo=datos["motivo"] or None,
            precio_aprox=perfil.precio_aprox,
            metodo_pago=datos["metodo_pago"],
            estado_pago=L.estado_pago_inicial(datos["metodo_pago"]),
            estado=C.ESTADO_CITA_CONFIRMADA,
            codigo_ticket=_codigo_ticket_unico(),
        )
        db.session.add(cita)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        flash("No se pudo registrar la cita. Inténtalo de nuevo.", "danger")
        return redirect(url_for("agendar", medico_id=perfil.id))

    app.logger.info("Notificación simulada -> %s / %s (ticket %s)",
                    cita.paciente_email, cita.paciente_telefono, cita.codigo_ticket)
    flash("¡Cita confirmada! Se envió el aviso a tu teléfono y correo.", "success")
    return redirect(url_for("cita_exito", codigo=cita.codigo_ticket))


@app.route("/cita-exito/<codigo>")
@rol_requerido(C.ROL_PACIENTE)
def cita_exito(codigo):
    cita = _cita_del_paciente(codigo)
    return render_template("cita_exito.html", cita=cita)


@app.route("/cita/<codigo>/ticket")
@rol_requerido(C.ROL_PACIENTE)
def descargar_ticket(codigo):
    cita = _cita_del_paciente(codigo)
    return Response(
        L.render_ticket(cita),
        mimetype="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{codigo}.md"'},
    )


# ══════════════════════════════════════════════════════════════════
# CONSULTAR Y CANCELAR CITA  (03 §3 / 06 User Flow 2)  — CRUD Cita: read / update
# ══════════════════════════════════════════════════════════════════

@app.route("/consultar-cita")
@rol_requerido(C.ROL_PACIENTE)
def consultar_cita():
    return redirect(url_for("mis_citas"))


@app.route("/mis-citas")
@rol_requerido(C.ROL_PACIENTE)
def mis_citas():
    citas = db.session.query(Cita).filter_by(
        paciente_usuario_id=_usuario_actual().id
    ).order_by(Cita.fecha.asc(), Cita.hora.asc()).all()
    return render_template("mis_citas.html", citas=citas)


@app.route("/mi-cita/<codigo>")
@rol_requerido(C.ROL_PACIENTE)
def mi_cita(codigo):
    cita = _cita_del_paciente(codigo)
    return render_template("cita_detalle.html", cita=cita)


@app.route("/mi-cita/<codigo>/cancelar", methods=["GET", "POST"])
@rol_requerido(C.ROL_PACIENTE)
def cancelar_cita(codigo):
    cita = _cita_del_paciente(codigo)

    if cita.estado == C.ESTADO_CITA_CANCELADA:
        flash("Esta cita ya estaba cancelada.", "warning")
        return redirect(url_for("mi_cita", codigo=codigo))

    if request.method == "POST":
        motivo = request.form.get("motivo", "")
        if motivo not in C.MOTIVOS_CANCELACION:
            flash("Selecciona un motivo válido.", "danger")
            return render_template("cancelar_cita.html", cita=cita,
                                   motivos=C.MOTIVOS_CANCELACION)
        if motivo == "Otros":
            detalle = (request.form.get("detalle") or "").strip()
            motivo = f"Otros: {detalle}" if detalle else "Otros"

        cita.estado = C.ESTADO_CITA_CANCELADA
        cita.motivo_cancelacion = motivo
        L.simular_reverso(cita)
        db.session.commit()
        app.logger.info("Reverso simulado emitido para ticket %s", cita.codigo_ticket)
        flash("¡Cita cancelada con éxito! Se emitió la nota de reverso a tu cuenta.", "success")
        return redirect(url_for("mi_cita", codigo=codigo))

    return render_template("cancelar_cita.html", cita=cita, motivos=C.MOTIVOS_CANCELACION)


# ══════════════════════════════════════════════════════════════════
# RESEÑAS  (CRUD Resena: create público)
# ══════════════════════════════════════════════════════════════════

@app.route("/especialista/<int:medico_id>/resena", methods=["POST"])
def crear_resena(medico_id):
    perfil = db.get_or_404(PerfilMedico, medico_id)
    try:
        resena = Resena(
            medico_id=perfil.id,
            paciente_nombre=L.texto_requerido(request.form.get("paciente_nombre"), "nombre"),
            calificacion=int(L.numero_no_negativo(request.form.get("calificacion"), "calificación", int)),
            comentario=(request.form.get("comentario") or "").strip() or None,
        )
        if not 1 <= resena.calificacion <= 5:
            raise ValueError("La calificación debe estar entre 1 y 5 estrellas.")
        db.session.add(resena)
        db.session.flush()
        L.recalcular_rating(perfil)
        db.session.commit()
        flash("¡Gracias por tu reseña!", "success")
    except ValueError as err:
        db.session.rollback()
        flash(str(err), "danger")
    return redirect(url_for("especialista", medico_id=medico_id))


@app.route("/panel-profesional")
@rol_requerido(C.ROL_MEDICO)
def panel_profesional():
    perfil = _usuario_actual().perfil_medico
    if perfil is None:
        abort(404)
    proximas = db.session.query(Cita).filter(
        Cita.medico_id == perfil.id,
        Cita.fecha >= date.today(),
        Cita.estado == C.ESTADO_CITA_CONFIRMADA,
    ).order_by(Cita.fecha.asc(), Cita.hora.asc()).limit(3).all()
    balance = sum(
        float(cita.precio_aprox) for cita in perfil.citas
        if cita.estado == C.ESTADO_CITA_CONFIRMADA and cita.estado_pago != C.ESTADO_PAGO_REEMBOLSADO
    )
    return render_template("panel_profesional.html", perfil=perfil, proximas=proximas, balance=balance)


# ══════════════════════════════════════════════════════════════════
# PANEL ADMIN  (CRUD completo: update / delete de todas las entidades)
# ══════════════════════════════════════════════════════════════════

@app.route("/admin")
@rol_requerido(C.ROL_ADMIN)
def panel_admin():
    resumen = {
        "usuarios": db.session.query(Usuario).count(),
        "especialistas": db.session.query(PerfilMedico).count(),
        "citas": db.session.query(Cita).count(),
        "resenas": db.session.query(Resena).count(),
    }
    return render_template("admin/panel.html", resumen=resumen)


# ── Especialistas ────────────────────────────────────────────────
@app.route("/admin/especialistas")
@rol_requerido(C.ROL_ADMIN)
def admin_especialistas():
    perfiles = db.session.query(PerfilMedico).order_by(PerfilMedico.id.desc()).all()
    return render_template("admin/especialistas.html", perfiles=perfiles)


@app.route("/admin/especialistas/nuevo", methods=["GET", "POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_especialista_nuevo():
    if request.method == "POST":
        foto = None
        try:
            email = L.email_valido(request.form.get("email"))
            usuario = db.session.query(Usuario).filter_by(email=email).first()
            if usuario is None:
                usuario = Usuario(
                    nombre=L.texto_requerido(request.form.get("nombre"), "nombre"),
                    email=email,
                    telefono=L.texto_requerido(request.form.get("telefono"), "teléfono"),
                    rol=C.ROL_MEDICO,
                )
                usuario.password_hash = L.hashear_password(request.form.get("password") or "medico123")
                db.session.add(usuario)
                db.session.flush()
            elif usuario.perfil_medico:
                raise ValueError("Ese usuario ya tiene un perfil de especialista.")
            else:
                usuario.rol = C.ROL_MEDICO

            foto = _guardar_imagen(request.files.get("foto"))
            perfil = PerfilMedico(
                usuario_id=usuario.id,
                especialidad=L.opcion_valida(
                    request.form.get("especialidad"), C.ESPECIALIDADES, "especialidad"),
                num_colegiatura=L.texto_requerido(request.form.get("num_colegiatura"), "colegiatura"),
                verificado=bool(request.form.get("verificado")),
                nombre_clinica=L.texto_requerido(request.form.get("nombre_clinica"), "consultorio"),
                direccion=L.texto_requerido(request.form.get("direccion"), "dirección"),
                latitud=float(request.form.get("latitud") or C.UBICACION_REFERENCIA[0]),
                longitud=float(request.form.get("longitud") or C.UBICACION_REFERENCIA[1]),
                precio_aprox=L.numero_no_negativo(request.form.get("precio_aprox"), "precio"),
                horario_atencion=request.form.get("horario_atencion") or C.HORARIO_ATENCION_DEFECTO,
                foto=foto,
            )
            db.session.add(perfil)
            db.session.flush()
            for dia, inicio, fin in C.DISPONIBILIDAD_DEMO:
                db.session.add(DisponibilidadMedica(
                    perfil_medico_id=perfil.id, dia_semana=dia,
                    hora_inicio=inicio, hora_fin=fin,
                ))
            db.session.commit()
            flash(f"Especialista '{usuario.nombre}' creado.", "success")
            return redirect(url_for("admin_especialistas"))
        except (ValueError, IntegrityError) as err:
            db.session.rollback()
            flash(str(err) if isinstance(err, ValueError) else "Datos inválidos o duplicados.", "danger")
        return render_template("admin/especialista_form.html", perfil=None, datos=request.form)

    return render_template("admin/especialista_form.html", perfil=None, datos={})


@app.route("/admin/especialistas/<int:medico_id>/editar", methods=["GET", "POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_especialista_editar(medico_id):
    perfil = db.get_or_404(PerfilMedico, medico_id)
    if request.method == "POST":
        try:
            perfil.especialidad = L.opcion_valida(
                request.form.get("especialidad"), C.ESPECIALIDADES, "especialidad")
            perfil.num_colegiatura = L.texto_requerido(request.form.get("num_colegiatura"), "colegiatura")
            perfil.nombre_clinica = L.texto_requerido(request.form.get("nombre_clinica"), "consultorio")
            perfil.direccion = L.texto_requerido(request.form.get("direccion"), "dirección")
            perfil.precio_aprox = L.numero_no_negativo(request.form.get("precio_aprox"), "precio")
            perfil.horario_atencion = request.form.get("horario_atencion") or C.HORARIO_ATENCION_DEFECTO
            perfil.verificado = bool(request.form.get("verificado"))
            if request.form.get("latitud"):
                perfil.latitud = float(request.form["latitud"])
            if request.form.get("longitud"):
                perfil.longitud = float(request.form["longitud"])
            nueva_foto = _guardar_imagen(request.files.get("foto"))
            if nueva_foto:
                perfil.foto = nueva_foto
            db.session.commit()
            flash("Especialista actualizado.", "success")
            return redirect(url_for("admin_especialistas"))
        except ValueError as err:
            db.session.rollback()
            flash(str(err), "danger")
    return render_template("admin/especialista_form.html", perfil=perfil, datos={})


@app.route("/admin/especialistas/<int:medico_id>/desactivar", methods=["POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_especialista_desactivar(medico_id):
    perfil = db.get_or_404(PerfilMedico, medico_id)
    perfil.activo = not perfil.activo
    db.session.commit()
    flash(f"Especialista {'reactivado' if perfil.activo else 'desactivado'}.", "success")
    return redirect(url_for("admin_especialistas"))


@app.route("/admin/especialistas/<int:medico_id>/verificar", methods=["POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_especialista_verificar(medico_id):
    perfil = db.get_or_404(PerfilMedico, medico_id)
    perfil.verificado = not perfil.verificado
    db.session.commit()
    flash(f"Insignia 🛡️ {'activada' if perfil.verificado else 'retirada'}.", "success")
    return redirect(url_for("admin_especialistas"))


# ── Citas ────────────────────────────────────────────────────────
@app.route("/admin/citas")
@rol_requerido(C.ROL_ADMIN)
def admin_citas():
    estado = request.args.get("estado") or None
    consulta = db.session.query(Cita).order_by(Cita.fecha_creacion.desc())
    if estado in C.ESTADOS_CITA:
        consulta = consulta.filter_by(estado=estado)
    return render_template("admin/citas.html", citas=consulta.all(), estado=estado)


@app.route("/admin/citas/<int:cita_id>/estado", methods=["POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_cita_estado(cita_id):
    cita = db.get_or_404(Cita, cita_id)
    nuevo = request.form.get("estado")
    if nuevo not in C.ESTADOS_CITA:
        abort(400)
    cita.estado = nuevo
    if nuevo == C.ESTADO_CITA_CANCELADA:
        cita.motivo_cancelacion = cita.motivo_cancelacion or "Cancelada por administración"
        L.simular_reverso(cita)
    db.session.commit()
    flash(f"Cita {cita.codigo_ticket} → {C.ESTADO_CITA_ETIQUETA[nuevo]}.", "success")
    return redirect(url_for("admin_citas"))


@app.route("/admin/citas/<int:cita_id>/eliminar", methods=["POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_cita_eliminar(cita_id):
    cita = db.get_or_404(Cita, cita_id)
    db.session.delete(cita)
    db.session.commit()
    flash("Cita eliminada.", "success")
    return redirect(url_for("admin_citas"))


# ── Reseñas ──────────────────────────────────────────────────────
@app.route("/admin/resenas")
@rol_requerido(C.ROL_ADMIN)
def admin_resenas():
    resenas = db.session.query(Resena).order_by(Resena.fecha_creacion.desc()).all()
    return render_template("admin/resenas.html", resenas=resenas)


@app.route("/admin/resenas/<int:resena_id>/editar", methods=["GET", "POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_resena_editar(resena_id):
    resena = db.get_or_404(Resena, resena_id)
    if request.method == "POST":
        try:
            resena.paciente_nombre = L.texto_requerido(request.form.get("paciente_nombre"), "nombre")
            cal = int(L.numero_no_negativo(request.form.get("calificacion"), "calificación", int))
            if not 1 <= cal <= 5:
                raise ValueError("La calificación debe estar entre 1 y 5.")
            resena.calificacion = cal
            resena.comentario = (request.form.get("comentario") or "").strip() or None
            db.session.flush()
            L.recalcular_rating(resena.medico)
            db.session.commit()
            flash("Reseña actualizada.", "success")
            return redirect(url_for("admin_resenas"))
        except ValueError as err:
            db.session.rollback()
            flash(str(err), "danger")
    return render_template("admin/resena_form.html", resena=resena)


@app.route("/admin/resenas/<int:resena_id>/eliminar", methods=["POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_resena_eliminar(resena_id):
    resena = db.get_or_404(Resena, resena_id)
    perfil = resena.medico
    db.session.delete(resena)
    db.session.flush()
    L.recalcular_rating(perfil)
    db.session.commit()
    flash("Reseña eliminada.", "success")
    return redirect(url_for("admin_resenas"))


# ── Usuarios ─────────────────────────────────────────────────────
@app.route("/admin/usuarios")
@rol_requerido(C.ROL_ADMIN)
def admin_usuarios():
    usuarios = db.session.query(Usuario).order_by(Usuario.fecha_registro.desc()).all()
    return render_template("admin/usuarios.html", usuarios=usuarios)


@app.route("/admin/usuarios/<int:usuario_id>/activar", methods=["POST"])
@rol_requerido(C.ROL_ADMIN)
def admin_usuario_activar(usuario_id):
    usuario = db.get_or_404(Usuario, usuario_id)
    if usuario.id == session.get("usuario_id"):
        flash("No puedes desactivar tu propia cuenta.", "warning")
        return redirect(url_for("admin_usuarios"))
    usuario.activo = not usuario.activo
    db.session.commit()
    flash(f"Usuario {'activado' if usuario.activo else 'desactivado'}.", "success")
    return redirect(url_for("admin_usuarios"))


if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"])
