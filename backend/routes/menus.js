const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// Rutas públicas (para que ManyChat pueda consultar el menú)
router.get('/', menuController.getAll);
router.get('/categorias', menuController.getCategorias);
router.get('/:id', menuController.getById);

// Rutas protegidas (solo admin)
router.post('/', authMiddleware, isAdmin, menuController.create);
router.put('/:id', authMiddleware, isAdmin, menuController.update);
router.delete('/:id', authMiddleware, isAdmin, menuController.delete);

module.exports = router;
