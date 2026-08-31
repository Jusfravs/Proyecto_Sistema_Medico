"""Modelos ORM de Vectra Cure compatibles con PostgreSQL y SQLite para pruebas."""

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB


db = SQLAlchemy()
JSON_TYPE = db.JSON().with_variant(JSONB, "postgresql")


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True, index=True)
    telefono = db.Column(db.String(20), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default="paciente")
    password_hash = db.Column(db.String(255), nullable=True)
    activo = db.Column(db.Boolean, nullable=False, default=True)
    fecha_registro = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    fecha_actualizacion = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    __table_args__ = (
        db.CheckConstraint(
            "rol IN ('paciente', 'medico', 'admin')", name="ck_usuarios_rol"
        ),
    )

    perfil_medico = db.relationship(
        "PerfilMedico",
        back_populates="usuario",
        uselist=False,
        cascade="all, delete-orphan",
    )
    citas_paciente = db.relationship("Cita", back_populates="paciente")

    def __repr__(self):
        return f"<Usuario {self.email} ({self.rol})>"


class PerfilMedico(db.Model):
    __tablename__ = "perfiles_medicos"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    especialidad = db.Column(db.String(50), nullable=False, index=True)
    num_colegiatura = db.Column(db.String(50), nullable=False, unique=True)
    verificado = db.Column(db.Boolean, nullable=False, default=False)
    nombre_clinica = db.Column(db.String(150), nullable=False)
    direccion = db.Column(db.String(255), nullable=False)
    latitud = db.Column(db.Numeric(10, 8), nullable=False)
    longitud = db.Column(db.Numeric(11, 8), nullable=False)
    precio_aprox = db.Column(db.Numeric(10, 2), nullable=False)
    rating_promedio = db.Column(db.Numeric(3, 2), nullable=False, default=5.0)
    num_resenas = db.Column(db.Integer, nullable=False, default=0)
    foto = db.Column(db.String(255), nullable=True)
    galeria = db.Column(JSON_TYPE, nullable=True)
    horario_atencion = db.Column(
        db.String(100), nullable=False, default="09:00 - 18:30"
    )
    activo = db.Column(db.Boolean, nullable=False, default=True)
    fecha_actualizacion = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    __table_args__ = (
        db.CheckConstraint("latitud BETWEEN -90 AND 90", name="ck_perfiles_latitud"),
        db.CheckConstraint("longitud BETWEEN -180 AND 180", name="ck_perfiles_longitud"),
        db.CheckConstraint("precio_aprox >= 0", name="ck_perfiles_precio"),
        db.CheckConstraint(
            "rating_promedio BETWEEN 0 AND 5", name="ck_perfiles_rating"
        ),
        db.CheckConstraint("num_resenas >= 0", name="ck_perfiles_num_resenas"),
        db.Index("ix_perfiles_especialidad_activo", "especialidad", "activo"),
    )

    usuario = db.relationship("Usuario", back_populates="perfil_medico")
    resenas = db.relationship(
        "Resena",
        back_populates="medico",
        cascade="all, delete-orphan",
        order_by="Resena.fecha_creacion.desc()",
    )
    citas = db.relationship("Cita", back_populates="medico")
    disponibilidades = db.relationship(
        "DisponibilidadMedica",
        back_populates="medico",
        cascade="all, delete-orphan",
        order_by="DisponibilidadMedica.dia_semana, DisponibilidadMedica.hora_inicio",
    )

    def __repr__(self):
        return f"<PerfilMedico #{self.id} {self.especialidad}>"


