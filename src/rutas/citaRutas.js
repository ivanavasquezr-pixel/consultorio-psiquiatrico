/**
 * Rutas REST para la gestión de citas.
 * Prefijo registrado en el servidor: /api/citas
 */

const express = require('express');
const {
  listarCitas,
  obtenerCita,
  listarCitasPorPaciente,
  listarCitasPorPsicologo,
  crearCita,
  actualizarCita,
  eliminarCita
} = require('../controladores/citaControlador');

const enrutador = express.Router();

// Rutas específicas (deben declararse antes de /:id).
enrutador.get('/paciente/:idPaciente', listarCitasPorPaciente);
enrutador.get('/psicologo/:idPsicologo', listarCitasPorPsicologo);

enrutador.get('/', listarCitas);
enrutador.get('/:id', obtenerCita);
enrutador.post('/', crearCita);
enrutador.put('/:id', actualizarCita);
enrutador.delete('/:id', eliminarCita);

module.exports = enrutador;
