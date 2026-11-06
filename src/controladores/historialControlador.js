/**
 * Controlador del historial clínico: validación de datos, verificación
 * de la cita relacionada y respuestas HTTP.
 */

const historialModelo = require('../modelos/historialModelo');
const citaModelo = require('../modelos/citaModelo');
const {
  esEnteroPositivo,
  limpiarTexto,
  textoOpcional
} = require('../utilidades/validaciones');
const {
  responderValidacion,
  responderNoEncontrado,
  responderError
} = require('../utilidades/respuestas');

/**
 * Valida y normaliza los datos recibidos para un registro clínico.
 * @param {object} cuerpo Cuerpo de la solicitud.
 * @returns {{errores: string[], datos: object}} Resultado de la validación.
 */
const validarDatosHistorial = (cuerpo = {}) => {
  const errores = [];
  const datos = {
    id_cita: esEnteroPositivo(cuerpo.id_cita) ? Number(cuerpo.id_cita) : null,
    diagnostico: limpiarTexto(cuerpo.diagnostico),
    tratamiento: textoOpcional(cuerpo.tratamiento),
    notas: textoOpcional(cuerpo.notas)
  };

  if (datos.id_cita === null) {
    errores.push(
      'La cita es obligatoria y su identificador debe ser un número entero positivo.'
    );
  }

  if (!datos.diagnostico) {
    errores.push('El diagnóstico es obligatorio.');
  }

  return { errores, datos };
};

/**
 * Verifica que la cita exista y que no tenga otro registro clínico.
 * @param {object} datos Datos normalizados del historial.
 * @param {number|null} idExcluir Registro que se excluye durante una actualización.
 * @returns {Promise<string[]>} Errores de relación encontrados.
 */
const validarRelacionConCita = async (datos, idExcluir = null) => {
  const errores = [];
  const cita = await citaModelo.obtenerPorId(datos.id_cita);

  if (!cita) {
    errores.push('La cita indicada no existe.');
    return errores;
  }

  const historialExistente = await historialModelo.obtenerPorCita(datos.id_cita);

  if (
    historialExistente &&
    (idExcluir === null || historialExistente.id_historial !== idExcluir)
  ) {
    errores.push('La cita ya tiene un registro en el historial clínico.');
  }

  return errores;
};

/**
 * Lista todos los registros del historial clínico.
 * GET /api/historial
 */
const listarHistoriales = async (req, res) => {
  try {
    const historiales = await historialModelo.listarTodos();

    return res.status(200).json({
      exito: true,
      mensaje: 'Historial clínico obtenido correctamente.',
      total: historiales.length,
      datos: historiales
    });
  } catch (error) {
    return responderError(res, 'Error al obtener el historial clínico.', error);
  }
};

/**
 * Obtiene un registro del historial por su identificador.
 * GET /api/historial/:id
 */
const obtenerHistorial = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del historial debe ser un número entero positivo.'
      ]);
    }

    const historial = await historialModelo.obtenerPorId(Number(req.params.id));

    if (!historial) {
      return responderNoEncontrado(res, 'Registro del historial no encontrado.');
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Registro del historial encontrado.',
      datos: historial
    });
  } catch (error) {
    return responderError(res, 'Error al obtener el registro del historial.', error);
  }
};

/**
 * Obtiene el historial asociado a una cita.
 * GET /api/historial/cita/:idCita
 */
const obtenerHistorialPorCita = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.idCita)) {
      return responderValidacion(res, [
        'El identificador de la cita debe ser un número entero positivo.'
      ]);
    }

    const idCita = Number(req.params.idCita);
    const cita = await citaModelo.obtenerPorId(idCita);

    if (!cita) {
      return responderNoEncontrado(res, 'Cita no encontrada.');
    }

    const historial = await historialModelo.obtenerPorCita(idCita);

    if (!historial) {
      return responderNoEncontrado(
        res,
        'La cita no tiene un registro en el historial clínico.'
      );
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Registro del historial encontrado.',
      datos: historial
    });
  } catch (error) {
    return responderError(
      res,
      'Error al obtener el historial de la cita.',
      error
    );
  }
};

/**
 * Crea un registro en el historial clínico.
 * POST /api/historial
 */
const crearHistorial = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const { errores, datos } = validarDatosHistorial(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const erroresRelacion = await validarRelacionConCita(datos);

    if (erroresRelacion.length > 0) {
      return responderValidacion(res, erroresRelacion);
    }

    const historial = await historialModelo.crear(datos);

    return res.status(201).json({
      exito: true,
      mensaje: 'Registro del historial clínico creado correctamente.',
      datos: historial
    });
  } catch (error) {
    return responderError(
      res,
      'Error al crear el registro del historial clínico.',
      error
    );
  }
};

/**
 * Actualiza un registro del historial clínico.
 * PUT /api/historial/:id
 */
const actualizarHistorial = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del historial debe ser un número entero positivo.'
      ]);
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const idHistorial = Number(req.params.id);
    const historialExistente = await historialModelo.obtenerPorId(idHistorial);

    if (!historialExistente) {
      return responderNoEncontrado(res, 'Registro del historial no encontrado.');
    }

    const { errores, datos } = validarDatosHistorial(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const erroresRelacion = await validarRelacionConCita(datos, idHistorial);

    if (erroresRelacion.length > 0) {
      return responderValidacion(res, erroresRelacion);
    }

    await historialModelo.actualizar(idHistorial, datos);
    const historialActualizado = await historialModelo.obtenerPorId(idHistorial);

    return res.status(200).json({
      exito: true,
      mensaje: 'Registro del historial clínico actualizado correctamente.',
      datos: historialActualizado
    });
  } catch (error) {
    return responderError(
      res,
      'Error al actualizar el registro del historial clínico.',
      error
    );
  }
};

/**
 * Elimina un registro del historial clínico.
 * DELETE /api/historial/:id
 */
const eliminarHistorial = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del historial debe ser un número entero positivo.'
      ]);
    }

    const idHistorial = Number(req.params.id);
    const historial = await historialModelo.obtenerPorId(idHistorial);

    if (!historial) {
      return responderNoEncontrado(res, 'Registro del historial no encontrado.');
    }

    await historialModelo.eliminar(idHistorial);

    return res.status(200).json({
      exito: true,
      mensaje: 'Registro del historial clínico eliminado correctamente.'
    });
  } catch (error) {
    return responderError(
      res,
      'Error al eliminar el registro del historial clínico.',
      error
    );
  }
};

module.exports = {
  listarHistoriales,
  obtenerHistorial,
  obtenerHistorialPorCita,
  crearHistorial,
  actualizarHistorial,
  eliminarHistorial
};
