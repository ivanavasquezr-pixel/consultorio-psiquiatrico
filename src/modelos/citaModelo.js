/**
 * Modelo de acceso a datos para la tabla citas.
 * Relaciona pacientes, médicos y consultorios mediante llaves foráneas.
 */

const { grupoConexiones } = require('../configuracion/conexion');

const CAMPOS = `
  c.id_cita,
  c.id_paciente,
  CONCAT(p.nombre, ' ', p.apellido) AS paciente,
  c.id_medico,
  CONCAT(m.nombre, ' ', m.apellido) AS medico,
  m.especialidad,
  c.id_consultorio,
  co.nombre AS consultorio,
  c.fecha_cita,
  c.hora_cita,
  c.motivo,
  c.estado,
  c.fecha_registro
`;

const CONSULTA_BASE = `
  SELECT ${CAMPOS}
  FROM citas c
  INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
  INNER JOIN medicos m ON m.id_medico = c.id_medico
  INNER JOIN consultorios co ON co.id_consultorio = c.id_consultorio
`;

/**
 * Obtiene todas las citas registradas.
 * @returns {Promise<object[]>} Lista de citas.
 */
const listarTodos = async () => {
  const [filas] = await grupoConexiones.query(
    `${CONSULTA_BASE} ORDER BY c.fecha_cita DESC, c.hora_cita DESC`
  );

  return filas;
};

/**
 * Busca una cita por su identificador.
 * @param {number} idCita Identificador de la cita.
 * @returns {Promise<object|null>} Cita encontrada o null.
 */
const obtenerPorId = async (idCita) => {
  const [filas] = await grupoConexiones.execute(
    `${CONSULTA_BASE} WHERE c.id_cita = ? LIMIT 1`,
    [idCita]
  );

  return filas[0] || null;
};

/**
 * Obtiene las citas de un paciente.
 * @param {number} idPaciente Identificador del paciente.
 * @returns {Promise<object[]>} Citas del paciente.
 */
const listarPorPaciente = async (idPaciente) => {
  const [filas] = await grupoConexiones.execute(
    `${CONSULTA_BASE}
     WHERE c.id_paciente = ?
     ORDER BY c.fecha_cita DESC, c.hora_cita DESC`,
    [idPaciente]
  );

  return filas;
};

/**
 * Obtiene las citas de un médico.
 * @param {number} idMedico Identificador del médico.
 * @returns {Promise<object[]>} Citas del médico.
 */
const listarPorMedico = async (idMedico) => {
  const [filas] = await grupoConexiones.execute(
    `${CONSULTA_BASE}
     WHERE c.id_medico = ?
     ORDER BY c.fecha_cita DESC, c.hora_cita DESC`,
    [idMedico]
  );

  return filas;
};

/**
 * Busca una cita activa que coincida en fecha y hora con el médico o el paciente.
 * Las citas canceladas no se consideran para permitir reutilizar el horario.
 * @param {object} datos Datos de búsqueda.
 * @param {number} datos.idMedico Identificador del médico.
 * @param {number} datos.idPaciente Identificador del paciente.
 * @param {string} datos.fechaCita Fecha de la cita.
 * @param {string} datos.horaCita Hora normalizada de la cita.
 * @param {number|null} datos.idExcluir Cita que se debe excluir al actualizar.
 * @returns {Promise<object|null>} Cita en conflicto o null.
 */
const buscarConflictoHorario = async ({
  idMedico,
  idPaciente,
  fechaCita,
  horaCita,
  idExcluir = null
}) => {
  let sql = `
    SELECT id_cita, id_medico, id_paciente, fecha_cita, hora_cita, estado
    FROM citas
    WHERE fecha_cita = ?
      AND hora_cita = ?
      AND estado <> 'Cancelada'
      AND (id_medico = ? OR id_paciente = ?)
  `;
  const parametros = [fechaCita, horaCita, idMedico, idPaciente];

  if (idExcluir !== null) {
    sql += ' AND id_cita <> ?';
    parametros.push(idExcluir);
  }

  sql += ' LIMIT 1';

  const [filas] = await grupoConexiones.execute(sql, parametros);
  return filas[0] || null;
};

/**
 * Registra una nueva cita.
 * @param {object} datos Datos previamente validados por el controlador.
 * @returns {Promise<object>} Cita creada.
 */
const crear = async (datos) => {
  const [resultado] = await grupoConexiones.execute(
    `INSERT INTO citas
      (id_paciente, id_medico, id_consultorio, fecha_cita, hora_cita, motivo, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.id_paciente,
      datos.id_medico,
      datos.id_consultorio,
      datos.fecha_cita,
      datos.hora_cita,
      datos.motivo,
      datos.estado
    ]
  );

  return obtenerPorId(resultado.insertId);
};

/**
 * Actualiza todos los datos de una cita.
 * @param {number} idCita Identificador de la cita.
 * @param {object} datos Datos previamente validados.
 * @returns {Promise<number>} Cantidad de filas afectadas.
 */
const actualizar = async (idCita, datos) => {
  const [resultado] = await grupoConexiones.execute(
    `UPDATE citas
     SET id_paciente = ?,
         id_medico = ?,
         id_consultorio = ?,
         fecha_cita = ?,
         hora_cita = ?,
         motivo = ?,
         estado = ?
     WHERE id_cita = ?`,
    [
      datos.id_paciente,
      datos.id_medico,
      datos.id_consultorio,
      datos.fecha_cita,
      datos.hora_cita,
      datos.motivo,
      datos.estado,
      idCita
    ]
  );

  return resultado.affectedRows;
};

/**
 * Elimina una cita por su identificador.
 * @param {number} idCita Identificador de la cita.
 * @returns {Promise<number>} Cantidad de filas eliminadas.
 */
const eliminar = async (idCita) => {
  const [resultado] = await grupoConexiones.execute(
    'DELETE FROM citas WHERE id_cita = ?',
    [idCita]
  );

  return resultado.affectedRows;
};

module.exports = {
  listarTodos,
  obtenerPorId,
  listarPorPaciente,
  listarPorMedico,
  buscarConflictoHorario,
  crear,
  actualizar,
  eliminar
};
