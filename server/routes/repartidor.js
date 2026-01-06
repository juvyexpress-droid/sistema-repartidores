const express = require('express');
const router = express.Router();
const repartidorController = require('../controllers/repartidorController');
const { auth, isRepartidor } = require('../middleware/auth');

router.post('/availability', auth, isRepartidor, repartidorController.toggleAvailability);
router.get('/earnings', auth, isRepartidor, repartidorController.getEarnings);
router.get('/fines', auth, isRepartidor, repartidorController.getFines);
router.get('/available', auth, repartidorController.getAvailableRepartidores);

module.exports = router;
