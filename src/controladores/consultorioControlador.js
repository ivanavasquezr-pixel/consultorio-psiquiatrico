/**
 * Controlador de consultorios: validación de datos y respuestas HTTP.
 */

const consultorioModelo = require('../modelos/consultorioModelo');
const {
  esEnteroPositivo,
  limpiarTexto,
  textoOpcional,
  esTelefonoValido
} = require('../utilidades/validaciones');
const {
  responderValidacion,
  responderNoEncontrado,
  responderError
} = require('../utilidades/respuestas');

const ESTADOS_PERMITIDOS = ['Disponible', 'Ocupado', 'Inactivo'];

/**
 * Valida y normaliza los datos recibidos para un consultorio.
 * @param {object} cuerpo Cuerpo de la solicitud.
 * @returns {{errores: string[], datos: object}} Resultado de la validación.
 */
const validarDatosConsultorio = (cuerpo = {}) => {
  const errores = [];
  const datos = {
    nombre: limpiarTexto(cuerpo.nombre),
    ubicacion: limpiarTexto(cuerpo.ubicacion),
    telefono: textoOpcional(cuerpo.telefono),
    estado: limpiarTexto(cuerpo.estado) || 'Disponible'
  };

  if (!datos.nombre) {
    errores.push('El nombre del consultorio es obligatorio.');
  } else if (datos.nombre.length > 100) {
    errores.push('El nombre del consultorio no puede superar los 100 caracteres.');
  }

  if (!datos.ubicacion) {
    errores.push('La ubicación del consultorio es obligatoria.');
  } else if (datos.ubicacion.length > 255) {
    errores.push('La ubicación no puede superar los 255 caracteres.');
  }

  if (datos.telefono && !esTelefonoValido(datos.telefono)) {
    errores.push(
      'El teléfono debe contener entre 7 y 20 caracteres numéricos o los símbolos +, -, ( ) y espacios.'
    );
  }

  if (!ESTADOS_PERMITIDOS.includes(datos.estado)) {
    errores.push(`El estado debe ser uno de: ${ESTADOS_PERMITIDOS.join(', ')}.`);
  }

  return { errores, datos };
};

/**
 * Lista todos los consultorios.
 * GET /api/consultorios
 */
const listarConsultorios = async (req, res) => {
  try {
    const consultorios = await consultorioModelo.listarTodos();

    return res.status(200).json({
      exito: true,
      mensaje: 'Consultorios obtenidos correctamente.',
      total: consultorios.length,
      datos: consultorios
    });
  } catch (error) {
    return responderError(res, 'Error al obtener los consultorios.', error);
  }
};

/**
 * Obtiene un consultorio por su identificador.
 * GET /api/consultorios/:id
 */
const obtenerConsultorio = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del consultorio debe ser un número entero positivo.'
      ]);
    }

    const consultorio = await consultorioModelo.obtenerPorId(Number(req.params.id));

    if (!consultorio) {
      return responderNoEncontrado(res, 'Consultorio no encontrado.');
    }

    return res.status(200).json({
      exito: true,
      mensaje: 'Consultorio encontrado.',
      datos: consultorio
    });
  } catch (error) {
    return responderError(res, 'Error al obtener el consultorio.', error);
  }
};

/**
 * Crea un consultorio.
 * POST /api/consultorios
 */
const crearConsultorio = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const { errores, datos } = validarDatosConsultorio(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const consultorioExistente = await consultorioModelo.buscarPorNombre(datos.nombre);

    if (consultorioExistente) {
      return responderValidacion(res, [
        'Ya existe un consultorio registrado con ese nombre.'
      ]);
    }

    const consultorio = await consultorioModelo.crear(datos);

    return res.status(201).json({
      exito: true,
      mensaje: 'Consultorio registrado correctamente.',
      datos: consultorio
    });
  } catch (error) {
    return responderError(res, 'Error al registrar el consultorio.', error);
  }
};

/**
 * Actualiza un consultorio.
 * PUT /api/consultorios/:id
 */
const actualizarConsultorio = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del consultorio debe ser un número entero positivo.'
      ]);
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return responderValidacion(res, [
        'El cuerpo de la solicitud debe ser un objeto JSON.'
      ]);
    }

    const idConsultorio = Number(req.params.id);
    const consultorioExistente = await consultorioModelo.obtenerPorId(idConsultorio);

    if (!consultorioExistente) {
      return responderNoEncontrado(res, 'Consultorio no encontrado.');
    }

    const { errores, datos } = validarDatosConsultorio(req.body);

    if (errores.length > 0) {
      return responderValidacion(res, errores);
    }

    const nombreDuplicado = await consultorioModelo.buscarPorNombre(
      datos.nombre,
      idConsultorio
    );

    if (nombreDuplicado) {
      return responderValidacion(res, [
        'Ya existe otro consultorio registrado con ese nombre.'
      ]);
    }

    await consultorioModelo.actualizar(idConsultorio, datos);
    const consultorioActualizado = await consultorioModelo.obtenerPorId(idConsultorio);

    return res.status(200).json({
      exito: true,
      mensaje: 'Consultorio actualizado correctamente.',
      datos: consultorioActualizado
    });
  } catch (error) {
    return responderError(res, 'Error al actualizar el consultorio.', error);
  }
};

/**
 * Elimina un consultorio.
 * DELETE /api/consultorios/:id
 */
const eliminarConsultorio = async (req, res) => {
  try {
    if (!esEnteroPositivo(req.params.id)) {
      return responderValidacion(res, [
        'El identificador del consultorio debe ser un número entero positivo.'
      ]);
    }

    const idConsultorio = Number(req.params.id);
    const consultorio = await consultorioModelo.obtenerPorId(idConsultorio);

    if (!consultorio) {
      return responderNoEncontrado(res, 'Consultorio no encontrado.');
    }

    await consultorioModelo.eliminar(idConsultorio);

    return res.status(200).json({
      exito: true,
      mensaje: 'Consultorio eliminado correctamente.'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        exito: false,
        mensaje:
          'No se puede eliminar el consultorio porque tiene psicólogos o citas asociadas.'
      });
    }

    return responderError(res, 'Error al eliminar el consultorio.', error);
  }
};

module.exports = {
  listarConsultorios,
  obtenerConsultorio,
  crearConsultorio,
  actualizarConsultorio,
  eliminarConsultorio
};
