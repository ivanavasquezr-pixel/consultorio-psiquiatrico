/**
 * Rutas REST para la gestión del historial clínico.
 * Prefijo registrado en el servidor: /api/historial
 */

const express = require('express');
const {
  listarHistoriales,
  obtenerHistorial,
  obtenerHistorialPorCita,
  crearHistorial,
  actualizarHistorial,
  eliminarHistorial
} = require('../controladores/historialControlador');

const enrutador = express.Router();

// Ruta específica (debe declararse antes de /:id).
enrutador.get('/cita/:idCita', obtenerHistorialPorCita);

enrutador.get('/', listarHistoriales);
enrutador.get('/:id', obtenerHistorial);
enrutador.post('/', crearHistorial);
enrutador.put('/:id', actualizarHistorial);
enrutador.delete('/:id', eliminarHistorial);

module.exports = enrutador;
