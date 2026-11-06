/**
 * Controlador de médicos: validación de datos y respuestas HTTP.
 */

const medicoModelo = require('../modelos/medicoModelo');
const consultorioModelo = require('../modelos/consultorioModelo');
const {
  esEnteroPositivo,
  limpiarTexto,
  textoOpcional,
  esCorreoValido,
  esTelefonoValido
} = require('../utilidades/validaciones');
const {
  responderValidacion,
  responderNoEncontrado,
  responderError
} = require('../utilidades/respuestas');

/**
 * Valida y normaliza los datos recibidos para un médico.
 * @param {object} cuerpo Cuerpo de la solicitud.
 * @returns {{errores: string[], datos: object}} Resultado de la validación.
 */
const validarDatosMedico = (cuerpo = {}) => {
  const errores = [];
  const idConsultorioTexto = textoOpcional(cuerpo.id_consultorio);
  const datos = {
    nombre: limpiarTexto(cuerpo.nombre),
    apellido: limpiarTexto(cuerpo.apellido),
    especialidad: limpiarTexto(cuerpo.especialidad),
    cedula_profesional: limpiarTexto(cuerpo.cedula_profesional),
    telefono: textoOpcional(cuerpo.telefono),
    correo: limpiarTexto(cuerpo.correo).toLowerCase(),
    id_consultorio: idConsultorioTexto === null ? null : Number(idConsultorioTexto)
  };

  if (!datos.nombre) {
    errores.push('El nombre es obligatorio.');
  } else if (datos.nombre.length > 100) {
    errores.push('El nombre no puede superar los 100 caracteres.');
  }

  if (!datos.apellido) {
    errores.push('El apellido es obligatorio.');
  } else if (datos.apellido.length > 100) {
    errores.push('El apellido no puede superar los 100 caracteres.');
  }

  if (!datos.especialidad) {
    errores.push('La especialidad es obligatoria.');
  } else if (datos.especialidad.length > 100) {
    errores.push('La especialidad no puede superar los 100 caracteres.');
  }

  if (!datos.cedula_profesional) {
    errores.push('La cédula profesional es obligatoria.');
  } else if (datos.cedula_profesional.length > 50) {
    errores.push('La cédula profesional no puede superar los 50 caracteres.');
  }

  if (!datos.correo) {
    errores.push('El correo electrónico es obligatorio.');
  } else if (datos.correo.length > 120) {
    errores.push('El correo electrónico no puede superar los 120 caracteres.');
  } else if (!esCorreoValido(datos.correo)) {
    errores.push('El correo electrónico no tiene un formato válido.');
  }

  if (datos.telefono && !esTelefonoValido(datos.telefono)) {
    errores.push(
      'El teléfono debe contener entre 7 y 20 caracteres numéricos o los símbolos +, -, ( ) y espacios.'
    );
  }

  if (idConsultorioTexto !== null && !esEnteroPositivo(idConsultorioTexto)) {
    errores.push(
      'El identificador del consultorio debe ser un número entero positivo.'
    );
  }

  return { errores, datos };
};

/**
 * Verifica que el consultorio exista y que la cédula y el correo no estén repetidos.
 * @param {object} datos Datos normalizados del médico.
 * @param {number|null} idExcluir Médico que se excluye durante una actualización.
 * @returns {Promise<string[]>} Lista de errores encontrados.
 */
const validarRelacionesYDuplicados = async (datos, idExcluir = null) => {
  const errores = [];

  const [consultorio, cedulaExistente, correoExistente] = await Promise.all([
    datos.id_consultorio !== null
      ? consultorioModelo.obtenerPorId(datos.id_consultorio)
      : Promise.resolve(null),
    datos.cedula_profesional
      ? medicoModelo.buscarPorCedula(datos.cedula_profesional, idExcluir)
      : Promise.resolve(null),
    datos.correo
      ? medicoModelo.buscarPorCorreo(datos.correo, idExcluir)
      : Promise.resolve(null)
  ]);

  if (datos.id_consultorio !== null && !consultorio) {
    errores.push('El consultorio indicado no existe.');
  }

  if (cedulaExistente) {
    errores.push('La cédula profesional ya está registrada para otro médico.');
  }

  if (correoExistente) {
    errores.push('El correo electrónico ya está registrado para otro médico.');
  }

  return errores;
};

/**
 * Lista todos los médicos.
 * GET /api/medicos
 */
const listarMedicos = async (req, res) => {
  try {
    const medicos = await medicoModelo.listarTodos();

    return res.status(200).json({
      exito: true,
      mensaje: 'Médicos obtenidos correctamente.',
      total: medicos.length,
      datos: medicos
    });
  } catch (error) {
    return responderError(res, 'Error al obtener los médicos.', error);
  }
};

/**
 * Obtiene un médico por su identificador.
 * GET /api/medicos/:id
 */
const obtenerMedico = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del médico debe ser un número entero positivo.'
      ]);
    }

    const medico = await medicoModelo.obtenerPorId(Number(req.params.id));

    if (!medico) {
      return responderNoEncontrado(res, 'Médico no encontrado.');
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Médico encontrado.',
      datos: medico
    });
  } catch (error) {
    return responderError(res, 'Error al obtener el médico.', error);
  }
};

/**
 * Crea un médico.
 * POST /api/medicos
 */
const crearMedico = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const { errores, datos } = validarDatosMedico(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const erroresRelaciones = await validarRelacionesYDuplicados(datos);

    if (erroresRelaciones.length > 0) {
      return responderValidacion(res, erroresRelaciones);
    }

    const medico = await medicoModelo.crear(datos);

    return res.status(201).json({
      exito: true,
      mensaje: 'Médico registrado correctamente.',
      datos: medico
    });
  } catch (error) {
    return responderError(res, 'Error al registrar el médico.', error);
  }
};

/**
 * Actualiza un médico.
 * PUT /api/medicos/:id
 */
const actualizarMedico = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del médico debe ser un número entero positivo.'
      ]);
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const idMedico = Number(req.params.id);
    const medicoExistente = await medicoModelo.obtenerPorId(idMedico);

    if (!medicoExistente) {
      return responderNoEncontrado(res, 'Médico no encontrado.');
    }

    const { errores, datos } = validarDatosMedico(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const erroresRelaciones = await validarRelacionesYDuplicados(datos, idMedico);

    if (erroresRelaciones.length > 0) {
      return responderValidacion(res, erroresRelaciones);
    }

    await medicoModelo.actualizar(idMedico, datos);
    const medicoActualizado = await medicoModelo.obtenerPorId(idMedico);

    return res.status(200).json({
      exito: true,
      mensaje: 'Médico actualizado correctamente.',
      datos: medicoActualizado
    });
  } catch (error) {
    return responderError(res, 'Error al actualizar el médico.', error);
  }
};

/**
 * Elimina un médico.
 * DELETE /api/medicos/:id
 */
const eliminarMedico = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del médico debe ser un número entero positivo.'
      ]);
    }

    const idMedico = Number(req.params.id);
    const medico = await medicoModelo.obtenerPorId(idMedico);

    if (!medico) {
      return responderNoEncontrado(res, 'Médico no encontrado.');
    }

    await medicoModelo.eliminar(idMedico);

    return res.status(200).json({
      exito: true,
      mensaje: 'Médico eliminado correctamente.'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se puede eliminar el médico porque tiene citas asociadas.'
      });
    }

    return responderError(res, 'Error al eliminar el médico.', error);
  }
};

module.exports = {
  listarMedicos,
  obtenerMedico,
  crearMedico,
  actualizarMedico,
  eliminarMedico
};
