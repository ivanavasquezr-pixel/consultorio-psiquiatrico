/**
 * Funciones auxiliares de validación y normalización de datos.
 * Se reutilizan en todos los controladores para mantener reglas coherentes.
 */

/**
 * Comprueba si un valor es un número entero positivo.
 * @param {*} valor Valor a evaluar.
 * @returns {boolean} Verdadero si es un entero mayor que cero.
 */
const esEnteroPositivo = (valor) => {
  if (valor === undefined || valor === null || valor === '') {
    return false;
  }

  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0;
};

/**
 * Convierte un valor a texto y elimina los espacios de los extremos.
 * @param {*} valor Valor a limpiar.
 * @returns {string} Texto limpio.
 */
const limpiarTexto = (valor) => {
  if (valor === undefined || valor === null) {
    return '';
  }

  return String(valor).trim();
};

/**
 * Normaliza un campo opcional: los valores vacíos se convierten en null.
 * @param {*} valor Valor a normalizar.
 * @returns {string|null} Texto limpio o null.
 */
const textoOpcional = (valor) => {
  const texto = limpiarTexto(valor);
  return texto === '' ? null : texto;
};

/**
 * Valida el formato de un correo electrónico.
 * @param {string} correo Correo a evaluar.
 * @returns {boolean} Verdadero si el formato es válido.
 */
const esCorreoValido = (correo) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
};

/**
 * Valida una fecha con formato AAAA-MM-DD comprobando que exista en el calendario.
 * @param {string} fecha Fecha a evaluar.
 * @returns {boolean} Verdadero si la fecha es válida.
 */
const esFechaValida = (fecha) => {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaObjeto = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fechaObjeto.getUTCFullYear() === anio &&
    fechaObjeto.getUTCMonth() === mes - 1 &&
    fechaObjeto.getUTCDate() === dia
  );
};

/**
 * Comprueba si una fecha es posterior al día actual.
 * @param {string} fecha Fecha con formato AAAA-MM-DD.
 * @returns {boolean} Verdadero si la fecha es futura.
 */
const esFechaPosteriorAHoy = (fecha) => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  const fechaActual = `${anio}-${mes}-${dia}`;

  return fecha > fechaActual;
};

/**
 * Valida una hora con formato HH:MM o HH:MM:SS.
 * @param {string} hora Hora a evaluar.
 * @returns {boolean} Verdadero si la hora es válida.
 */
const esHoraValida = (hora) => {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(hora);
};

/**
 * Normaliza una hora al formato HH:MM:SS requerido por MySQL.
 * @param {string} hora Hora con formato HH:MM o HH:MM:SS.
 * @returns {string} Hora normalizada.
 */
const normalizarHora = (hora) => {
  if (!hora) {
    return '';
  }

  return hora.length === 5 ? `${hora}:00` : hora;
};

/**
 * Valida un número telefónico de forma flexible.
 * @param {string} telefono Teléfono a evaluar.
 * @returns {boolean} Verdadero si el formato es aceptable.
 */
const esTelefonoValido = (telefono) => {
  return /^[0-9+\-()\s]{7,20}$/.test(telefono);
};

module.exports = {
  esEnteroPositivo,
  limpiarTexto,
  textoOpcional,
  esCorreoValido,
  esFechaValida,
  esFechaPosteriorAHoy,
  esHoraValida,
  normalizarHora,
  esTelefonoValido
};
