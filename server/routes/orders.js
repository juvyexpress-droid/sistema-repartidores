const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, isAdmin, isRepartidor } = require('../middleware/auth');

router.post('/', auth, isAdmin, orderController.createOrder);
router.post('/assign', auth, isAdmin, orderController.assignOrder);
router.post('/:orderId/accept', auth, isRepartidor, orderController.acceptOrder);
router.post('/:orderId/reject', auth, isRepartidor, orderController.rejectOrder);
router.post('/:orderId/in-transit', auth, isRepartidor, orderController.markInTransit);
router.post('/:orderId/deliver', auth, isRepartidor, orderController.deliverOrder);
router.get('/', auth, orderController.getOrders);
router.get('/history', auth, isRepartidor, orderController.getOrderHistory);
router.get('/:orderId', auth, orderController.getOrderById);

module.exports = router;
