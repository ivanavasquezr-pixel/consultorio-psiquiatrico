/**
 * Controlador de psicólogos: validación de datos y respuestas HTTP.
 */

const psicologoModelo = require('../modelos/psicologoModelo');
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
 * Valida y normaliza los datos recibidos para un psicólogo.
 * @param {object} cuerpo Cuerpo de la solicitud.
 * @returns {{errores: string[], datos: object}} Resultado de la validación.
 */
const validarDatosPsicologo = (cuerpo = {}) => {
  const errores = [];
  const idConsultorioTexto = textoOpcional(cuerpo.id_consultorio);
  const datos = {
    nombre: limpiarTexto(cuerpo.nombre),
    apellido: limpiarTexto(cuerpo.apellido),
    especialidad: limpiarTexto(cuerpo.especialidad),
    cedula_profesional: limpiarTexto(cuerpo.cedula_profesional),
    telefono: textoOpcional(cuerpo.telefono),
    correo: limpiarTexto(cuerpo.correo).toLowerCase(),
    enfoque_terapeutico: textoOpcional(cuerpo.enfoque_terapeutico),
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

  if (datos.enfoque_terapeutico && datos.enfoque_terapeutico.length > 100) {
    errores.push('El enfoque terapéutico no puede superar los 100 caracteres.');
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
 * @param {object} datos Datos normalizados del psicólogo.
 * @param {number|null} idExcluir Psicólogo que se excluye durante una actualización.
 * @returns {Promise<string[]>} Lista de errores encontrados.
 */
const validarRelacionesYDuplicados = async (datos, idExcluir = null) => {
  const errores = [];

  const [consultorio, cedulaExistente, correoExistente] = await Promise.all([
    datos.id_consultorio !== null
      ? consultorioModelo.obtenerPorId(datos.id_consultorio)
      : Promise.resolve(null),
    datos.cedula_profesional
      ? psicologoModelo.buscarPorCedula(datos.cedula_profesional, idExcluir)
      : Promise.resolve(null),
    datos.correo
      ? psicologoModelo.buscarPorCorreo(datos.correo, idExcluir)
      : Promise.resolve(null)
  ]);

  if (datos.id_consultorio !== null && !consultorio) {
    errores.push('El consultorio indicado no existe.');
  }

  if (cedulaExistente) {
    errores.push('La cédula profesional ya está registrada para otro psicólogo.');
  }

  if (correoExistente) {
    errores.push('El correo electrónico ya está registrado para otro psicólogo.');
  }

  return errores;
};

/**
 * Lista todos los psicólogos.
 * GET /api/psicologos
 */
const listarPsicologos = async (req, res) => {
  try {
    const psicologos = await psicologoModelo.listarTodos();

    return res.status(200).json({
      exito: true,
      mensaje: 'Psicólogos obtenidos correctamente.',
      total: psicologos.length,
      datos: psicologos
    });
  } catch (error) {
    return responderError(res, 'Error al obtener los psicólogos.', error);
  }
};

/**
 * Obtiene un psicólogo por su identificador.
 * GET /api/psicologos/:id
 */
const obtenerPsicologo = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del psicólogo debe ser un número entero positivo.'
      ]);
    }

    const psicologo = await psicologoModelo.obtenerPorId(Number(req.params.id));

    if (!psicologo) {
      return responderNoEncontrado(res, 'Psicólogo no encontrado.');
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Psicólogo encontrado.',
      datos: psicologo
    });
  } catch (error) {
    return responderError(res, 'Error al obtener el psicólogo.', error);
  }
};

/**
 * Crea un psicólogo.
 * POST /api/psicologos
 */
const crearPsicologo = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const { errores, datos } = validarDatosPsicologo(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const erroresRelaciones = await validarRelacionesYDuplicados(datos);

    if (erroresRelaciones.length > 0) {
      return responderValidacion(res, erroresRelaciones);
    }

    const psicologo = await psicologoModelo.crear(datos);

    return res.status(201).json({
      exito: true,
      mensaje: 'Psicólogo registrado correctamente.',
      datos: psicologo
    });
  } catch (error) {
    return responderError(res, 'Error al registrar el psicólogo.', error);
  }
};

/**
 * Actualiza un psicólogo.
 * PUT /api/psicologos/:id
 */
const actualizarPsicologo = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del psicólogo debe ser un número entero positivo.'
      ]);
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const idPsicologo = Number(req.params.id);
    const psicologoExistente = await psicologoModelo.obtenerPorId(idPsicologo);

    if (!psicologoExistente) {
      return responderNoEncontrado(res, 'Psicólogo no encontrado.');
    }

    const { errores, datos } = validarDatosPsicologo(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const erroresRelaciones = await validarRelacionesYDuplicados(datos, idPsicologo);

    if (erroresRelaciones.length > 0) {
      return responderValidacion(res, erroresRelaciones);
    }

    await psicologoModelo.actualizar(idPsicologo, datos);
    const psicologoActualizado = await psicologoModelo.obtenerPorId(idPsicologo);

    return res.status(200).json({
      exito: true,
      mensaje: 'Psicólogo actualizado correctamente.',
      datos: psicologoActualizado
    });
  } catch (error) {
    return responderError(res, 'Error al actualizar el psicólogo.', error);
  }
};

/**
 * Elimina un psicólogo.
 * DELETE /api/psicologos/:id
 */
const eliminarPsicologo = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del psicólogo debe ser un número entero positivo.'
      ]);
    }

    const idPsicologo = Number(req.params.id);
    const psicologo = await psicologoModelo.obtenerPorId(idPsicologo);

    if (!psicologo) {
      return responderNoEncontrado(res, 'Psicólogo no encontrado.');
    }

    await psicologoModelo.eliminar(idPsicologo);

    return res.status(200).json({
      exito: true,
      mensaje: 'Psicólogo eliminado correctamente.'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se puede eliminar el psicólogo porque tiene citas asociadas.'
      });
    }

    return responderError(res, 'Error al eliminar el psicólogo.', error);
  }
};

module.exports = {
  listarPsicologos,
  obtenerPsicologo,
  crearPsicologo,
  actualizarPsicologo,
  eliminarPsicologo
};
