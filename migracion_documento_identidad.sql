-- ============================================================
-- Migración: documento de identidad en pacientes
--
-- Agrega la columna documento_identidad y su índice único a la
-- tabla pacientes de una base de datos ya existente.
--
-- El script es idempotente: si la columna o el índice ya existen,
-- no hace nada.
--
-- Uso:
--   USE railway;  -- o USE consultorio_psicologico;
--   -- pega el contenido de este archivo en la pestaña Query
-- ============================================================

SET @columna_existe := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'pacientes'
    AND column_name = 'documento_identidad'
);

SET @sentencia := IF(
  @columna_existe = 0,
  'ALTER TABLE pacientes ADD COLUMN documento_identidad VARCHAR(30) NULL AFTER apellido',
  'SELECT 1'
);

PREPARE stmt FROM @sentencia;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @indice_existe := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'pacientes'
    AND index_name = 'uq_pacientes_documento'
);

SET @sentencia := IF(
  @indice_existe = 0,
  'ALTER TABLE pacientes ADD UNIQUE KEY uq_pacientes_documento (documento_identidad)',
  'SELECT 1'
);

PREPARE stmt FROM @sentencia;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SHOW COLUMNS FROM pacientes;
