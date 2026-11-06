/**
 * Modelo de acceso a datos para la tabla medicos.
 * Incluye la relación con la tabla consultorios.
 */

const { grupoConexiones } = require('../configuracion/conexion');

const CAMPOS = `
  m.id_medico,
  m.nombre,
  m.apellido,
  m.especialidad,
  m.cedula_profesional,
  m.telefono,
  m.correo,
  m.id_consultorio,
  c.nombre AS consultorio,
  c.ubicacion AS ubicacion_consultorio,
  m.fecha_registro
`;

const CONSULTA_BASE = `
  SELECT ${CAMPOS}
  FROM medicos m
  LEFT JOIN consultorios c ON c.id_consultorio = m.id_consultorio
`;

/**
 * Obtiene todos los médicos registrados.
 * @returns {Promise<object[]>} Lista de médicos.
 */
const listarTodos = async () => {
  const [filas] = await grupoConexiones.query(
    `${CONSULTA_BASE} ORDER BY m.apellido ASC, m.nombre ASC`
  );

  return filas;
};

/**
 * Busca un médico por su identificador.
 * @param {number} idMedico Identificador del médico.
 * @returns {Promise<object|null>} Médico encontrado o null.
 */
const obtenerPorId = async (idMedico) => {
  const [filas] = await grupoConexiones.execute(
    `${CONSULTA_BASE} WHERE m.id_medico = ? LIMIT 1`,
    [idMedico]
  );

  return filas[0] || null;
};

/**
 * Busca un médico por cédula profesional.
 * @param {string} cedula Cédula profesional.
 * @param {number|null} idExcluir Identificador que se debe excluir al actualizar.
 * @returns {Promise<object|null>} Coincidencia encontrada o null.
 */
const buscarPorCedula = async (cedula, idExcluir = null) => {
  let sql = `
    SELECT id_medico, cedula_profesional
    FROM medicos
    WHERE cedula_profesional = ?
  `;
  const parametros = [cedula];

  if (idExcluir !== null) {
    sql += ' AND id_medico <> ?';
    parametros.push(idExcluir);
  }

  sql += ' LIMIT 1';

  const [filas] = await grupoConexiones.execute(sql, parametros);
  return filas[0] || null;
};

/**
 * Busca un médico por correo electrónico.
 * @param {string} correo Correo electrónico.
 * @param {number|null} idExcluir Identificador que se debe excluir al actualizar.
 * @returns {Promise<object|null>} Coincidencia encontrada o null.
 */
const buscarPorCorreo = async (correo, idExcluir = null) => {
  let sql = `
    SELECT id_medico, correo
    FROM medicos
    WHERE correo = ?
  `;
  const parametros = [correo];

  if (idExcluir !== null) {
    sql += ' AND id_medico <> ?';
    parametros.push(idExcluir);
  }

  sql += ' LIMIT 1';

  const [filas] = await grupoConexiones.execute(sql, parametros);
  return filas[0] || null;
};

/**
 * Registra un nuevo médico.
 * @param {object} datos Datos previamente validados por el controlador.
 * @returns {Promise<object>} Médico creado.
 */
const crear = async (datos) => {
  const [resultado] = await grupoConexiones.execute(
    `INSERT INTO medicos
      (nombre, apellido, especialidad, cedula_profesional, telefono, correo, id_consultorio)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.nombre,
      datos.apellido,
      datos.especialidad,
      datos.cedula_profesional,
      datos.telefono,
      datos.correo,
      datos.id_consultorio
    ]
  );

  return obtenerPorId(resultado.insertId);
};

/**
 * Actualiza todos los datos de un médico.
 * @param {number} idMedico Identificador del médico.
 * @param {object} datos Datos previamente validados.
 * @returns {Promise<number>} Cantidad de filas afectadas.
 */
const actualizar = async (idMedico, datos) => {
  const [resultado] = await grupoConexiones.execute(
    `UPDATE medicos
     SET nombre = ?,
         apellido = ?,
         especialidad = ?,
         cedula_profesional = ?,
         telefono = ?,
         correo = ?,
         id_consultorio = ?
     WHERE id_medico = ?`,
    [
      datos.nombre,
      datos.apellido,
      datos.especialidad,
      datos.cedula_profesional,
      datos.telefono,
      datos.correo,
      datos.id_consultorio,
      idMedico
    ]
  );

  return resultado.affectedRows;
};

/**
 * Elimina un médico por su identificador.
 * @param {number} idMedico Identificador del médico.
 * @returns {Promise<number>} Cantidad de filas eliminadas.
 */
const eliminar = async (idMedico) => {
  const [resultado] = await grupoConexiones.execute(
    'DELETE FROM medicos WHERE id_medico = ?',
    [idMedico]
  );

  return resultado.affectedRows;
};

module.exports = {
  listarTodos,
  obtenerPorId,
  buscarPorCedula,
  buscarPorCorreo,
  crear,
  actualizar,
  eliminar
};
