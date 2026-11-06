/**
 * Controlador de citas: validación de datos, verificación de relaciones
 * y control de conflictos de horario.
 */

const citaModelo = require('../modelos/citaModelo');
const pacienteModelo = require('../modelos/pacienteModelo');
const medicoModelo = require('../modelos/medicoModelo');
const consultorioModelo = require('../modelos/consultorioModelo');
const {
  esEnteroPositivo,
  limpiarTexto,
  textoOpcional,
  esFechaValida,
  esHoraValida,
  normalizarHora
} = require('../utilidades/validaciones');
const {
  responderValidacion,
  responderNoEncontrado,
  responderError
} = require('../utilidades/respuestas');

const ESTADOS_PERMITIDOS = ['Programada', 'Confirmada', 'Atendida', 'Cancelada'];

/**
 * Valida y normaliza los datos recibidos para una cita.
 * @param {object} cuerpo Cuerpo de la solicitud.
 * @returns {{errores: string[], datos: object}} Resultado de la validación.
 */
const validarDatosCita = (cuerpo = {}) => {
  const errores = [];
  const horaTexto = limpiarTexto(cuerpo.hora_cita);
  const datos = {
    id_paciente: esEnteroPositivo(cuerpo.id_paciente)
      ? Number(cuerpo.id_paciente)
      : null,
    id_medico: esEnteroPositivo(cuerpo.id_medico)
      ? Number(cuerpo.id_medico)
      : null,
    id_consultorio: esEnteroPositivo(cuerpo.id_consultorio)
      ? Number(cuerpo.id_consultorio)
      : null,
    fecha_cita: limpiarTexto(cuerpo.fecha_cita),
    hora_cita: normalizarHora(horaTexto),
    motivo: textoOpcional(cuerpo.motivo),
    estado: limpiarTexto(cuerpo.estado) || 'Programada'
  };

  if (datos.id_paciente === null) {
    errores.push('El paciente es obligatorio y su identificador debe ser un número entero positivo.');
  }

  if (datos.id_medico === null) {
    errores.push('El médico es obligatorio y su identificador debe ser un número entero positivo.');
  }

  if (datos.id_consultorio === null) {
    errores.push(
      'El consultorio es obligatorio y su identificador debe ser un número entero positivo.'
    );
  }

  if (!esFechaValida(datos.fecha_cita)) {
    errores.push(
      'La fecha de la cita es obligatoria y debe tener un formato válido AAAA-MM-DD.'
    );
  }

  if (!esHoraValida(horaTexto)) {
    errores.push(
      'La hora de la cita es obligatoria y debe tener un formato válido HH:MM o HH:MM:SS.'
    );
  }

  if (!ESTADOS_PERMITIDOS.includes(datos.estado)) {
    errores.push(`El estado debe ser uno de: ${ESTADOS_PERMITIDOS.join(', ')}.`);
  }

  if (datos.motivo && datos.motivo.length > 255) {
    errores.push('El motivo no puede superar los 255 caracteres.');
  }

  return { errores, datos };
};

/**
 * Comprueba que el paciente, el médico y el consultorio existan.
 * @param {object} datos Datos normalizados de la cita.
 * @returns {Promise<string[]>} Errores de relación encontrados.
 */
const validarRelaciones = async (datos) => {
  if (
    datos.id_paciente === null ||
    datos.id_medico === null ||
    datos.id_consultorio === null
  ) {
    return [];
  }

  const errores = [];

  const [paciente, medico, consultorio] = await Promise.all([
    pacienteModelo.obtenerPorId(datos.id_paciente),
    medicoModelo.obtenerPorId(datos.id_medico),
    consultorioModelo.obtenerPorId(datos.id_consultorio)
  ]);

  if (!paciente) {
    errores.push('El paciente indicado no existe.');
  }

  if (!medico) {
    errores.push('El médico indicado no existe.');
  }

  if (!consultorio) {
    errores.push('El consultorio indicado no existe.');
  }

  return errores;
};

/**
 * Comprueba si ya existe una cita activa en el mismo horario para el
 * médico o para el paciente.
 * @param {object} datos Datos normalizados de la cita.
 * @param {number|null} idExcluir Cita que se excluye durante una actualización.
 * @returns {Promise<boolean>} Verdadero si hay conflicto.
 */
const existeConflictoHorario = async (datos, idExcluir = null) => {
  const conflicto = await citaModelo.buscarConflictoHorario({
    idMedico: datos.id_medico,
    idPaciente: datos.id_paciente,
    fechaCita: datos.fecha_cita,
    horaCita: datos.hora_cita,
    idExcluir
  });

  return Boolean(conflicto);
};

/**
 * Lista todas las citas.
 * GET /api/citas
 */
const listarCitas = async (req, res) => {
  try {
    const citas = await citaModelo.listarTodos();

    return res.status(200).json({
      exito: true,
      mensaje: 'Citas obtenidas correctamente.',
      total: citas.length,
      datos: citas
    });
  } catch (error) {
    return responderError(res, 'Error al obtener las citas.', error);
  }
};

