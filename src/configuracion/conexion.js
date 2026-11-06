/**
 * Configuración central de la conexión a MySQL.
 *
 * Se utiliza un grupo de conexiones (pool) de mysql2/promise para
 * reutilizar conexiones y evitar el costo de abrir una nueva por cada
 * consulta. Las credenciales se leen desde las variables de entorno.
 *
 * Orden de prioridad:
 *   1. Variables DB_* (recomendado en Render).
 *   2. URL completa (DB_URL, MYSQL_PUBLIC_URL, MYSQL_URL o DATABASE_URL).
 *   3. Variables MYSQL* de Railway.
 *   4. Configuración local predeterminada.
 */

const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Limpia un valor de entorno: elimina espacios, saltos de línea y comillas
 * que suelen copiarse accidentalmente desde los paneles de Render o Railway.
 * @param {*} valor Valor recibido desde el entorno.
 * @returns {string} Valor limpio.
 */
const limpiarValor = (valor) => {
  if (valor === undefined || valor === null) {
    return '';
  }

  return String(valor)
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .trim();
};

/**
 * Convierte un valor de entorno en un booleano.
 * @param {string|undefined} valor Valor recibido desde el entorno.
 * @returns {boolean} Verdadero si el valor representa una opción activa.
 */
const convertirBooleano = (valor) => {
  return ['true', '1', 'si', 'sí', 'yes', 'required', 'require'].includes(
    limpiarValor(valor).toLowerCase()
  );
};

/**
 * Convierte un valor en un puerto válido.
 * @param {*} valor Valor recibido desde el entorno.
 * @param {number} predeterminado Puerto a usar si el valor no es válido.
 * @returns {number} Puerto válido.
 */
const convertirPuerto = (valor, predeterminado) => {
  const puerto = Number(limpiarValor(valor));
  return Number.isInteger(puerto) && puerto > 0 && puerto <= 65535
    ? puerto
    : predeterminado;
};

/**
 * Comprueba si un valor es una URL de conexión de MySQL.
 * @param {string} valor Valor a evaluar.
 * @returns {boolean} Verdadero si comienza con mysql:// o mysql2://.
 */
const esUrlConexion = (valor) => /^mysql2?:\/\//i.test(limpiarValor(valor));

/**
 * Comprueba si un host es el dominio interno de Railway, que solo funciona
 * entre servicios dentro de Railway y no desde Render.
 * @param {string} host Host a evaluar.
 * @returns {boolean} Verdadero si es un dominio *.railway.internal.
 */
const esHostInternoRailway = (host) => /\.railway\.internal$/i.test(limpiarValor(host));

/**
 * Si el host es interno de Railway y existen las variables del TCP Proxy,
 * usa automáticamente el host y puerto públicos.
 * @param {string} host Host original.
 * @param {number} puerto Puerto original.
 * @returns {{host: string, puerto: number, proxy: boolean}} Destino final.
 */
const resolverDestinoPublico = (host, puerto) => {
  const dominioProxy = limpiarValor(process.env.RAILWAY_TCP_PROXY_DOMAIN);
  const puertoProxy = convertirPuerto(process.env.RAILWAY_TCP_PROXY_PORT, 0);

  if (esHostInternoRailway(host) && dominioProxy) {
    return {
      host: dominioProxy,
      puerto: puertoProxy || puerto,
      proxy: true
    };
  }

  return { host, puerto, proxy: false };
};

/**
 * Construye las opciones comunes del grupo de conexiones.
 * @returns {object} Opciones compartidas por todas las conexiones.
 */
const construirOpcionesComunes = () => {
  const opciones = {
    waitForConnections: true,
    connectionLimit: convertirPuerto(process.env.DB_CONNECTION_LIMIT, 10),
    connectTimeout: convertirPuerto(process.env.DB_CONNECT_TIMEOUT, 10000),
    queueLimit: 0,
    charset: 'utf8mb4',
    dateStrings: true
  };

  if (convertirBooleano(process.env.DB_SSL)) {
    opciones.ssl = { rejectUnauthorized: false };
  }

  return opciones;
};

