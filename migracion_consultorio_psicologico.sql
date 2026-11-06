-- ============================================================
-- Migración de estructura: Consultorio Psiquiátrico → Psicológico
-- Motor: MySQL 8.x / MariaDB compatible
--
-- USO EN RAILWAY:
-- 1. Abre el servicio de MySQL y entra en la pestaña "Query".
-- 2. Selecciona la base de datos que usa la API (por ejemplo, railway).
-- 3. Pega y ejecuta este script completo.
--
-- El script es seguro para bases de datos nuevas: solo renombra la
-- tabla/columnas antiguas si existen y agrega los campos nuevos
-- cuando aún no están presentes. No elimina información.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP PROCEDURE IF EXISTS migrar_consultorio_psicologico;

DELIMITER //

CREATE PROCEDURE migrar_consultorio_psicologico()
BEGIN
  -- 1. Renombrar la tabla medicos a psicologos.
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'medicos'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'psicologos'
  ) THEN
    RENAME TABLE medicos TO psicologos;
  END IF;

  -- 2. Renombrar la llave primaria de psicologos.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'psicologos'
      AND column_name = 'id_medico'
  ) THEN
    ALTER TABLE psicologos
      CHANGE COLUMN id_medico id_psicologo INT UNSIGNED NOT NULL AUTO_INCREMENT;
  END IF;

  -- 3. Renombrar la llave foránea de citas.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'citas'
      AND column_name = 'id_medico'
  ) THEN
    ALTER TABLE citas
      CHANGE COLUMN id_medico id_psicologo INT UNSIGNED NOT NULL;
  END IF;

  -- 4. Agregar el enfoque terapéutico del psicólogo.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'psicologos'
      AND column_name = 'enfoque_terapeutico'
  ) THEN
    ALTER TABLE psicologos
      ADD COLUMN enfoque_terapeutico VARCHAR(100) NULL AFTER correo;
  END IF;

  -- 5. Agregar la modalidad de la cita (presencial, virtual o híbrida).
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'citas'
      AND column_name = 'modalidad'
  ) THEN
    ALTER TABLE citas
      ADD COLUMN modalidad ENUM('Presencial', 'Virtual', 'Híbrida')
        NOT NULL DEFAULT 'Presencial' AFTER hora_cita;
  END IF;

  -- 6. Renombrar índices heredados (si todavía existen).
  IF EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'psicologos'
      AND index_name = 'idx_medicos_consultorio'
  ) THEN
    ALTER TABLE psicologos
      RENAME INDEX idx_medicos_consultorio TO idx_psicologos_consultorio;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'citas'
      AND index_name = 'idx_citas_medico'
  ) THEN
    ALTER TABLE citas
      RENAME INDEX idx_citas_medico TO idx_citas_psicologo;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'psicologos'
      AND index_name = 'uq_medicos_cedula'
  ) THEN
    ALTER TABLE psicologos
      RENAME INDEX uq_medicos_cedula TO uq_psicologos_cedula;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'psicologos'
      AND index_name = 'uq_medicos_correo'
  ) THEN
    ALTER TABLE psicologos
      RENAME INDEX uq_medicos_correo TO uq_psicologos_correo;
  END IF;
END //

DELIMITER ;

CALL migrar_consultorio_psicologico();

DROP PROCEDURE migrar_consultorio_psicologico;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Verificación de la estructura migrada
-- ============================================================
SHOW TABLES;
SHOW COLUMNS FROM psicologos;
SHOW COLUMNS FROM citas;
