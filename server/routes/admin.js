const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth');

// Repartidor management
router.get('/repartidores', auth, isAdmin, adminController.getRepartidores);
router.put('/repartidores/:repartidorId', auth, isAdmin, adminController.updateRepartidor);

// Fine management
router.post('/fines', auth, isAdmin, adminController.createFine);
router.get('/fines', auth, isAdmin, adminController.getAllFines);
router.put('/fines/:fineId', auth, isAdmin, adminController.updateFine);

// Reports
router.get('/reports', auth, isAdmin, adminController.getReports);

// Zone management
router.post('/zones', auth, isAdmin, adminController.createZone);
router.get('/zones', auth, adminController.getZones);
router.put('/zones/:zoneId', auth, isAdmin, adminController.updateZone);
router.delete('/zones/:zoneId', auth, isAdmin, adminController.deleteZone);

// Establishment management
router.post('/establishments', auth, isAdmin, adminController.createEstablishment);
router.get('/establishments', auth, adminController.getEstablishments);
router.put('/establishments/:establishmentId', auth, isAdmin, adminController.updateEstablishment);
router.delete('/establishments/:establishmentId', auth, isAdmin, adminController.deleteEstablishment);

// Promotion management
router.post('/promotions', auth, isAdmin, adminController.createPromotion);
router.get('/promotions', auth, adminController.getPromotions);
router.put('/promotions/:promotionId', auth, isAdmin, adminController.updatePromotion);
router.delete('/promotions/:promotionId', auth, isAdmin, adminController.deletePromotion);

module.exports = router;
