-- 05_seed_zona_centro_norte_postgresql.sql
-- ─────────────────────────────────────────────────────────────────────
-- Semilla ADITIVA e idempotente: 24 especialistas repartidos dentro del
-- polígono Miraflores → La Vicentina → P. M. Guangüiltagua → P. E. Rumipamba.
-- Generado por scripts/generar_especialistas_zona.py (semilla fija).
-- Ejecutar en pgAdmin sobre la base vectra_cure DESPUÉS de 02_seed_demo.
-- Centroide del reparto: -0.196665, -78.483520

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
  ('Dr. Francisco Benítez', 'medico.zn00@vectra.demo', '+593 98 400 1000', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Andrés Guerrero', 'medico.zn01@vectra.demo', '+593 98 401 1001', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Renata Almeida', 'medico.zn02@vectra.demo', '+593 98 402 1002', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Renata Vásconez', 'medico.zn03@vectra.demo', '+593 98 403 1003', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Daniel Villacís', 'medico.zn04@vectra.demo', '+593 98 404 1004', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Rafael Yépez', 'medico.zn05@vectra.demo', '+593 98 405 1005', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Nicolás Terán', 'medico.zn06@vectra.demo', '+593 98 406 1006', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Joaquín Jaramillo', 'medico.zn07@vectra.demo', '+593 98 407 1007', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Tomás Salazar', 'medico.zn08@vectra.demo', '+593 98 408 1008', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Renata Lara', 'medico.zn09@vectra.demo', '+593 98 409 1009', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Renata Morales', 'medico.zn10@vectra.demo', '+593 98 410 1010', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Verónica Naranjo', 'medico.zn11@vectra.demo', '+593 98 411 1011', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Carolina Cevallos', 'medico.zn12@vectra.demo', '+593 98 412 1012', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Francisco Ordóñez', 'medico.zn13@vectra.demo', '+593 98 413 1013', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Gabriela Andrade', 'medico.zn14@vectra.demo', '+593 98 414 1014', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Renata Montalvo', 'medico.zn15@vectra.demo', '+593 98 415 1015', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Daniel Zambrano', 'medico.zn16@vectra.demo', '+593 98 416 1016', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Paula Recalde', 'medico.zn17@vectra.demo', '+593 98 417 1017', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Andrea Rueda', 'medico.zn18@vectra.demo', '+593 98 418 1018', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Camilo Ponce', 'medico.zn19@vectra.demo', '+593 98 419 1019', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. María Fernanda Espinoza', 'medico.zn20@vectra.demo', '+593 98 420 1020', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Alejandro Cifuentes', 'medico.zn21@vectra.demo', '+593 98 421 1021', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dr. Alejandro Carrión', 'medico.zn22@vectra.demo', '+593 98 422 1022', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE),
  ('Dra. Gabriela Landázuri', 'medico.zn23@vectra.demo', '+593 98 423 1023', 'medico', 'scrypt:32768:8:1$p7qOmqX12dDIltdy$1f44465f82d76852811794a230fef77f02a53a64b384a6334270a3abcad13789003b1b8b272183221a9b41d035d2116a7fdd723e942405f410d57823b938ff46', TRUE)
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
  ('medico.zn00@vectra.demo', 'Medicina General', 'MED-48100', TRUE, 'Consultorio Médico La Vicentina', 'Guipúzcoa N37-94, La Vicentina, Quito', -0.21304090::numeric, -78.48784581::numeric, 24.42::numeric, '["https://picsum.photos/seed/vczn0-0/800/600", "https://picsum.photos/seed/vczn0-1/800/600"]'::jsonb),
  ('medico.zn01@vectra.demo', 'Odontología', 'MED-48101', TRUE, 'Centro Odontológico Bellavista', 'Av. 6 de Diciembre N32-97, Bellavista, Quito', -0.18642726::numeric, -78.46589168::numeric, 31.95::numeric, '["https://picsum.photos/seed/vczn1-0/800/600", "https://picsum.photos/seed/vczn1-1/800/600"]'::jsonb),
  ('medico.zn02@vectra.demo', 'Dermatología', 'MED-48102', TRUE, 'Clínica Dermatológica Miraflores', 'Whymper N38-81, Miraflores, Quito', -0.20167100::numeric, -78.49750821::numeric, 47.33::numeric, '["https://picsum.photos/seed/vczn2-0/800/600", "https://picsum.photos/seed/vczn2-1/800/600"]'::jsonb),
  ('medico.zn03@vectra.demo', 'Veterinaria', 'MED-48103', FALSE, 'Veterinaria El Batán', 'Av. Eloy Alfaro N25-85, El Batán, Quito', -0.18821723::numeric, -78.48302342::numeric, 24.43::numeric, '["https://picsum.photos/seed/vczn3-0/800/600", "https://picsum.photos/seed/vczn3-1/800/600"]'::jsonb),
  ('medico.zn04@vectra.demo', 'Pediatría', 'MED-48104', TRUE, 'Centro Pediátrico La Floresta', 'Av. La Coruña N32-91, La Floresta, Quito', -0.20168880::numeric, -78.48694138::numeric, 30.57::numeric, '["https://picsum.photos/seed/vczn4-0/800/600", "https://picsum.photos/seed/vczn4-1/800/600"]'::jsonb),
  ('medico.zn05@vectra.demo', 'Medicina General', 'MED-48105', TRUE, 'Consultorio Médico Bellavista', 'Guipúzcoa N21-44, Bellavista, Quito', -0.19119233::numeric, -78.47230511::numeric, 30.06::numeric, '["https://picsum.photos/seed/vczn5-0/800/600", "https://picsum.photos/seed/vczn5-1/800/600"]'::jsonb),
  ('medico.zn06@vectra.demo', 'Odontología', 'MED-48106', TRUE, 'Centro Odontológico Bellavista', 'Av. La Coruña N21-90, Bellavista, Quito', -0.18979645::numeric, -78.47660402::numeric, 43.87::numeric, '["https://picsum.photos/seed/vczn6-0/800/600", "https://picsum.photos/seed/vczn6-1/800/600"]'::jsonb),
  ('medico.zn07@vectra.demo', 'Dermatología', 'MED-48107', FALSE, 'Clínica Dermatológica La Floresta', 'Av. González Suárez N44-59, La Floresta, Quito', -0.20439176::numeric, -78.49232478::numeric, 45.05::numeric, '["https://picsum.photos/seed/vczn7-0/800/600", "https://picsum.photos/seed/vczn7-1/800/600"]'::jsonb),
  ('medico.zn08@vectra.demo', 'Veterinaria', 'MED-48108', FALSE, 'Veterinaria La Paz', 'Coruña N37-30, La Paz, Quito', -0.19438457::numeric, -78.47996476::numeric, 26.32::numeric, '["https://picsum.photos/seed/vczn8-0/800/600", "https://picsum.photos/seed/vczn8-1/800/600"]'::jsonb),
  ('medico.zn09@vectra.demo', 'Pediatría', 'MED-48109', TRUE, 'Centro Pediátrico Bellavista', 'Whymper N36-79, Bellavista, Quito', -0.18362019::numeric, -78.46374262::numeric, 34.58::numeric, '["https://picsum.photos/seed/vczn9-0/800/600", "https://picsum.photos/seed/vczn9-1/800/600"]'::jsonb),
  ('medico.zn10@vectra.demo', 'Medicina General', 'MED-48110', TRUE, 'Consultorio Médico El Batán', 'Vizcaya N34-40, El Batán, Quito', -0.18647502::numeric, -78.48772949::numeric, 27.12::numeric, '["https://picsum.photos/seed/vczn10-0/800/600", "https://picsum.photos/seed/vczn10-1/800/600"]'::jsonb),
  ('medico.zn11@vectra.demo', 'Odontología', 'MED-48111', TRUE, 'Centro Odontológico La Pradera', 'Av. 12 de Octubre N42-46, La Pradera, Quito', -0.19366932::numeric, -78.48483509::numeric, 36.27::numeric, '["https://picsum.photos/seed/vczn11-0/800/600", "https://picsum.photos/seed/vczn11-1/800/600"]'::jsonb),
  ('medico.zn12@vectra.demo', 'Dermatología', 'MED-48112', FALSE, 'Clínica Dermatológica La Paz', 'Andalucía N31-84, La Paz, Quito', -0.20221910::numeric, -78.48323855::numeric, 40.34::numeric, '["https://picsum.photos/seed/vczn12-0/800/600", "https://picsum.photos/seed/vczn12-1/800/600"]'::jsonb),
  ('medico.zn13@vectra.demo', 'Veterinaria', 'MED-48113', FALSE, 'Veterinaria Miraflores', 'Av. González Suárez N40-19, Miraflores, Quito', -0.19691853::numeric, -78.49739627::numeric, 23.69::numeric, '["https://picsum.photos/seed/vczn13-0/800/600", "https://picsum.photos/seed/vczn13-1/800/600"]'::jsonb),
  ('medico.zn14@vectra.demo', 'Pediatría', 'MED-48114', TRUE, 'Centro Pediátrico La Pradera', 'Av. 6 de Diciembre N45-35, La Pradera, Quito', -0.19834516::numeric, -78.49422385::numeric, 33.34::numeric, '["https://picsum.photos/seed/vczn14-0/800/600", "https://picsum.photos/seed/vczn14-1/800/600"]'::jsonb),
  ('medico.zn15@vectra.demo', 'Medicina General', 'MED-48115', TRUE, 'Consultorio Médico La Pradera', 'Vizcaya N28-54, La Pradera, Quito', -0.19636598::numeric, -78.48722216::numeric, 26.25::numeric, '["https://picsum.photos/seed/vczn15-0/800/600", "https://picsum.photos/seed/vczn15-1/800/600"]'::jsonb),
  ('medico.zn16@vectra.demo', 'Odontología', 'MED-48116', TRUE, 'Centro Odontológico González Suárez', 'Av. 12 de Octubre N37-21, González Suárez, Quito', -0.20152339::numeric, -78.47641507::numeric, 33.33::numeric, '["https://picsum.photos/seed/vczn16-0/800/600", "https://picsum.photos/seed/vczn16-1/800/600"]'::jsonb),
  ('medico.zn17@vectra.demo', 'Dermatología', 'MED-48117', TRUE, 'Clínica Dermatológica La Pradera', 'Isabel La Católica N45-39, La Pradera, Quito', -0.19322397::numeric, -78.49243164::numeric, 55.52::numeric, '["https://picsum.photos/seed/vczn17-0/800/600", "https://picsum.photos/seed/vczn17-1/800/600"]'::jsonb),
  ('medico.zn18@vectra.demo', 'Veterinaria', 'MED-48118', TRUE, 'Veterinaria Bellavista', 'Toledo N45-72, Bellavista, Quito', -0.18204364::numeric, -78.46586946::numeric, 27.34::numeric, '["https://picsum.photos/seed/vczn18-0/800/600", "https://picsum.photos/seed/vczn18-1/800/600"]'::jsonb),
  ('medico.zn19@vectra.demo', 'Pediatría', 'MED-48119', TRUE, 'Centro Pediátrico La Floresta', 'Coruña N22-80, La Floresta, Quito', -0.20741783::numeric, -78.48476273::numeric, 35.99::numeric, '["https://picsum.photos/seed/vczn19-0/800/600", "https://picsum.photos/seed/vczn19-1/800/600"]'::jsonb),
  ('medico.zn20@vectra.demo', 'Medicina General', 'MED-48120', TRUE, 'Consultorio Médico González Suárez', 'Orellana N41-58, González Suárez, Quito', -0.19774295::numeric, -78.47714035::numeric, 27.38::numeric, '["https://picsum.photos/seed/vczn20-0/800/600", "https://picsum.photos/seed/vczn20-1/800/600"]'::jsonb),
  ('medico.zn21@vectra.demo', 'Odontología', 'MED-48121', FALSE, 'Centro Odontológico La Pradera', 'Madrid N28-32, La Pradera, Quito', -0.19227393::numeric, -78.48851424::numeric, 31.99::numeric, '["https://picsum.photos/seed/vczn21-0/800/600", "https://picsum.photos/seed/vczn21-1/800/600"]'::jsonb),
  ('medico.zn22@vectra.demo', 'Dermatología', 'MED-48122', TRUE, 'Clínica Dermatológica La Floresta', 'Av. 6 de Diciembre N21-96, La Floresta, Quito', -0.20887684::numeric, -78.48681205::numeric, 54.60::numeric, '["https://picsum.photos/seed/vczn22-0/800/600", "https://picsum.photos/seed/vczn22-1/800/600"]'::jsonb),
  ('medico.zn23@vectra.demo', 'Veterinaria', 'MED-48123', TRUE, 'Veterinaria El Dorado', 'Portugal N33-23, El Dorado, Quito', -0.20843041::numeric, -78.49172823::numeric, 24.59::numeric, '["https://picsum.photos/seed/vczn23-0/800/600", "https://picsum.photos/seed/vczn23-1/800/600"]'::jsonb)
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
  ('medico.zn00@vectra.demo', 'Andrea Torres', 4, 'Buena relación precio-atención.'),
  ('medico.zn00@vectra.demo', 'Sofía Cabrera', 4, 'Resolvió mi duda en la primera cita.'),
  ('medico.zn00@vectra.demo', 'Paúl Herrera', 5, 'Explicó el diagnóstico con detalle.'),
  ('medico.zn00@vectra.demo', 'Paúl Herrera', 5, 'Trato amable y sin apuros.'),
  ('medico.zn01@vectra.demo', 'Carlos Pazmiño', 5, 'Fácil de llegar y estacionar.'),
  ('medico.zn01@vectra.demo', 'Esteban Andrade', 4, 'Trato amable y sin apuros.'),
  ('medico.zn02@vectra.demo', 'Mateo Vega', 5, 'Resolvió mi duda en la primera cita.'),
  ('medico.zn02@vectra.demo', 'Lucía Fernández', 4, 'Trato amable y sin apuros.'),
  ('medico.zn02@vectra.demo', 'Mateo Vega', 5, 'Atención puntual y clara.'),
  ('medico.zn03@vectra.demo', 'Sofía Cabrera', 5, 'Trato amable y sin apuros.'),
  ('medico.zn03@vectra.demo', 'Camila Mendoza', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn04@vectra.demo', 'Lucía Fernández', 5, 'Fácil de llegar y estacionar.'),
  ('medico.zn04@vectra.demo', 'Paúl Herrera', 5, 'Resolvió mi duda en la primera cita.'),
  ('medico.zn04@vectra.demo', 'Lucía Fernández', 4, 'Atención puntual y clara.'),
  ('medico.zn04@vectra.demo', 'Carlos Pazmiño', 4, 'Muy profesional, volvería.'),
  ('medico.zn05@vectra.demo', 'Paúl Herrera', 4, 'Explicó el diagnóstico con detalle.'),
  ('medico.zn05@vectra.demo', 'Andrea Torres', 4, 'Buena relación precio-atención.'),
  ('medico.zn05@vectra.demo', 'Lucía Fernández', 4, 'Trato amable y sin apuros.'),
  ('medico.zn06@vectra.demo', 'Esteban Andrade', 4, 'Muy profesional, volvería.'),
  ('medico.zn06@vectra.demo', 'Camila Mendoza', 5, 'Muy profesional, volvería.'),
  ('medico.zn06@vectra.demo', 'Paúl Herrera', 5, 'Atención puntual y clara.'),
  ('medico.zn07@vectra.demo', 'Sofía Cabrera', 4, 'Fácil de llegar y estacionar.'),
  ('medico.zn07@vectra.demo', 'Carlos Pazmiño', 4, 'Atención puntual y clara.'),
  ('medico.zn07@vectra.demo', 'Andrea Torres', 5, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn08@vectra.demo', 'Camila Mendoza', 5, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn08@vectra.demo', 'Lucía Fernández', 4, 'Buena relación precio-atención.'),
  ('medico.zn08@vectra.demo', 'Camila Mendoza', 4, 'Atención puntual y clara.'),
  ('medico.zn09@vectra.demo', 'Camila Mendoza', 5, 'Atención puntual y clara.'),
  ('medico.zn09@vectra.demo', 'Camila Mendoza', 4, 'Muy profesional, volvería.'),
  ('medico.zn09@vectra.demo', 'Sofía Cabrera', 4, 'Explicó el diagnóstico con detalle.'),
  ('medico.zn09@vectra.demo', 'Carlos Pazmiño', 5, 'Fácil de llegar y estacionar.'),
  ('medico.zn10@vectra.demo', 'Mateo Vega', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn10@vectra.demo', 'Paúl Herrera', 4, 'Muy profesional, volvería.'),
  ('medico.zn11@vectra.demo', 'Andrea Torres', 4, 'Resolvió mi duda en la primera cita.'),
  ('medico.zn11@vectra.demo', 'Esteban Andrade', 5, 'Resolvió mi duda en la primera cita.'),
  ('medico.zn12@vectra.demo', 'Andrea Torres', 5, 'Buena relación precio-atención.'),
  ('medico.zn12@vectra.demo', 'Lucía Fernández', 4, 'Explicó el diagnóstico con detalle.'),
  ('medico.zn13@vectra.demo', 'Lucía Fernández', 5, 'Buena relación precio-atención.'),
  ('medico.zn13@vectra.demo', 'Sofía Cabrera', 4, 'Muy profesional, volvería.'),
  ('medico.zn13@vectra.demo', 'Carlos Pazmiño', 4, 'Trato amable y sin apuros.'),
  ('medico.zn14@vectra.demo', 'Sofía Cabrera', 4, 'Resolvió mi duda en la primera cita.'),
  ('medico.zn14@vectra.demo', 'Lucía Fernández', 5, 'Buena relación precio-atención.'),
  ('medico.zn14@vectra.demo', 'Lucía Fernández', 5, 'Atención puntual y clara.'),
  ('medico.zn15@vectra.demo', 'Carlos Pazmiño', 4, 'Muy profesional, volvería.'),
  ('medico.zn15@vectra.demo', 'Esteban Andrade', 5, 'Trato amable y sin apuros.'),
  ('medico.zn15@vectra.demo', 'Mateo Vega', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn16@vectra.demo', 'Esteban Andrade', 4, 'Explicó el diagnóstico con detalle.'),
  ('medico.zn16@vectra.demo', 'Paúl Herrera', 4, 'Fácil de llegar y estacionar.'),
  ('medico.zn16@vectra.demo', 'Sofía Cabrera', 4, 'Muy profesional, volvería.'),
  ('medico.zn16@vectra.demo', 'Carlos Pazmiño', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn17@vectra.demo', 'Lucía Fernández', 4, 'Atención puntual y clara.'),
  ('medico.zn17@vectra.demo', 'Esteban Andrade', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn17@vectra.demo', 'Mateo Vega', 5, 'Fácil de llegar y estacionar.'),
  ('medico.zn17@vectra.demo', 'Lucía Fernández', 4, 'Trato amable y sin apuros.'),
  ('medico.zn18@vectra.demo', 'Andrea Torres', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn18@vectra.demo', 'Esteban Andrade', 5, 'Fácil de llegar y estacionar.'),
  ('medico.zn18@vectra.demo', 'Mateo Vega', 5, 'Muy profesional, volvería.'),
  ('medico.zn19@vectra.demo', 'Camila Mendoza', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn19@vectra.demo', 'Lucía Fernández', 4, 'Trato amable y sin apuros.'),
  ('medico.zn19@vectra.demo', 'Camila Mendoza', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn20@vectra.demo', 'Sofía Cabrera', 5, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn20@vectra.demo', 'Lucía Fernández', 5, 'Resolvió mi duda en la primera cita.'),
  ('medico.zn20@vectra.demo', 'Sofía Cabrera', 4, 'Consultorio limpio y bien ubicado.'),
  ('medico.zn21@vectra.demo', 'Paúl Herrera', 4, 'Fácil de llegar y estacionar.'),
  ('medico.zn21@vectra.demo', 'Paúl Herrera', 4, 'Trato amable y sin apuros.'),
  ('medico.zn21@vectra.demo', 'Carlos Pazmiño', 4, 'Fácil de llegar y estacionar.'),
  ('medico.zn21@vectra.demo', 'Camila Mendoza', 4, 'Resolvió mi duda en la primera cita.'),
  ('medico.zn22@vectra.demo', 'Camila Mendoza', 4, 'Explicó el diagnóstico con detalle.'),
  ('medico.zn22@vectra.demo', 'Lucía Fernández', 5, 'Muy profesional, volvería.'),
  ('medico.zn22@vectra.demo', 'Lucía Fernández', 4, 'Buena relación precio-atención.'),
  ('medico.zn22@vectra.demo', 'Paúl Herrera', 4, 'Atención puntual y clara.'),
  ('medico.zn23@vectra.demo', 'Andrea Torres', 4, 'Buena relación precio-atención.'),
  ('medico.zn23@vectra.demo', 'Lucía Fernández', 4, 'Trato amable y sin apuros.'),
  ('medico.zn23@vectra.demo', 'Esteban Andrade', 4, 'Fácil de llegar y estacionar.')
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
