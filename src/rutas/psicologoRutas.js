/**
 * Rutas REST para la gestión de psicólogos.
 * Prefijo registrado en el servidor: /api/psicologos
 */

const express = require('express');
const {
  listarPsicologos,
  obtenerPsicologo,
  crearPsicologo,
  actualizarPsicologo,
  eliminarPsicologo
} = require('../controladores/psicologoControlador');

const enrutador = express.Router();

enrutador.get('/', listarPsicologos);
enrutador.get('/:id', obtenerPsicologo);
enrutador.post('/', crearPsicologo);
enrutador.put('/:id', actualizarPsicologo);
enrutador.delete('/:id', eliminarPsicologo);

module.exports = enrutador;
