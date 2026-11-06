/**
 * Rutas REST para la gestión de médicos.
 * Prefijo registrado en el servidor: /api/medicos
 */

const express = require('express');
const {
  listarMedicos,
  obtenerMedico,
  crearMedico,
  actualizarMedico,
  eliminarMedico
} = require('../controladores/medicoControlador');

const enrutador = express.Router();

enrutador.get('/', listarMedicos);
enrutador.get('/:id', obtenerMedico);
enrutador.post('/', crearMedico);
enrutador.put('/:id', actualizarMedico);
enrutador.delete('/:id', eliminarMedico);

module.exports = enrutador;
