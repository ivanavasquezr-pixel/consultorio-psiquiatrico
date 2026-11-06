/**
 * Controlador de pacientes: validación de datos y respuestas HTTP.
 */

const pacienteModelo = require('../modelos/pacienteModelo');
const {
  esEnteroPositivo,
  limpiarTexto,
  textoOpcional,
  esCorreoValido,
  esFechaValida,
  esFechaPosteriorAHoy,
  esTelefonoValido
} = require('../utilidades/validaciones');
const {
  responderValidacion,
  responderNoEncontrado,
  responderError
} = require('../utilidades/respuestas');

const SEXOS_PERMITIDOS = ['Masculino', 'Femenino', 'Otro'];

/**
 * Valida y normaliza los datos recibidos para un paciente.
 * @param {object} cuerpo Cuerpo de la solicitud.
 * @returns {{errores: string[], datos: object}} Resultado de la validación.
 */
const validarDatosPaciente = (cuerpo = {}) => {
  const errores = [];
  const datos = {
    nombre: limpiarTexto(cuerpo.nombre),
    apellido: limpiarTexto(cuerpo.apellido),
    fecha_nacimiento: limpiarTexto(cuerpo.fecha_nacimiento),
    sexo: limpiarTexto(cuerpo.sexo),
    telefono: textoOpcional(cuerpo.telefono),
    correo: textoOpcional(cuerpo.correo),
    direccion: textoOpcional(cuerpo.direccion),
    antecedentes: textoOpcional(cuerpo.antecedentes)
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

  if (!esFechaValida(datos.fecha_nacimiento)) {
    errores.push(
      'La fecha de nacimiento es obligatoria y debe tener un formato válido AAAA-MM-DD.'
    );
  } else if (esFechaPosteriorAHoy(datos.fecha_nacimiento)) {
    errores.push('La fecha de nacimiento no puede ser posterior a la fecha actual.');
  }

  if (!SEXOS_PERMITIDOS.includes(datos.sexo)) {
    errores.push(`El sexo debe ser uno de: ${SEXOS_PERMITIDOS.join(', ')}.`);
  }

  if (datos.telefono && !esTelefonoValido(datos.telefono)) {
    errores.push(
      'El teléfono debe contener entre 7 y 20 caracteres numéricos o los símbolos +, -, ( ) y espacios.'
    );
  }

  if (datos.correo) {
    if (datos.correo.length > 120) {
      errores.push('El correo electrónico no puede superar los 120 caracteres.');
    } else if (!esCorreoValido(datos.correo)) {
      errores.push('El correo electrónico no tiene un formato válido.');
    }
  }

  if (datos.direccion && datos.direccion.length > 255) {
    errores.push('La dirección no puede superar los 255 caracteres.');
  }

  return { errores, datos };
};

/**
 * Lista todos los pacientes.
 * GET /api/pacientes
 */
const listarPacientes = async (req, res) => {
  try {
    const pacientes = await pacienteModelo.listarTodos();

    return res.status(200).json({
      exito: true,
      mensaje: 'Pacientes obtenidos correctamente.',
      total: pacientes.length,
      datos: pacientes
    });
  } catch (error) {
    return responderError(res, 'Error al obtener los pacientes.', error);
  }
};

/**
 * Obtiene un paciente por su identificador.
 * GET /api/pacientes/:id
 */
const obtenerPaciente = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del paciente debe ser un número entero positivo.'
      ]);
    }

    const paciente = await pacienteModelo.obtenerPorId(Number(req.params.id));

    if (!paciente) {
      return responderNoEncontrado(res, 'Paciente no encontrado.');
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Paciente encontrado.',
      datos: paciente
    });
  } catch (error) {
    return responderError(res, 'Error al obtener el paciente.', error);
  }
};

/**
 * Crea un paciente.
 * POST /api/pacientes
 */
const crearPaciente = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const { errores, datos } = validarDatosPaciente(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const paciente = await pacienteModelo.crear(datos);

    return res.status(201).json({
      exito: true,
      mensaje: 'Paciente registrado correctamente.',
      datos: paciente
    });
  } catch (error) {
    return responderError(res, 'Error al registrar el paciente.', error);
  }
};

/**
 * Actualiza un paciente.
 * PUT /api/pacientes/:id
 */
const actualizarPaciente = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del paciente debe ser un número entero positivo.'
      ]);
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const idPaciente = Number(req.params.id);
    const pacienteExistente = await pacienteModelo.obtenerPorId(idPaciente);

    if (!pacienteExistente) {
      return responderNoEncontrado(res, 'Paciente no encontrado.');
    }

    const { errores, datos } = validarDatosPaciente(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    await pacienteModelo.actualizar(idPaciente, datos);
    const pacienteActualizado = await pacienteModelo.obtenerPorId(idPaciente);

    return res.status(200).json({
      exito: true,
      mensaje: 'Paciente actualizado correctamente.',
      datos: pacienteActualizado
    });
  } catch (error) {
    return responderError(res, 'Error al actualizar el paciente.', error);
  }
};

/**
 * Elimina un paciente.
 * DELETE /api/pacientes/:id
 */
const eliminarPaciente = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del paciente debe ser un número entero positivo.'
      ]);
    }

    const idPaciente = Number(req.params.id);
    const paciente = await pacienteModelo.obtenerPorId(idPaciente);

    if (!paciente) {
      return responderNoEncontrado(res, 'Paciente no encontrado.');
    }

    await pacienteModelo.eliminar(idPaciente);

    return res.status(200).json({
      exito: true,
      mensaje: 'Paciente eliminado correctamente.'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        exito: false,
        mensaje:
          'No se puede eliminar el paciente porque tiene citas o registros clínicos asociados.'
      });
    }

    return responderError(res, 'Error al eliminar el paciente.', error);
  }
};

module.exports = {
  listarPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
};
