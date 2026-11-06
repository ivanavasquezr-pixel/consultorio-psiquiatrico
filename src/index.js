/**
 * Punto de entrada de la API REST del Consultorio Psicológico.
 * Configura Express, los middlewares globales, las rutas y el servidor.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { grupoConexiones, verificarConexion, cerrarConexion } = require('./configuracion/conexion');

const pacienteRutas = require('./rutas/pacienteRutas');
const psicologoRutas = require('./rutas/psicologoRutas');
const consultorioRutas = require('./rutas/consultorioRutas');
const citaRutas = require('./rutas/citaRutas');
const historialRutas = require('./rutas/historialRutas');

const app = express();

// Seguridad básica: no revelar la tecnología del servidor.
app.disable('x-powered-by');

// Configuración de CORS. Se puede restringir mediante CORS_ORIGIN.
const origenesConfigurados = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origenesConfigurados.includes('*') ? '*' : origenesConfigurados
  })
);

// Lectura de cuerpos JSON y formularios.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * Ruta informativa de la raíz.
 * GET /
 */
app.get('/', (req, res) => {
  return res.status(200).json({
    exito: true,
    mensaje: 'API REST del Consultorio Psicológico.',
    version: '2.0.0',
    documentacion: 'Consulta el archivo README.md para ver todos los endpoints.',
    estado: 'Servicio activo.'
  });
});

/**
 * Verificación de salud del servicio y de la base de datos.
 * GET /api/salud
 */
app.get('/api/salud', async (req, res) => {
  let estadoBaseDatos = 'conectada';

  try {
    await grupoConexiones.query('SELECT 1');
  } catch (error) {
    estadoBaseDatos = 'desconectada';
  }

  return res.status(200).json({
    exito: true,
    mensaje: 'Servicio activo.',
    datos: {
      servicio: 'API Consultorio Psicológico',
      estado: 'activo',
      baseDatos: estadoBaseDatos,
      fecha: new Date().toISOString()
    }
  });
});

// Registro de las rutas REST bajo el prefijo /api.
app.use('/api/pacientes', pacienteRutas);
app.use('/api/psicologos', psicologoRutas);
app.use('/api/consultorios', consultorioRutas);
app.use('/api/citas', citaRutas);
app.use('/api/historial', historialRutas);

// Manejo de rutas no encontradas.
app.use((req, res) => {
  return res.status(404).json({
    exito: false,
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe.`
  });
});

// Manejo global de errores no controlados.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error('[Error no controlado]', error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      exito: false,
      mensaje: 'El cuerpo de la solicitud contiene un JSON inválido.'
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El cuerpo de la solicitud excede el tamaño permitido.'
    });
  }

  return res.status(500).json({
    exito: false,
    mensaje: 'Error interno del servidor.',
    ...(process.env.NODE_ENV !== 'production' && {
      detalle: error.message || 'Error desconocido.'
    })
  });
});

/**
 * Inicia el servidor después de verificar la conexión con MySQL.
 * Si la base de datos no está disponible, el servidor arranca igualmente
 * para permitir consultar el endpoint de salud y revisar el problema.
 * @returns {Promise<object>} Servidor HTTP creado.
 */
const iniciarServidor = async () => {
  const puerto = Number(process.env.PORT) || 3000;

  try {
    await verificarConexion();
  } catch (error) {
    console.error(
      `No se pudo conectar a MySQL al iniciar: ${error.message}`
    );
    console.warn(
      'El servidor se iniciará de todos modos, pero las operaciones que requieran la base de datos fallarán hasta que se corrijan las credenciales.'
    );
  }

  const servidor = app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Endpoint de salud: http://localhost:${puerto}/api/salud`);
  });

  /**
   * Cierra el servidor y el grupo de conexiones de forma ordenada.
   * @param {string} senal Señal recibida por el proceso.
   */
  const cerrarAplicacion = (senal) => {
    console.log(`Señal ${senal} recibida. Cerrando el servidor...`);

    servidor.close(async () => {
      try {
        await cerrarConexion();
        process.exit(0);
      } catch (error) {
        console.error('Error al cerrar la conexión con MySQL:', error.message);
        process.exit(1);
      }
    });

    // Cierre forzado si el proceso no termina en 10 segundos.
    setTimeout(() => {
      console.error('Cierre forzado del proceso.');
      process.exit(1);
    }, 10000).unref();
  };

  process.once('SIGINT', () => cerrarAplicacion('SIGINT'));
  process.once('SIGTERM', () => cerrarAplicacion('SIGTERM'));

  return servidor;
};

// Solo se inicia el servidor cuando el archivo se ejecuta directamente.
if (require.main === module) {
  iniciarServidor();
}

module.exports = {
  app,
  iniciarServidor
};
