-- Verificación de instalación. Ejecutar conectado a vectra_cure en pgAdmin 4.

DO $$
DECLARE
  faltantes text;
BEGIN
  IF current_database() <> 'vectra_cure' THEN
    RAISE EXCEPTION 'Base incorrecta: %. Conéctate a vectra_cure.', current_database();
  END IF;

  SELECT string_agg(nombre, ', ')
  INTO faltantes
  FROM unnest(ARRAY['usuarios', 'perfiles_medicos', 'citas', 'resenas']) AS nombre
  WHERE to_regclass('public.' || nombre) IS NULL;

  IF faltantes IS NOT NULL THEN
    RAISE EXCEPTION 'Faltan tablas requeridas: %', faltantes;
  END IF;
END $$;

SELECT current_database() AS base_actual,
       current_user AS usuario_actual,
       version() AS version_postgresql;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('usuarios', 'perfiles_medicos', 'citas', 'resenas')
ORDER BY table_name;

SELECT 'usuarios' AS entidad, COUNT(*) AS registros FROM usuarios
UNION ALL
SELECT 'perfiles_medicos', COUNT(*) FROM perfiles_medicos
UNION ALL
SELECT 'citas', COUNT(*) FROM citas
UNION ALL
SELECT 'resenas', COUNT(*) FROM resenas
ORDER BY entidad;

SELECT conname AS restriccion, contype AS tipo
FROM pg_constraint
WHERE conname IN (
  'uq_citas_turno_activo', 'ck_usuarios_rol', 'ck_citas_metodo_pago',
  'ck_citas_estado_pago', 'ck_citas_estado', 'ck_resenas_calificacion'
)
ORDER BY conname;

SELECT indexname AS indice
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'ix_perfiles_especialidad_activo',
    'ix_citas_telefono_fecha',
    'ix_citas_estado_fecha',
    'ix_resenas_medico_fecha'
  )
ORDER BY indexname;