/**
 * Obtiene una cita por su identificador.
 * GET /api/citas/:id
 */
const obtenerCita = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador de la cita debe ser un número entero positivo.'
      ]);
    }

    const cita = await citaModelo.obtenerPorId(Number(req.params.id));

    if (!cita) {
      return responderNoEncontrado(res, 'Cita no encontrada.');
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Cita encontrada.',
      datos: cita
    });
  } catch (error) {
    return responderError(res, 'Error al obtener la cita.', error);
  }
};

/**
 * Lista las citas de un paciente.
 * GET /api/citas/paciente/:idPaciente
 */
const listarCitasPorPaciente = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.idPaciente)) {
      return responderValidacion(res, [
        'El identificador del paciente debe ser un número entero positivo.'
      ]);
    }

    const idPaciente = Number(req.params.idPaciente);
    const paciente = await pacienteModelo.obtenerPorId(idPaciente);

    if (!paciente) {
      return responderNoEncontrado(res, 'Paciente no encontrado.');
    }

    const citas = await citaModelo.listarPorPaciente(idPaciente);

    return res.status(200).json({
      exito: true,
      mensaje: 'Citas del paciente obtenidas correctamente.',
      total: citas.length,
      datos: citas
    });
  } catch (error) {
    return responderError(res, 'Error al obtener las citas del paciente.', error);
  }
};

/**
 * Lista las citas de un médico.
 * GET /api/citas/medico/:idMedico
 */
const listarCitasPorMedico = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.idMedico)) {
      return responderValidacion(res, [
        'El identificador del médico debe ser un número entero positivo.'
      ]);
    }

    const idMedico = Number(req.params.idMedico);
    const medico = await medicoModelo.obtenerPorId(idMedico);

    if (!medico) {
      return responderNoEncontrado(res, 'Médico no encontrado.');
    }

    const citas = await citaModelo.listarPorMedico(idMedico);

    return res.status(200).json({
      exito: true,
      mensaje: 'Citas del médico obtenidas correctamente.',
      total: citas.length,
      datos: citas
    });
  } catch (error) {
    return responderError(res, 'Error al obtener las citas del médico.', error);
  }
};

/**
 * Crea una cita.
 * POST /api/citas
 */
const crearCita = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const { errores, datos } = validarDatosCita(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const erroresRelaciones = await validarRelaciones(datos);

    if (erroresRelaciones.length > 0) {
      return responderValidacion(res, erroresRelaciones);
    }

    if (await existeConflictoHorario(datos)) {
      return responderValidacion(res, [
        'Ya existe una cita activa para el médico o el paciente en la fecha y hora indicadas.'
      ]);
    }

    const cita = await citaModelo.crear(datos);

    return res.status(201).json({
      exito: true,
      mensaje: 'Cita registrada correctamente.',
      datos: cita
    });
  } catch (error) {
    return responderError(res, 'Error al registrar la cita.', error);
  }
};

/**
 * Actualiza una cita.
 * PUT /api/citas/:id
 */
const actualizarCita = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador de la cita debe ser un número entero positivo.'
      ]);
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const idCita = Number(req.params.id);
    const citaExistente = await citaModelo.obtenerPorId(idCita);

    if (!citaExistente) {
      return responderNoEncontrado(res, 'Cita no encontrada.');
    }

    const { errores, datos } = validarDatosCita(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const erroresRelaciones = await validarRelaciones(datos);

    if (erroresRelaciones.length > 0) {
      return responderValidacion(res, erroresRelaciones);
    }

    if (await existeConflictoHorario(datos, idCita)) {
      return responderValidacion(res, [
        'Ya existe otra cita activa para el médico o el paciente en la fecha y hora indicadas.'
      ]);
    }

    await citaModelo.actualizar(idCita, datos);
    const citaActualizada = await citaModelo.obtenerPorId(idCita);

    return res.status(200).json({
      exito: true,
      mensaje: 'Cita actualizada correctamente.',
      datos: citaActualizada
    });
  } catch (error) {
    return responderError(res, 'Error al actualizar la cita.', error);
  }
};

/**
 * Elimina una cita.
 * DELETE /api/citas/:id
 */
const eliminarCita = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador de la cita debe ser un número entero positivo.'
      ]);
    }

    const idCita = Number(req.params.id);
    const cita = await citaModelo.obtenerPorId(idCita);

    if (!cita) {
      return responderNoEncontrado(res, 'Cita no encontrada.');
    }

    await citaModelo.eliminar(idCita);

    return res.status(200).json({
      exito: true,
      mensaje: 'Cita eliminada correctamente.'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        exito: false,
        mensaje:
          'No se puede eliminar la cita porque tiene un registro en el historial clínico.'
      });
    }

    return responderError(res, 'Error al eliminar la cita.', error);
  }
};

module.exports = {
  listarCitas,
  obtenerCita,
  listarCitasPorPaciente,
  listarCitasPorMedico,
  crearCita,
  actualizarCita,
  eliminarCita
};
