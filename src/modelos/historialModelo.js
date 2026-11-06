/**
 * Modelo de acceso a datos para la tabla historial_clinico.
 * Cada registro está relacionado con una cita.
 */

const { grupoConexiones } = require('../configuracion/conexion');

const CAMPOS = `
  h.id_historial,
  h.id_cita,
  c.fecha_cita,
  c.hora_cita,
  c.id_paciente,
  CONCAT(p.nombre, ' ', p.apellido) AS paciente,
  c.id_medico,
  CONCAT(m.nombre, ' ', m.apellido) AS medico,
  m.especialidad,
  h.diagnostico,
  h.tratamiento,
  h.notas,
  h.fecha_registro
`;

const CONSULTA_BASE = `
  SELECT ${CAMPOS}
  FROM historial_clinico h
  INNER JOIN citas c ON c.id_cita = h.id_cita
  INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
  INNER JOIN medicos m ON m.id_medico = c.id_medico
`;

/**
 * Obtiene todos los registros del historial clínico.
 * @returns {Promise<object[]>} Lista de registros.
 */
const listarTodos = async () => {
  const [filas] = await grupoConexiones.query(
    `${CONSULTA_BASE} ORDER BY h.fecha_registro DESC, h.id_historial DESC`
  );

  return filas;
};

/**
 * Busca un registro del historial por su identificador.
 * @param {number} idHistorial Identificador del historial.
 * @returns {Promise<object|null>} Registro encontrado o null.
 */
const obtenerPorId = async (idHistorial) => {
  const [filas] = await grupoConexiones.execute(
    `${CONSULTA_BASE} WHERE h.id_historial = ? LIMIT 1`,
    [idHistorial]
  );

  return filas[0] || null;
};

/**
 * Busca el historial asociado a una cita.
 * @param {number} idCita Identificador de la cita.
 * @returns {Promise<object|null>} Registro encontrado o null.
 */
const obtenerPorCita = async (idCita) => {
  const [filas] = await grupoConexiones.execute(
    `${CONSULTA_BASE} WHERE h.id_cita = ? LIMIT 1`,
    [idCita]
  );

  return filas[0] || null;
};

/**
 * Registra un nuevo registro clínico.
 * @param {object} datos Datos previamente validados por el controlador.
 * @returns {Promise<object>} Registro creado.
 */
const crear = async (datos) => {
  const [resultado] = await grupoConexiones.execute(
    `INSERT INTO historial_clinico
      (id_cita, diagnostico, tratamiento, notas)
     VALUES (?, ?, ?, ?)`,
    [datos.id_cita, datos.diagnostico, datos.tratamiento, datos.notas]
  );

  return obtenerPorId(resultado.insertId);
};

/**
 * Actualiza todos los datos de un registro clínico.
 * @param {number} idHistorial Identificador del historial.
 * @param {object} datos Datos previamente validados.
 * @returns {Promise<number>} Cantidad de filas afectadas.
 */
const actualizar = async (idHistorial, datos) => {
  const [resultado] = await grupoConexiones.execute(
    `UPDATE historial_clinico
     SET id_cita = ?,
         diagnostico = ?,
         tratamiento = ?,
         notas = ?
     WHERE id_historial = ?`,
    [datos.id_cita, datos.diagnostico, datos.tratamiento, datos.notas, idHistorial]
  );

  return resultado.affectedRows;
};

/**
 * Elimina un registro del historial clínico.
 * @param {number} idHistorial Identificador del historial.
 * @returns {Promise<number>} Cantidad de filas eliminadas.
 */
const eliminar = async (idHistorial) => {
  const [resultado] = await grupoConexiones.execute(
    'DELETE FROM historial_clinico WHERE id_historial = ?',
    [idHistorial]
  );

  return resultado.affectedRows;
};

module.exports = {
  listarTodos,
  obtenerPorId,
  obtenerPorCita,
  crear,
  actualizar,
  eliminar
};
