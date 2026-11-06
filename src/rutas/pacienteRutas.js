/**
 * Rutas REST para la gestión de pacientes.
 * Prefijo registrado en el servidor: /api/pacientes
 */

const express = require('express');
const {
  listarPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} = require('../controladores/pacienteControlador');

const enrutador = express.Router();

enrutador.get('/', listarPacientes);
enrutador.get('/:id', obtenerPaciente);
enrutador.post('/', crearPaciente);
enrutador.put('/:id', actualizarPaciente);
enrutador.delete('/:id', eliminarPaciente);

module.exports = enrutador;
