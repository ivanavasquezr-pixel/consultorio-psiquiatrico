/**
 * Rutas REST para la gestión de consultorios.
 * Prefijo registrado en el servidor: /api/consultorios
 */

const express = require('express');
const {
  listarConsultorios,
  obtenerConsultorio,
  crearConsultorio,
  actualizarConsultorio,
  eliminarConsultorio
} = require('../controladores/consultorioControlador');

const enrutador = express.Router();

enrutador.get('/', listarConsultorios);
enrutador.get('/:id', obtenerConsultorio);
enrutador.post('/', crearConsultorio);
enrutador.put('/:id', actualizarConsultorio);
enrutador.delete('/:id', eliminarConsultorio);

module.exports = enrutador;
