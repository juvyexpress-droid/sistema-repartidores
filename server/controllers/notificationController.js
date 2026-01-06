const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, orderId, message } = req.body;

    const chatMessage = new ChatMessage({
      sender: req.user._id,
      receiver: receiverId,
      order: orderId,
      message
    });

    await chatMessage.save();

    // Create notification for receiver
    await Notification.create({
      user: receiverId,
      type: 'message',
      title: 'New Message',
      message: `You have a new message from ${req.user.name}`,
      order: orderId
    });

    res.status(201).json({ 
      message: 'Message sent successfully', 
      chatMessage 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversation
exports.getConversation = async (req, res) => {
  try {
    const { userId, orderId } = req.query;

    const filter = {
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    };

    if (orderId) {
      filter.order = orderId;
    }

    const messages = await ChatMessage.find(filter)
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .populate('order', 'orderNumber')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    await ChatMessage.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('order', 'orderNumber')
      .populate('fine', 'amount type')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
