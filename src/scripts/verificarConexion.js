/**
 * Script de diagnóstico de la conexión a MySQL.
 *
 * Uso local:
 *   npm run verificar:conexion
 *
 * En Render se puede ejecutar desde la pestaña "Shell" del servicio.
 * No imprime contraseñas ni tokens; solo el destino y el diagnóstico.
 */

const {
  comprobarConexion,
  cerrarConexion,
  resumenConexion
} = require('../configuracion/conexion');

const ejecutar = async () => {
  console.log('Configuración de conexión detectada:');
  console.log(`  Host: ${resumenConexion.host}`);
  console.log(`  Puerto: ${resumenConexion.puerto}`);
  console.log(`  Base de datos: ${resumenConexion.baseDatos}`);
  console.log(`  SSL: ${resumenConexion.ssl ? 'activo' : 'inactivo'}`);
  console.log(`  Origen: ${resumenConexion.origen}`);
  console.log('');

  const estado = await comprobarConexion();

  if (estado.conectada) {
    console.log('✓ Conexión a MySQL establecida correctamente.');
    console.log('✓ La API puede operar contra esta base de datos.');
  } else {
    console.error(`✗ Conexión fallida [${estado.codigo}]: ${estado.descripcion}`);
    console.error('');
    console.error('Revisa en Render las variables de entorno:');
    console.error('  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME y DB_SSL');
    console.error(
      'Si usas MySQL de Railway desde Render, utiliza el host y puerto públicos del TCP Proxy.'
    );
    process.exitCode = 1;
  }

  await cerrarConexion();
};

ejecutar().catch(async (error) => {
  console.error('Error inesperado al verificar la conexión:', error.message);
  process.exitCode = 1;

  try {
    await cerrarConexion();
  } catch (errorCierre) {
    // El grupo de conexiones ya podría estar cerrado.
  }
});
