-- ============================================================
-- Datos de prueba: psicólogos
--
-- Inserta tres psicólogos de ejemplo con los campos mínimos
-- requeridos por la API y por el plugin de WordPress:
-- nombre, apellido, especialidad, cédula/registro profesional
-- y correo de contacto.
--
-- El script es idempotente: si ya existen registros con la misma
-- cédula o el mismo correo, se actualizan en lugar de duplicarse.
--
-- Uso:
--   1. En Railway: servicio MySQL > pestaña Query > pega este archivo.
--   2. Desde un cliente externo:
--        mysql -h <host> -P <puerto> -u <usuario> -p <base> < datos_prueba_psicologos.sql
--   3. Selecciona primero la base de datos donde quieres insertar:
--        USE railway;
--        -- o: USE consultorio_psicologico;
--
-- Nota: id_consultorio se deja en NULL porque es opcional.
-- Si quieres asociarlos a un consultorio, reemplaza NULL por el
-- id_consultorio existente.
-- ============================================================

INSERT INTO psicologos
  (nombre, apellido, especialidad, cedula_profesional, telefono, correo, enfoque_terapeutico, id_consultorio)
VALUES
  (
    'Ana',
    'Martínez López',
    'Psicología Clínica',
    'CED-PSI-1001',
    '+52 555 101 2001',
    'ana.martinez@consultorio-prueba.com',
    'Terapia cognitivo-conductual',
    NULL
  ),
  (
    'Carlos',
    'Hernández Ruiz',
    'Terapia de Pareja',
    'CED-PSI-1002',
    '+52 555 101 2002',
    'carlos.hernandez@consultorio-prueba.com',
    'Terapia sistémica familiar',
    NULL
  ),
  (
    'Laura',
    'Gómez Sánchez',
    'Psicología Infantil',
    'CED-PSI-1003',
    '+52 555 101 2003',
    'laura.gomez@consultorio-prueba.com',
    'Terapia de juego',
    NULL
  )
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellido = VALUES(apellido),
  especialidad = VALUES(especialidad),
  telefono = VALUES(telefono),
  correo = VALUES(correo),
  enfoque_terapeutico = VALUES(enfoque_terapeutico),
  id_consultorio = VALUES(id_consultorio);

-- Verificación: debe devolver los tres registros insertados.
SELECT
  id_psicologo,
  nombre,
  apellido,
  especialidad,
  cedula_profesional,
  telefono,
  correo,
  enfoque_terapeutico,
  id_consultorio,
  fecha_registro
FROM psicologos
WHERE cedula_profesional IN ('CED-PSI-1001', 'CED-PSI-1002', 'CED-PSI-1003')
ORDER BY apellido ASC, nombre ASC;
