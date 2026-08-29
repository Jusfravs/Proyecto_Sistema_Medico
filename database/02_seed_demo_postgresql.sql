-- Datos de demostración para Vectra Cure.
-- Ejecutar manualmente en pgAdmin 4, conectado a la base vectra_cure,
-- después de 01_schema_postgresql.sql.

DO $$
BEGIN
  IF current_database() <> 'vectra_cure' THEN
    RAISE EXCEPTION 'Conéctate a la base vectra_cure antes de ejecutar la semilla.';
  END IF;
  IF to_regclass('public.usuarios') IS NULL
     OR to_regclass('public.perfiles_medicos') IS NULL
     OR to_regclass('public.citas') IS NULL
     OR to_regclass('public.resenas') IS NULL THEN
    RAISE EXCEPTION 'El esquema está incompleto. Ejecuta primero 01_schema_postgresql.sql.';
  END IF;
END $$;

BEGIN;

INSERT INTO usuarios (nombre, email, telefono, rol, password_hash, activo)
VALUES
  ('Admin Vectra', 'admin@vectra.demo', '+593 99 000 0001', 'admin', 'scrypt:32768:8:1$izs1DBqB8ZliFkLx$b6c9bde1630b74af9fa2845d47042ac6d974a1ee748d61afa20505c1da8b7a3c71aba8c1c916a16f7b738ecdbd852ba94cd9d67e5a5c919f85746febaeb99359', TRUE),
  ('Dr. Alejandro Morales', 'medico0@vectra.demo', '+593 98 111 2000', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Valeria Salazar', 'medico1@vectra.demo', '+593 98 111 2001', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Camilo Andrade', 'medico2@vectra.demo', '+593 98 111 2002', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Daniela Rueda', 'medico3@vectra.demo', '+593 98 111 2003', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Sebastián Ponce', 'medico4@vectra.demo', '+593 98 111 2004', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. María Fernanda Lara', 'medico5@vectra.demo', '+593 98 111 2005', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Camila Mendoza', 'paciente0@vectra.demo', '+593 99 200 1000', 'paciente', 'scrypt:32768:8:1$MM5xZgW0TImzSU6j$d69acf3007f39842d6c4c5d444df21952ee8e4d20731199ecf3b92cddcdb4e940aa587141d619e0148ccad11ffb7ce06b073c18429e196fefea0df4b5f786c2c', TRUE),
  ('Carlos Pazmiño', 'paciente1@vectra.demo', '+593 99 200 1001', 'paciente', 'scrypt:32768:8:1$MM5xZgW0TImzSU6j$d69acf3007f39842d6c4c5d444df21952ee8e4d20731199ecf3b92cddcdb4e940aa587141d619e0148ccad11ffb7ce06b073c18429e196fefea0df4b5f786c2c', TRUE),
  ('Esteban Andrade', 'paciente2@vectra.demo', '+593 99 200 1002', 'paciente', 'scrypt:32768:8:1$MM5xZgW0TImzSU6j$d69acf3007f39842d6c4c5d444df21952ee8e4d20731199ecf3b92cddcdb4e940aa587141d619e0148ccad11ffb7ce06b073c18429e196fefea0df4b5f786c2c', TRUE),
  ('Andrea Torres', 'paciente3@vectra.demo', '+593 99 200 1003', 'paciente', 'scrypt:32768:8:1$MM5xZgW0TImzSU6j$d69acf3007f39842d6c4c5d444df21952ee8e4d20731199ecf3b92cddcdb4e940aa587141d619e0148ccad11ffb7ce06b073c18429e196fefea0df4b5f786c2c', TRUE),
  ('Mateo Vega', 'paciente4@vectra.demo', '+593 99 200 1004', 'paciente', 'scrypt:32768:8:1$MM5xZgW0TImzSU6j$d69acf3007f39842d6c4c5d444df21952ee8e4d20731199ecf3b92cddcdb4e940aa587141d619e0148ccad11ffb7ce06b073c18429e196fefea0df4b5f786c2c', TRUE)
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  rol = EXCLUDED.rol,
  password_hash = EXCLUDED.password_hash,
  activo = TRUE,
  fecha_actualizacion = CURRENT_TIMESTAMP;

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
  ('medico0@vectra.demo', 'Odontología', 'MED-48000', TRUE, 'Centro Dental Santa Mónica', 'Av. de los Especialistas 100 y Secundaria, Quito', -0.17600000::numeric, -78.48700000::numeric, 35.00::numeric, '["https://picsum.photos/seed/vc0-0/800/600", "https://picsum.photos/seed/vc0-1/800/600"]'::jsonb),
  ('medico1@vectra.demo', 'Dermatología', 'MED-48001', TRUE, 'Clínica Piel & Salud', 'Av. de los Especialistas 101 y Secundaria, Quito', -0.20100000::numeric, -78.49200000::numeric, 45.00::numeric, '["https://picsum.photos/seed/vc1-0/800/600", "https://picsum.photos/seed/vc1-1/800/600"]'::jsonb),
  ('medico2@vectra.demo', 'Medicina General', 'MED-48002', TRUE, 'Consultorio Vida Sana', 'Av. de los Especialistas 102 y Secundaria, Quito', -0.18100000::numeric, -78.47400000::numeric, 25.00::numeric, '["https://picsum.photos/seed/vc2-0/800/600", "https://picsum.photos/seed/vc2-1/800/600"]'::jsonb),
  ('medico3@vectra.demo', 'Pediatría', 'MED-48003', TRUE, 'Pediátrico Los Andes', 'Av. de los Especialistas 103 y Secundaria, Quito', -0.21000000::numeric, -78.50000000::numeric, 30.00::numeric, '["https://picsum.photos/seed/vc3-0/800/600", "https://picsum.photos/seed/vc3-1/800/600"]'::jsonb),
  ('medico4@vectra.demo', 'Veterinaria', 'MED-48004', FALSE, 'Veterinaria Huellitas', 'Av. de los Especialistas 104 y Secundaria, Quito', -0.15000000::numeric, -78.48000000::numeric, 20.00::numeric, '["https://picsum.photos/seed/vc4-0/800/600", "https://picsum.photos/seed/vc4-1/800/600"]'::jsonb),
  ('medico5@vectra.demo', 'Odontología', 'MED-48005', TRUE, 'OdontoQuito Norte', 'Av. de los Especialistas 105 y Secundaria, Quito', -0.22500000::numeric, -78.51500000::numeric, 38.00::numeric, '["https://picsum.photos/seed/vc5-0/800/600", "https://picsum.photos/seed/vc5-1/800/600"]'::jsonb)
) AS v(email, especialidad, colegiatura, verificado, clinica, direccion, latitud, longitud, precio, galeria)
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

