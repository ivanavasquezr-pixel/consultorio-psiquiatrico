/**
 * Utilidades para construir respuestas JSON uniformes y manejar errores.
 */

const MENSAJES_ERROR_BASE_DATOS = {
  ER_DUP_ENTRY: 'Ya existe un registro con los mismos datos únicos.',
  ER_NO_REFERENCED_ROW_2:
    'El registro relacionado no existe o fue eliminado previamente.',
  ER_ROW_IS_REFERENCED_2:
    'No se puede eliminar el registro porque tiene información relacionada.',
  ER_DATA_TOO_LONG: 'Uno de los valores excede la longitud permitida.',
  ER_TRUNCATED_WRONG_VALUE:
    'Uno de los valores enviados no tiene un formato válido para la base de datos.',
  ER_BAD_NULL_ERROR: 'Uno de los campos obligatorios no puede estar vacío.',
  ER_WRONG_VALUE_COUNT_ON_ROW:
    'La cantidad de valores enviados no coincide con la estructura de la tabla.'
};

/**
 * Envía una respuesta de validación con código HTTP 400.
 * @param {object} res Objeto de respuesta de Express.
 * @param {string[]} errores Lista de errores detectados.
 * @returns {object} Respuesta HTTP.
 */
const responderValidacion = (res, errores) => {
  return res.status(400).json({
    exito: false,
    mensaje: 'Los datos enviados no son válidos.',
    errores
  });
};

/**
 * Envía una respuesta de recurso no encontrado con código HTTP 404.
 * @param {object} res Objeto de respuesta de Express.
 * @param {string} mensaje Mensaje descriptivo.
 * @returns {object} Respuesta HTTP.
 */
const responderNoEncontrado = (res, mensaje) => {
  return res.status(404).json({
    exito: false,
    mensaje
  });
};

/**
 * Envía una respuesta de error. Los errores controlados de MySQL se
 * devuelven con código 400 y los fallos inesperados con código 500.
 * @param {object} res Objeto de respuesta de Express.
 * @param {string} mensaje Mensaje contextual de la operación.
 * @param {Error} error Error capturado.
 * @returns {object} Respuesta HTTP.
 */
const responderError = (res, mensaje, error) => {
  console.error(`[Error] ${mensaje}`, error);

  const codigoSql = error && typeof error.code === 'string' ? error.code : '';
  const mensajeBaseDatos = MENSAJES_ERROR_BASE_DATOS[codigoSql];
  const esErrorControlado = Boolean(mensajeBaseDatos);
  const respuesta = {
    exito: false,
    mensaje: mensajeBaseDatos ? `${mensaje} ${mensajeBaseDatos}` : mensaje
  };

  // El detalle técnico solo se expone fuera de producción.
  if (process.env.NODE_ENV !== 'production') {
    respuesta.detalle = error && error.message ? error.message : 'Error desconocido.';
  }

  return res.status(esErrorControlado ? 400 : 500).json(respuesta);
};

module.exports = {
  responderValidacion,
  responderNoEncontrado,
  responderError
};
