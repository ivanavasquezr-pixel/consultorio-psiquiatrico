/**
 * Modelo de acceso a datos para la tabla consultorios.
 */

const { grupoConexiones } = require('../configuracion/conexion');

const CAMPOS = `
  co.id_consultorio,
  co.nombre,
  co.ubicacion,
  co.telefono,
  co.estado,
  co.fecha_registro,
  (SELECT COUNT(*) FROM medicos m WHERE m.id_consultorio = co.id_consultorio) AS total_medicos
`;

const CONSULTA_BASE = `
  SELECT ${CAMPOS}
  FROM consultorios co
`;

/**
 * Obtiene todos los consultorios registrados.
 * @returns {Promise<object[]>} Lista de consultorios.
 */
const listarTodos = async () => {
  const [filas] = await grupoConexiones.query(
    `${CONSULTA_BASE} ORDER BY co.nombre ASC`
  );

  return filas;
};

/**
 * Busca un consultorio por su identificador.
 * @param {number} idConsultorio Identificador del consultorio.
 * @returns {Promise<object|null>} Consultorio encontrado o null.
 */
const obtenerPorId = async (idConsultorio) => {
  const [filas] = await grupoConexiones.execute(
    `${CONSULTA_BASE} WHERE co.id_consultorio = ? LIMIT 1`,
    [idConsultorio]
  );

  return filas[0] || null;
};

/**
 * Busca un consultorio por nombre para evitar duplicados.
 * @param {string} nombre Nombre del consultorio.
 * @param {number|null} idExcluir Identificador que se debe excluir al actualizar.
 * @returns {Promise<object|null>} Coincidencia encontrada o null.
 */
const buscarPorNombre = async (nombre, idExcluir = null) => {
  let sql = `
    SELECT id_consultorio, nombre
    FROM consultorios
    WHERE nombre = ?
  `;
  const parametros = [nombre];

  if (idExcluir !== null) {
    sql += ' AND id_consultorio <> ?';
    parametros.push(idExcluir);
  }

  sql += ' LIMIT 1';

  const [filas] = await grupoConexiones.execute(sql, parametros);
  return filas[0] || null;
};

/**
 * Registra un nuevo consultorio.
 * @param {object} datos Datos previamente validados por el controlador.
 * @returns {Promise<object>} Consultorio creado.
 */
const crear = async (datos) => {
  const [resultado] = await grupoConexiones.execute(
    `INSERT INTO consultorios
      (nombre, ubicacion, telefono, estado)
     VALUES (?, ?, ?, ?)`,
    [datos.nombre, datos.ubicacion, datos.telefono, datos.estado]
  );

  return obtenerPorId(resultado.insertId);
};

/**
 * Actualiza todos los datos de un consultorio.
 * @param {number} idConsultorio Identificador del consultorio.
 * @param {object} datos Datos previamente validados.
 * @returns {Promise<number>} Cantidad de filas afectadas.
 */
const actualizar = async (idConsultorio, datos) => {
  const [resultado] = await grupoConexiones.execute(
    `UPDATE consultorios
     SET nombre = ?,
         ubicacion = ?,
         telefono = ?,
         estado = ?
     WHERE id_consultorio = ?`,
    [datos.nombre, datos.ubicacion, datos.telefono, datos.estado, idConsultorio]
  );

  return resultado.affectedRows;
};

/**
 * Elimina un consultorio por su identificador.
 * @param {number} idConsultorio Identificador del consultorio.
 * @returns {Promise<number>} Cantidad de filas eliminadas.
 */
const eliminar = async (idConsultorio) => {
  const [resultado] = await grupoConexiones.execute(
    'DELETE FROM consultorios WHERE id_consultorio = ?',
    [idConsultorio]
  );

  return resultado.affectedRows;
};

module.exports = {
  listarTodos,
  obtenerPorId,
  buscarPorNombre,
  crear,
  actualizar,
  eliminar
};