/**
 * Construye la configuración a partir de una URL de conexión.
 * @param {string} urlConexion URL con formato mysql://usuario:clave@host:puerto/base.
 * @param {string} origen Nombre de la variable de entorno utilizada.
 * @returns {{configuracion: object, origen: string}} Configuración lista para mysql2.
 */
const construirDesdeUrl = (urlConexion, origen) => {
  let url;

  try {
    url = new URL(limpiarValor(urlConexion));
  } catch (error) {
    throw new Error(
      `La variable ${origen} no tiene un formato de URL válido. ` +
        'Usa el formato mysql://usuario:contraseña@host:puerto/base_de_datos.'
    );
  }

  if (!['mysql:', 'mysql2:'].includes(url.protocol.toLowerCase())) {
    throw new Error(
      `La variable ${origen} debe usar el protocolo mysql:// o mysql2://.`
    );
  }

  const opciones = construirOpcionesComunes();
  const destino = resolverDestinoPublico(
    url.hostname,
    convertirPuerto(url.port, 3306)
  );
  const sslEnUrl = convertirBooleano(url.searchParams.get('ssl'));

  if (sslEnUrl && !opciones.ssl) {
    opciones.ssl = { rejectUnauthorized: false };
  }

  return {
    origen: destino.proxy ? `${origen} (TCP Proxy)` : origen,
    configuracion: {
      ...opciones,
      host: destino.host,
      port: destino.puerto,
      user: decodeURIComponent(url.username) || 'root',
      password: decodeURIComponent(url.password) || '',
      database: decodeURIComponent(url.pathname.replace(/^\//, '')) || 'railway'
    }
  };
};

/**
 * Construye la configuración del grupo de conexiones.
 * @returns {{configuracion: object, origen: string}} Configuración y su origen.
 */
const construirConfiguracion = () => {
  // Prioridad 1: variables DB_* definidas en Render, Railway o .env.
  const hostDb = limpiarValor(process.env.DB_HOST);

  if (hostDb) {
    // Permite pegar por error una URL completa en DB_HOST.
    if (esUrlConexion(hostDb)) {
      return construirDesdeUrl(hostDb, 'DB_HOST');
    }

    const destino = resolverDestinoPublico(
      hostDb,
      convertirPuerto(process.env.DB_PORT, 3306)
    );

    return {
      origen: destino.proxy ? 'DB_* (TCP Proxy)' : 'DB_*',
      configuracion: {
        ...construirOpcionesComunes(),
        host: destino.host,
        port: destino.puerto,
        user: limpiarValor(process.env.DB_USER) || 'root',
        password: limpiarValor(process.env.DB_PASSWORD),
        database: limpiarValor(process.env.DB_NAME) || 'railway'
      }
    };
  }

  // Prioridad 2: URL completa de conexión.
  for (const nombre of ['DB_URL', 'MYSQL_PUBLIC_URL', 'MYSQL_URL', 'DATABASE_URL']) {
    const urlConexion = limpiarValor(process.env[nombre]);

    if (esUrlConexion(urlConexion)) {
      return construirDesdeUrl(urlConexion, nombre);
    }
  }

  // Prioridad 3: variables MYSQL* que Railway expone al vincular servicios.
  const hostMysql = limpiarValor(process.env.MYSQLHOST);

  if (hostMysql) {
    const destino = resolverDestinoPublico(
      hostMysql,
      convertirPuerto(process.env.MYSQLPORT, 3306)
    );

    return {
      origen: destino.proxy ? 'MYSQL* (TCP Proxy)' : 'MYSQL*',
      configuracion: {
        ...construirOpcionesComunes(),
        host: destino.host,
        port: destino.puerto,
        user: limpiarValor(process.env.MYSQLUSER) || 'root',
        password: limpiarValor(process.env.MYSQLPASSWORD),
        database: limpiarValor(process.env.MYSQLDATABASE) || 'railway'
      }
    };
  }

  // Prioridad 4: configuración predeterminada para un entorno local.
  return {
    origen: 'configuración local predeterminada',
    configuracion: {
      ...construirOpcionesComunes(),
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'consultorio_psicologico'
    }
  };
};

const { configuracion, origen: origenConfiguracion } = construirConfiguracion();

/**
 * Grupo de conexiones reutilizable por todos los modelos.
 */
const grupoConexiones = mysql.createPool(configuracion);

/**
 * Resumen seguro de la conexión (sin contraseña) para los mensajes de consola
 * y para el endpoint de salud.
 */
const resumenConexion = {
  host: configuracion.host,
  puerto: configuracion.port,
  baseDatos: configuracion.database,
  ssl: Boolean(configuracion.ssl),
  origen: origenConfiguracion
};

/**
 * Describe un error de conexión en español y sugiere una acción correctiva.
 * No incluye credenciales ni detalles sensibles.
 * @param {Error} error Error capturado.
 * @returns {{codigo: string, descripcion: string}} Diagnóstico del error.
 */
const describirErrorConexion = (error) => {
  const codigo = (error && error.code) || 'ERROR_DESCONOCIDO';

  const descripciones = {
    ECONNREFUSED:
      'La conexión fue rechazada. Verifica que DB_HOST y DB_PORT sean los públicos del TCP Proxy de Railway y que el servicio esté en línea.',
    ENOTFOUND:
      'No se pudo resolver el host. Revisa que DB_HOST no sea un dominio interno *.railway.internal y que no tenga espacios.',
    EAI_AGAIN:
      'No se pudo resolver el host por un problema temporal de DNS. Revisa DB_HOST y vuelve a intentarlo.',
    ETIMEDOUT:
      'La conexión agotó el tiempo de espera. Verifica el TCP Proxy de Railway, el puerto público y las reglas de red.',
    EHOSTUNREACH:
      'El host no es accesible desde la red actual. Verifica el TCP Proxy público de Railway.',
    ER_ACCESS_DENIED_ERROR:
      'MySQL rechazó las credenciales. Revisa DB_USER y DB_PASSWORD.',
    ER_BAD_DB_ERROR:
      'La base de datos indicada no existe. Revisa DB_NAME (en Railway suele ser railway).',
    ER_DBACCESS_DENIED_ERROR:
      'El usuario no tiene permisos sobre la base de datos indicada. Revisa DB_USER y DB_NAME.',
    HANDSHAKE_NO_SSL_SUPPORT:
      'El servidor no admite SSL. Configura DB_SSL=false.',
    HANDSHAKE_SSL_ERROR:
      'Falló el handshake SSL. Revisa DB_SSL o la configuración TLS de la base de datos.',
    DEPTH_ZERO_SELF_SIGNED_CERT:
      'El certificado SSL es autofirmado. La conexión ya usa rejectUnauthorized=false; revisa DB_SSL.',
    CERT_HAS_EXPIRED:
      'El certificado SSL de la base de datos expiró.'
  };

  return {
    codigo,
    descripcion:
      descripciones[codigo] ||
      (error && error.message
        ? `No se pudo conectar a MySQL: ${error.message}`
        : 'No se pudo conectar a MySQL por un error desconocido.')
  };
};

/**
 * Comprueba el estado actual de la conexión sin lanzar excepciones.
 * @returns {Promise<{conectada: boolean, codigo?: string, descripcion?: string}>} Estado.
 */
const comprobarConexion = async () => {
  try {
    await grupoConexiones.query('SELECT 1');
    return { conectada: true };
  } catch (error) {
    return { conectada: false, ...describirErrorConexion(error) };
  }
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
      `Conexión a MySQL establecida correctamente en ${resumenConexion.host}:${resumenConexion.puerto}/${resumenConexion.baseDatos} ` +
        `(origen: ${resumenConexion.origen}, SSL: ${resumenConexion.ssl ? 'activo' : 'inactivo'}).`
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
  comprobarConexion,
  describirErrorConexion,
  cerrarConexion,
  resumenConexion,
  origenConfiguracion
};