INSERT INTO citas (
  medico_id, paciente_nombre, paciente_email, paciente_telefono, fecha, hora,
  motivo, precio_aprox, metodo_pago, estado_pago, estado, codigo_ticket
)
SELECT
  pm.id, v.paciente, v.paciente_email, v.telefono,
  CURRENT_DATE + v.dias, v.hora, 'Consulta de control', pm.precio_aprox,
  v.metodo, v.estado_pago, 'CONFIRMADA', v.ticket
FROM (VALUES
  ('medico0@vectra.demo', 'Camila Mendoza', 'paciente0@vectra.demo', '+593 99 200 1000', -2, '08:00', 'EFECTIVO_VENTANILLA', 'PENDIENTE_VENTANILLA', 'VC-2026-3000'),
  ('medico1@vectra.demo', 'Carlos Pazmiño', 'paciente1@vectra.demo', '+593 99 200 1001', -1, '10:00', 'PAYPAL_MOCK', 'PAGADO_SIMULADO', 'VC-2026-3001'),
  ('medico2@vectra.demo', 'Esteban Andrade', 'paciente2@vectra.demo', '+593 99 200 1002', 0, '12:00', 'PAYPAL_MOCK', 'PAGADO_SIMULADO', 'VC-2026-3002'),
  ('medico3@vectra.demo', 'Andrea Torres', 'paciente3@vectra.demo', '+593 99 200 1003', 1, '14:00', 'PAYPAL_MOCK', 'PAGADO_SIMULADO', 'VC-2026-3003'),
  ('medico4@vectra.demo', 'Mateo Vega', 'paciente4@vectra.demo', '+593 99 200 1004', 2, '16:00', 'PAYPAL_MOCK', 'PAGADO_SIMULADO', 'VC-2026-3004'),
  ('medico5@vectra.demo', 'Camila Mendoza', 'paciente0@vectra.demo', '+593 99 200 1000', 3, '18:00', 'PAYPAL_MOCK', 'PAGADO_SIMULADO', 'VC-2026-3005'),
  ('medico0@vectra.demo', 'Carlos Pazmiño', 'paciente1@vectra.demo', '+593 99 200 1001', 4, '10:00', 'PAYPAL_MOCK', 'PAGADO_SIMULADO', 'VC-2026-3006'),
  ('medico1@vectra.demo', 'Esteban Andrade', 'paciente2@vectra.demo', '+593 99 200 1002', 5, '12:00', 'PAYPAL_MOCK', 'PAGADO_SIMULADO', 'VC-2026-3007')
) AS v(medico_email, paciente, paciente_email, telefono, dias, hora, metodo, estado_pago, ticket)
JOIN usuarios mu ON mu.email = v.medico_email
JOIN perfiles_medicos pm ON pm.usuario_id = mu.id
ON CONFLICT (codigo_ticket) DO NOTHING;

