const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Chat messages
router.post('/messages', auth, notificationController.sendMessage);
router.get('/messages', auth, notificationController.getConversation);
router.post('/messages/read', auth, notificationController.markAsRead);

// Notifications
router.get('/notifications', auth, notificationController.getNotifications);
router.put('/notifications/:notificationId/read', auth, notificationController.markNotificationRead);
router.put('/notifications/read-all', auth, notificationController.markAllNotificationsRead);

module.exports = router;