class Cita(db.Model):
    __tablename__ = "citas"

    id = db.Column(db.Integer, primary_key=True)
    medico_id = db.Column(
        db.Integer,
        db.ForeignKey("perfiles_medicos.id", ondelete="RESTRICT"),
        nullable=False,
    )
    paciente_usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    paciente_nombre = db.Column(db.String(120), nullable=False)
    paciente_email = db.Column(db.String(100), nullable=False)
    paciente_telefono = db.Column(db.String(20), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.String(5), nullable=False)
    motivo = db.Column(db.Text, nullable=True)
    precio_aprox = db.Column(db.Numeric(10, 2), nullable=False)
    metodo_pago = db.Column(db.String(30), nullable=False)
    estado_pago = db.Column(db.String(30), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="CONFIRMADA")
    codigo_ticket = db.Column(db.String(30), nullable=False, unique=True, index=True)
    motivo_cancelacion = db.Column(db.String(255), nullable=True)
    fecha_creacion = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    fecha_actualizacion = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )
    turno_activo = db.Column(
        db.SmallInteger,
        db.Computed(
            "CASE WHEN estado IN ('CONFIRMADA', 'COMPLETADA') THEN 1 ELSE NULL END",
            persisted=True,
        ),
    )

    __table_args__ = (
        db.CheckConstraint("precio_aprox >= 0", name="ck_citas_precio"),
        db.CheckConstraint(
            "metodo_pago IN ('PAYPAL_MOCK', 'EFECTIVO_VENTANILLA')",
            name="ck_citas_metodo_pago",
        ),
        db.CheckConstraint(
            "estado_pago IN ('PAGADO_SIMULADO', 'PENDIENTE_VENTANILLA', "
            "'REEMBOLSADO_SIMULADO')",
            name="ck_citas_estado_pago",
        ),
        db.CheckConstraint(
            "estado IN ('CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_SHOW')",
            name="ck_citas_estado",
        ),
        db.UniqueConstraint(
            "medico_id",
            "fecha",
            "hora",
            "turno_activo",
            name="uq_citas_turno_activo",
        ),
        db.Index("ix_citas_telefono_fecha", "paciente_telefono", "fecha_creacion"),
        db.Index("ix_citas_estado_fecha", "estado", "fecha"),
    )

    medico = db.relationship("PerfilMedico", back_populates="citas")
    paciente = db.relationship("Usuario", back_populates="citas_paciente")

    def __repr__(self):
        return f"<Cita {self.codigo_ticket} {self.estado}>"


class DisponibilidadMedica(db.Model):
    """Horario estructurado por especialista; 0 representa lunes y 6 domingo."""

    __tablename__ = "disponibilidades_medicas"

    id = db.Column(db.Integer, primary_key=True)
    perfil_medico_id = db.Column(
        db.Integer,
        db.ForeignKey("perfiles_medicos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    dia_semana = db.Column(db.SmallInteger, nullable=False)
    hora_inicio = db.Column(db.String(5), nullable=False)
    hora_fin = db.Column(db.String(5), nullable=False)
    activo = db.Column(db.Boolean, nullable=False, default=True)

    __table_args__ = (
        db.CheckConstraint("dia_semana BETWEEN 0 AND 6", name="ck_disponibilidad_dia"),
        db.CheckConstraint("hora_inicio < hora_fin", name="ck_disponibilidad_rango"),
        db.UniqueConstraint(
            "perfil_medico_id", "dia_semana", "hora_inicio", "hora_fin",
            name="uq_disponibilidad_bloque",
        ),
        db.Index(
            "ix_disponibilidad_perfil_dia_activo",
            "perfil_medico_id", "dia_semana", "activo",
        ),
    )

    medico = db.relationship("PerfilMedico", back_populates="disponibilidades")

    def __repr__(self):
        return f"<DisponibilidadMedica {self.perfil_medico_id} d{self.dia_semana}>"


class Resena(db.Model):
    __tablename__ = "resenas"

    id = db.Column(db.Integer, primary_key=True)
    medico_id = db.Column(
        db.Integer,
        db.ForeignKey("perfiles_medicos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    paciente_nombre = db.Column(db.String(100), nullable=False)
    calificacion = db.Column(db.Integer, nullable=False)
    comentario = db.Column(db.Text, nullable=True)
    fecha_creacion = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )

    __table_args__ = (
        db.CheckConstraint(
            "calificacion BETWEEN 1 AND 5", name="ck_resenas_calificacion"
        ),
        db.Index("ix_resenas_medico_fecha", "medico_id", "fecha_creacion"),
    )

    medico = db.relationship("PerfilMedico", back_populates="resenas")

    def __repr__(self):
        return f"<Resena #{self.id} {self.calificacion} estrellas>"
