/**
 * Modelo de acceso a datos para la tabla pacientes.
 * Todas las consultas usan parámetros para prevenir inyección SQL.
 */

const { grupoConexiones } = require('../configuracion/conexion');

const CAMPOS = `
  id_paciente,
  nombre,
  apellido,
  fecha_nacimiento,
  sexo,
  telefono,
  correo,
  direccion,
  antecedentes,
  fecha_registro
`;

/**
 * Obtiene todos los pacientes ordenados por apellido y nombre.
 * @returns {Promise<object[]>} Lista de pacientes.
 */
const listarTodos = async () => {
  const [filas] = await grupoConexiones.query(
    `SELECT ${CAMPOS} FROM pacientes ORDER BY apellido ASC, nombre ASC`
  );

  return filas;
};

/**
 * Busca un paciente por su identificador.
 * @param {number} idPaciente Identificador del paciente.
 * @returns {Promise<object|null>} Paciente encontrado o null.
 */
const obtenerPorId = async (idPaciente) => {
  const [filas] = await grupoConexiones.execute(
    `SELECT ${CAMPOS} FROM pacientes WHERE id_paciente = ? LIMIT 1`,
    [idPaciente]
  );

  return filas[0] || null;
};

/**
 * Registra un nuevo paciente.
 * @param {object} datos Datos previamente validados por el controlador.
 * @returns {Promise<object>} Paciente creado.
 */
const crear = async (datos) => {
  const [resultado] = await grupoConexiones.execute(
    `INSERT INTO pacientes
      (nombre, apellido, fecha_nacimiento, sexo, telefono, correo, direccion, antecedentes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.nombre,
      datos.apellido,
      datos.fecha_nacimiento,
      datos.sexo,
      datos.telefono,
      datos.correo,
      datos.direccion,
      datos.antecedentes
    ]
  );

  return obtenerPorId(resultado.insertId);
};

/**
 * Actualiza todos los datos de un paciente.
 * @param {number} idPaciente Identificador del paciente.
 * @param {object} datos Datos previamente validados.
 * @returns {Promise<number>} Cantidad de filas afectadas.
 */
const actualizar = async (idPaciente, datos) => {
  const [resultado] = await grupoConexiones.execute(
    `UPDATE pacientes
     SET nombre = ?,
         apellido = ?,
         fecha_nacimiento = ?,
         sexo = ?,
         telefono = ?,
         correo = ?,
         direccion = ?,
         antecedentes = ?
     WHERE id_paciente = ?`,
    [
      datos.nombre,
      datos.apellido,
      datos.fecha_nacimiento,
      datos.sexo,
      datos.telefono,
      datos.correo,
      datos.direccion,
      datos.antecedentes,
      idPaciente
    ]
  );

  return resultado.affectedRows;
};

/**
 * Elimina un paciente por su identificador.
 * @param {number} idPaciente Identificador del paciente.
 * @returns {Promise<number>} Cantidad de filas eliminadas.
 */
const eliminar = async (idPaciente) => {
  const [resultado] = await grupoConexiones.execute(
    'DELETE FROM pacientes WHERE id_paciente = ?',
    [idPaciente]
  );

  return resultado.affectedRows;
};

module.exports = {
  listarTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
