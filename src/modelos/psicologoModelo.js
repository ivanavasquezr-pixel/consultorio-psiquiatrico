/**
 * Modelo de acceso a datos para la tabla psicologos.
 * Incluye la relación con la tabla consultorios.
 */

const { grupoConexiones } = require('../configuracion/conexion');

const CAMPOS = `
  p.id_psicologo,
  p.nombre,
  p.apellido,
  p.especialidad,
  p.cedula_profesional,
  p.telefono,
  p.correo,
  p.enfoque_terapeutico,
  p.id_consultorio,
  c.nombre AS consultorio,
  c.ubicacion AS ubicacion_consultorio,
  p.fecha_registro
`;

const CONSULTA_BASE = `
  SELECT ${CAMPOS}
  FROM psicologos p
  LEFT JOIN consultorios c ON c.id_consultorio = p.id_consultorio
`;

/**
 * Obtiene todos los psicólogos registrados.
 * @returns {Promise<object[]>} Lista de psicólogos.
 */
const listarTodos = async () => {
  const [filas] = await grupoConexiones.query(
    `${CONSULTA_BASE} ORDER BY p.apellido ASC, p.nombre ASC`
  );

  return filas;
};

/**
 * Busca un psicólogo por su identificador.
 * @param {number} idPsicologo Identificador del psicólogo.
 * @returns {Promise<object|null>} Psicólogo encontrado o null.
 */
const obtenerPorId = async (idPsicologo) => {
  const [filas] = await grupoConexiones.execute(
    `${CONSULTA_BASE} WHERE p.id_psicologo = ? LIMIT 1`,
    [idPsicologo]
  );

  return filas[0] || null;
};

/**
 * Busca un psicólogo por cédula profesional.
 * @param {string} cedula Cédula profesional.
 * @param {number|null} idExcluir Identificador que se debe excluir al actualizar.
 * @returns {Promise<object|null>} Coincidencia encontrada o null.
 */
const buscarPorCedula = async (cedula, idExcluir = null) => {
  let sql = `
    SELECT id_psicologo, cedula_profesional
    FROM psicologos
    WHERE cedula_profesional = ?
  `;
  const parametros = [cedula];

  if (idExcluir !== null) {
    sql += ' AND id_psicologo <> ?';
    parametros.push(idExcluir);
  }

  sql += ' LIMIT 1';

  const [filas] = await grupoConexiones.execute(sql, parametros);
  return filas[0] || null;
};

/**
 * Busca un psicólogo por correo electrónico.
 * @param {string} correo Correo electrónico.
 * @param {number|null} idExcluir Identificador que se debe excluir al actualizar.
 * @returns {Promise<object|null>} Coincidencia encontrada o null.
 */
const buscarPorCorreo = async (correo, idExcluir = null) => {
  let sql = `
    SELECT id_psicologo, correo
    FROM psicologos
    WHERE correo = ?
  `;
  const parametros = [correo];

  if (idExcluir !== null) {
    sql += ' AND id_psicologo <> ?';
    parametros.push(idExcluir);
  }

  sql += ' LIMIT 1';

  const [filas] = await grupoConexiones.execute(sql, parametros);
  return filas[0] || null;
};

/**
 * Registra un nuevo psicólogo.
 * @param {object} datos Datos previamente validados por el controlador.
 * @returns {Promise<object>} Psicólogo creado.
 */
const crear = async (datos) => {
  const [resultado] = await grupoConexiones.execute(
    `INSERT INTO psicologos
      (nombre, apellido, especialidad, cedula_profesional, telefono, correo,
       enfoque_terapeutico, id_consultorio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.nombre,
      datos.apellido,
      datos.especialidad,
      datos.cedula_profesional,
      datos.telefono,
      datos.correo,
      datos.enfoque_terapeutico,
      datos.id_consultorio
    ]
  );

  return obtenerPorId(resultado.insertId);
};

/**
 * Actualiza todos los datos de un psicólogo.
 * @param {number} idPsicologo Identificador del psicólogo.
 * @param {object} datos Datos previamente validados.
 * @returns {Promise<number>} Cantidad de filas afectadas.
 */
const actualizar = async (idPsicologo, datos) => {
  const [resultado] = await grupoConexiones.execute(
    `UPDATE psicologos
     SET nombre = ?,
         apellido = ?,
         especialidad = ?,
         cedula_profesional = ?,
         telefono = ?,
         correo = ?,
         enfoque_terapeutico = ?,
         id_consultorio = ?
     WHERE id_psicologo = ?`,
    [
      datos.nombre,
      datos.apellido,
      datos.especialidad,
      datos.cedula_profesional,
      datos.telefono,
      datos.correo,
      datos.enfoque_terapeutico,
      datos.id_consultorio,
      idPsicologo
    ]
  );

  return resultado.affectedRows;
};

/**
 * Elimina un psicólogo por su identificador.
 * @param {number} idPsicologo Identificador del psicólogo.
 * @returns {Promise<number>} Cantidad de filas eliminadas.
 */
const eliminar = async (idPsicologo) => {
  const [resultado] = await grupoConexiones.execute(
    'DELETE FROM psicologos WHERE id_psicologo = ?',
    [idPsicologo]
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