INSERT INTO resenas (medico_id, paciente_nombre, calificacion, comentario)
SELECT pm.id, v.paciente, v.calificacion, v.comentario
FROM (VALUES
  ('medico0@vectra.demo', 'Camila Mendoza', 5, 'Atención rápida y profesional.'),
  ('medico1@vectra.demo', 'Carlos Pazmiño', 5, 'Explicó todo con claridad.'),
  ('medico1@vectra.demo', 'Andrea Torres', 4, 'Consultorio limpio y puntual.'),
  ('medico2@vectra.demo', 'Esteban Andrade', 5, 'Muy recomendable.'),
  ('medico2@vectra.demo', 'Mateo Vega', 4, 'Explicó todo con claridad.'),
  ('medico3@vectra.demo', 'Andrea Torres', 5, 'Atención rápida y profesional.'),
  ('medico4@vectra.demo', 'Mateo Vega', 4, 'Consultorio limpio y puntual.'),
  ('medico5@vectra.demo', 'Camila Mendoza', 5, 'Muy recomendable.')
) AS v(medico_email, paciente, calificacion, comentario)
JOIN usuarios mu ON mu.email = v.medico_email
JOIN perfiles_medicos pm ON pm.usuario_id = mu.id
WHERE NOT EXISTS (
  SELECT 1
  FROM resenas r
  WHERE r.medico_id = pm.id
    AND r.paciente_nombre = v.paciente
    AND r.comentario = v.comentario
);

UPDATE perfiles_medicos pm
SET
  num_resenas = resumen.cantidad,
  rating_promedio = resumen.promedio,
  fecha_actualizacion = CURRENT_TIMESTAMP
FROM (
  SELECT medico_id, COUNT(*)::integer AS cantidad,
         ROUND(AVG(calificacion)::numeric, 2) AS promedio
  FROM resenas
  GROUP BY medico_id
) AS resumen
WHERE pm.id = resumen.medico_id;

COMMIT;

SELECT 'Semilla cargada correctamente' AS resultado;
