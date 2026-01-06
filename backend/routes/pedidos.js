const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Rutas públicas (para webhook de n8n)
router.post('/webhook', pedidoController.create);

// Rutas protegidas
router.get('/', authMiddleware, pedidoController.getAll);
router.get('/estadisticas', authMiddleware, isAdmin, pedidoController.getEstadisticas);
router.get('/:id', authMiddleware, pedidoController.getById);
router.post('/', authMiddleware, pedidoController.create);
router.put('/:id/estado', authMiddleware, pedidoController.updateEstado);
router.put('/:id', authMiddleware, isAdmin, pedidoController.update);
router.delete('/:id', authMiddleware, isAdmin, pedidoController.delete);

module.exports = router;
