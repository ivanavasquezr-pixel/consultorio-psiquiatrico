/**
 * Configuración central de la conexión a MySQL.
 *
 * Se utiliza un grupo de conexiones (pool) de mysql2/promise para
 * reutilizar conexiones y evitar el costo de abrir una nueva por cada
 * consulta. Las credenciales se leen desde el archivo .env.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Convierte un valor de entorno en un booleano.
 * @param {string|undefined} valor Valor recibido desde .env.
 * @returns {boolean} Verdadero si el valor representa una opción activa.
 */
const convertirBooleano = (valor) => {
  return ['true', '1', 'si', 'sí'].includes(String(valor || '').toLowerCase());
};

/**
 * Construye la configuración del grupo de conexiones.
 * Se admiten las variables DB_*, las variables MYSQL* de Railway
 * y, como alternativa, una URL completa de conexión.
 * @returns {object} Configuración lista para mysql2.
 */
const construirConfiguracion = () => {
  const opcionesComunes = {
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 10000,
    queueLimit: 0,
    charset: 'utf8mb4',
    dateStrings: true
  };

  if (convertirBooleano(process.env.DB_SSL)) {
    opcionesComunes.ssl = { rejectUnauthorized: false };
  }

  // Prioridad 1: variables DB_* definidas en el archivo .env.
  if (process.env.DB_HOST) {
    return {
      ...opcionesComunes,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'consultorio_psicologico'
    };
  }

  // Prioridad 2: variables MYSQL* que Railway expone al vincular servicios.
  if (process.env.MYSQLHOST) {
    return {
      ...opcionesComunes,
      host: process.env.MYSQLHOST,
      port: Number(process.env.MYSQLPORT) || 3306,
      user: process.env.MYSQLUSER || 'root',
      password: process.env.MYSQLPASSWORD || '',
      database: process.env.MYSQLDATABASE || 'railway'
    };
  }

  // Prioridad 3: URL de conexión completa proporcionada por el proveedor.
  const urlConexion = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (urlConexion) {
    try {
      const url = new URL(urlConexion);
      return {
        ...opcionesComunes,
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: decodeURIComponent(url.pathname.replace(/^\//, '')) || 'railway'
      };
    } catch (error) {
      throw new Error(
        'La variable MYSQL_URL o DATABASE_URL no tiene un formato válido.'
      );
    }
  }

  // Configuración predeterminada para un entorno local.
  return {
    ...opcionesComunes,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'consultorio_psicologico'
  };
};

const configuracion = construirConfiguracion();

/**
 * Grupo de conexiones reutilizable por todos los modelos.
 */
const grupoConexiones = mysql.createPool(configuracion);

/**
 * Resumen seguro de la conexión (sin contraseña) para los mensajes de consola.
 */
const resumenConexion = {
  host: configuracion.host,
  puerto: configuracion.port,
  baseDatos: configuracion.database,
  ssl: Boolean(configuracion.ssl)
};

/**
 * Verifica que la base de datos esté disponible antes de arrancar el servidor.
 * @returns {Promise<void>}
 */
const verificarConexion = async () => {
  const conexion = await grupoConexiones.getConnection();

  try {
    await conexion.query('SELECT 1');
    console.log(
      `Conexión a MySQL establecida correctamente en ${resumenConexion.host}:${resumenConexion.puerto}/${resumenConexion.baseDatos}.`
    );
  } finally {
    conexion.release();
  }
};

/**
 * Cierra el grupo de conexiones de forma ordenada.
 * @returns {Promise<void>}
 */
const cerrarConexion = async () => {
  await grupoConexiones.end();
  console.log('Grupo de conexiones de MySQL cerrado.');
};

module.exports = {
  grupoConexiones,
  verificarConexion,
  cerrarConexion,
  resumenConexion
};
