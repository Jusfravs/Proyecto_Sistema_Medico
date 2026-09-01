"""
tests/test_app.py
─────────────────
Pruebas de la app web (estilo curso: `unittest` + SQLite en memoria, sin tocar
PostgreSQL). Usan los modelos reales con el dialecto de pruebas SQLite.

Ejecutar desde `vectra_cure/`:
    python -m unittest discover -s tests -v
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Debe definirse antes de importar app.py: Flask-SQLAlchemy construye el motor
# durante db.init_app() y cambiar la configuración después no cambia ese motor.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app import app  # noqa: E402
from models import Cita, DisponibilidadMedica, PerfilMedico, Resena, Usuario, db  # noqa: E402
import logica as L  # noqa: E402


class BaseTest(unittest.TestCase):
    def setUp(self):
        app.config.update(
            TESTING=True,
            SECRET_KEY="test",
        )
        self.ctx = app.app_context()
        self.ctx.push()
        db.create_all()
        self._seed()
        self.c = app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        db.engine.dispose()
        self.ctx.pop()

    def _seed(self):
        admin = Usuario(nombre="Admin", email="admin@x.com", telefono="1", rol="admin")
        admin.password_hash = L.hashear_password("admin123")
        medico = Usuario(nombre="Dr. House", email="house@x.com", telefono="2", rol="medico")
        medico.password_hash = L.hashear_password("x")
        paciente = Usuario(nombre="Ana", email="ana@x.com", telefono="9", rol="paciente")
        paciente.password_hash = L.hashear_password("secret1")
        db.session.add_all([admin, medico, paciente])
        db.session.flush()
        self.perfil = PerfilMedico(
            usuario_id=medico.id, especialidad="Odontología", num_colegiatura="MED-1",
            nombre_clinica="Clinica", direccion="Calle 1", latitud=-0.18, longitud=-78.48,
            precio_aprox=30.0,
        )
        db.session.add(self.perfil)
        db.session.flush()
        for dia in range(7):
            db.session.add(DisponibilidadMedica(
                perfil_medico_id=self.perfil.id, dia_semana=dia,
                hora_inicio="08:00", hora_fin="20:00",
            ))
        db.session.commit()
        self.perfil_id = self.perfil.id

    def _login_admin(self):
        return self.c.post("/login", data={"email": "admin@x.com", "password": "admin123"})

    def _login_paciente(self):
        return self.c.post("/login", data={"email": "ana@x.com", "password": "secret1"})


class TestPublico(BaseTest):
    def test_health_paginas(self):
        for url in ["/", "/directorio", f"/especialista/{self.perfil_id}", "/registro", "/login"]:
            self.assertEqual(self.c.get(url).status_code, 200, url)

    def test_esquema_faltante_no_expone_el_depurador(self):
        db.drop_all()

        respuesta = self.c.get("/")
        contenido = respuesta.get_data(as_text=True).lower()

        self.assertEqual(respuesta.status_code, 503)
        self.assertIn("temporalmente no disponible", contenido)
        self.assertNotIn("traceback", contenido)
        self.assertNotIn("sqlalchemy", contenido)
        self.assertNotIn("programmingerror", contenido)

    def test_registro_y_login(self):
        r = self.c.post("/registro", data={
            "tipo": "paciente", "nombre": "Ana Nueva", "telefono": "9", "email": "ana-nueva@x.com",
            "password": "secret1"}, follow_redirects=True)
        self.assertIn("explorar", r.get_data(as_text=True).lower())

    def test_registro_email_duplicado(self):
        datos = {"tipo": "paciente", "nombre": "A", "telefono": "9", "email": "dup@x.com", "password": "secret1"}
        self.c.post("/registro", data=datos)
        r = self.c.post("/registro", data=datos)
        self.assertIn("Ya existe una cuenta", r.get_data(as_text=True))

    def test_registro_especialista_colegiatura_duplicada(self):
        r = self.c.post("/registro", data={
            "tipo": "medico", "nombre": "Dr. Nuevo", "telefono": "9",
            "email": "nuevo-medico@x.com", "password": "secret1",
            "especialidad": "Odontología", "num_colegiatura": "MED-1",
            "nombre_clinica": "Otra Clinica", "direccion": "Calle 2",
            "precio_aprox": "40",
        })
        texto = r.get_data(as_text=True)
        self.assertIn("colegiatura", texto)
        self.assertNotIn("Ya existe una cuenta con ese correo", texto)
        self.assertIsNone(db.session.query(Usuario).filter_by(email="nuevo-medico@x.com").first())


class TestAgendamiento(BaseTest):
    def _agendar(self, hora="10:00", metodo="EFECTIVO_VENTANILLA"):
        self._login_paciente()
        return self.c.post(f"/agendar/{self.perfil_id}", data={
            "paciente_nombre": "Ana", "paciente_email": "ana@x.com", "paciente_telefono": "9",
            "fecha": "2026-09-20", "hora": hora, "motivo": "control", "metodo_pago": metodo,
        })

    def test_agendar_efectivo_pendiente(self):
        r = self._agendar()
        self.assertEqual(r.status_code, 302)
        cita = db.session.query(Cita).first()
        self.assertEqual(cita.estado_pago, "PENDIENTE_VENTANILLA")
        self.assertRegex(cita.codigo_ticket, r"VC-\d{4}-\d{4}")

    def test_turno_ocupado(self):
        self._agendar()
        r = self._agendar()
        self.assertIn("ya está reservado", r.get_data(as_text=True))

    def test_horas_disponibles_excluye_turnos_tomados(self):
        self._login_paciente()
        antes = self.c.get(f"/agendar/{self.perfil_id}/horas?fecha=2026-09-20").get_json()
        self.assertIn("10:00", antes["horas"])
        self._agendar(hora="10:00")
        despues = self.c.get(f"/agendar/{self.perfil_id}/horas?fecha=2026-09-20").get_json()
        self.assertNotIn("10:00", despues["horas"])

    def test_horas_disponibles_rechaza_fecha_pasada(self):
        self._login_paciente()
        data = self.c.get(f"/agendar/{self.perfil_id}/horas?fecha=2020-01-01").get_json()
        self.assertEqual(data["horas"], [])
        self.assertIn("pasó", data["error"])

    def test_ticket_markdown(self):
        self._agendar()
        cod = db.session.query(Cita).first().codigo_ticket
        r = self.c.get(f"/cita/{cod}/ticket")
        self.assertEqual(r.mimetype, "text/markdown")
        self.assertIn("VECTRA CURE", r.get_data(as_text=True))

    def test_no_permite_fecha_pasada(self):
        self._login_paciente()
        r = self.c.post(f"/agendar/{self.perfil_id}", data={
            "fecha": "2020-01-01", "hora": "10:00", "metodo_pago": "EFECTIVO_VENTANILLA",
        }, follow_redirects=True)
        self.assertIn("ya pasó", r.get_data(as_text=True))
        self.assertEqual(db.session.query(Cita).count(), 0)

    def test_cita_pertenece_al_paciente_autenticado(self):
        self._agendar()
        cita = db.session.query(Cita).first()
        self.assertEqual(cita.paciente.email, "ana@x.com")

    def test_cancelar_con_reverso(self):
        # PayPal Mock: agendar muestra la pasarela; se confirma en /pago/aprobar
        self._agendar(metodo="PAYPAL_MOCK")
        self.c.post("/pago/aprobar", data={
            "medico_id": str(self.perfil_id), "paciente_nombre": "Ana",
            "paciente_email": "ana@x.com", "paciente_telefono": "9",
            "fecha": "2026-09-20", "hora": "10:00", "motivo": "control",
        })
        cita = db.session.query(Cita).first()
        self.assertEqual(cita.estado_pago, "PAGADO_SIMULADO")
        r = self.c.post(f"/mi-cita/{cita.codigo_ticket}/cancelar",
                        data={"motivo": "Ya no presento molestias o síntomas médicos"})
        self.assertEqual(r.status_code, 302)
        db.session.refresh(cita)
        self.assertEqual(cita.estado, "CANCELADA")
        self.assertEqual(cita.estado_pago, "REEMBOLSADO_SIMULADO")


class TestResenasYRBAC(BaseTest):
    def test_resena_recalcula_rating(self):
        self._login_paciente()
        for n in (5, 4, 3):
            self.c.post(f"/especialista/{self.perfil_id}/resena", data={"calificacion": n})
        db.session.refresh(self.perfil)
        self.assertEqual(self.perfil.num_resenas, 3)
        self.assertEqual(float(self.perfil.rating_promedio), 4.0)

    def test_resena_usa_el_nombre_del_paciente_autenticado(self):
        self._login_paciente()
        self.c.post(f"/especialista/{self.perfil_id}/resena", data={"calificacion": 5})
        self.assertEqual(db.session.query(Resena).first().paciente_nombre, "Ana")

    def test_resena_requiere_sesion_de_paciente(self):
        r = self.c.post(f"/especialista/{self.perfil_id}/resena", data={"calificacion": 5})
        self.assertEqual(r.status_code, 302)
        self.assertIn("/login", r.headers["Location"])
        self.assertEqual(db.session.query(Resena).count(), 0)

    def test_resena_fuera_de_rango(self):
        self._login_paciente()
        r = self.c.post(f"/especialista/{self.perfil_id}/resena",
                        data={"calificacion": "9"}, follow_redirects=True)
        self.assertIn("entre 1 y 5", r.get_data(as_text=True))

    def test_admin_requiere_sesion(self):
        r = self.c.get("/admin")
        self.assertEqual(r.status_code, 302)
        self.assertIn("/login", r.headers["Location"])

    def test_admin_rechaza_paciente(self):
        self.c.post("/registro", data={
            "tipo": "paciente", "nombre": "P", "telefono": "9", "email": "p@x.com", "password": "secret1"})
        self.c.post("/login", data={"email": "p@x.com", "password": "secret1"})
        r = self.c.get("/admin/citas")
        self.assertEqual(r.status_code, 302)

    def test_admin_crea_especialista(self):
        self._login_admin()
        r = self.c.post("/admin/especialistas/nuevo", data={
            "nombre": "Dra N", "email": "n@x.com", "telefono": "9", "password": "x123456",
            "especialidad": "Pediatría", "num_colegiatura": "MED-2", "nombre_clinica": "C2",
            "direccion": "D2", "precio_aprox": "40", "latitud": "-0.19", "longitud": "-78.49",
        })
        self.assertEqual(r.status_code, 302)
        self.assertEqual(db.session.query(PerfilMedico).count(), 2)


if __name__ == "__main__":
    unittest.main()
