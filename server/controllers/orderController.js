const Order = require('../models/Order');
const User = require('../models/User');
const Zone = require('../models/Zone');
const Notification = require('../models/Notification');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Get zone info to calculate delivery fee
    const zone = await Zone.findById(orderData.customer.zone);
    if (!zone) {
      return res.status(400).json({ error: 'Invalid zone' });
    }

    // Find sector in zone
    const sector = zone.sectors.find(s => s.name === orderData.customer.sector);
    const deliveryFee = sector ? sector.baseDeliveryFee : zone.sectors[0].baseDeliveryFee;

    const order = new Order({
      ...orderData,
      deliveryFee,
      total: orderData.subtotal + deliveryFee,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({ 
      message: 'Order created successfully', 
      order 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign order to repartidor
exports.assignOrder = async (req, res) => {
  try {
    const { orderId, repartidorId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const repartidor = await User.findById(repartidorId);
    if (!repartidor || repartidor.role !== 'repartidor') {
      return res.status(400).json({ error: 'Invalid repartidor' });
    }

    if (!repartidor.isAvailable || repartidor.isDisabledByAdmin) {
      return res.status(400).json({ error: 'Repartidor is not available' });
    }

    // Calculate repartidor earning
    const repartidorEarning = (order.deliveryFee * repartidor.percentage) / 100;

    order.repartidor = repartidorId;
    order.status = 'assigned';
    order.repartidorEarning = repartidorEarning;
    order.assignmentHistory.push({
      repartidor: repartidorId,
      assignedAt: new Date(),
      status: 'assigned'
    });

    await order.save();

    // Create notification for repartidor
    await Notification.create({
      user: repartidorId,
      type: 'order_assigned',
      title: 'New Order Assigned',
      message: `Order ${order.orderNumber} has been assigned to you. Delivery fee: $${order.deliveryFee}, Your earning: $${repartidorEarning.toFixed(2)}`,
      order: order._id
    });

    res.json({ 
      message: 'Order assigned successfully', 
      order 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept order (by repartidor)
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.repartidor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }

    if (order.status !== 'assigned') {
      return res.status(400).json({ error: 'Order cannot be accepted' });
    }

    order.status = 'accepted';
    order.acceptedAt = new Date();
    await order.save();

    res.json({ 
      message: 'Order accepted successfully', 
      order 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject order (by repartidor) - requires justification
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ error: 'Rejection reason must be at least 10 characters' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.repartidor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }

    if (order.status !== 'assigned') {
      return res.status(400).json({ error: 'Order cannot be rejected' });
    }

    // Update assignment history
    const lastAssignment = order.assignmentHistory[order.assignmentHistory.length - 1];
    lastAssignment.status = 'rejected';
    lastAssignment.rejectionReason = reason;

    order.status = 'pending'; // Back to pending for reassignment
    order.repartidor = null;
    order.repartidorEarning = 0;
    order.rejectedAt = new Date();
    await order.save();

    // Notify admin about rejection
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'order_rejected',
        title: 'Order Rejected by Repartidor',
        message: `Order ${order.orderNumber} was rejected by ${req.user.name}. Reason: ${reason}`,
        order: order._id
      });
    }

    res.json({ 
      message: 'Order rejected. Admin will reassign it.', 
      order 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark order as in transit
exports.markInTransit = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.repartidor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }

    if (order.status !== 'accepted') {
      return res.status(400).json({ error: 'Order must be accepted first' });
    }

    order.status = 'in_transit';
    await order.save();

    res.json({ 
      message: 'Order marked as in transit', 
      order 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark order as delivered
exports.deliverOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.repartidor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }

    if (order.status !== 'in_transit' && order.status !== 'accepted') {
      return res.status(400).json({ error: 'Invalid order status for delivery' });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Update repartidor statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        totalDeliveries: 1,
        totalEarnings: order.repartidorEarning
      }
    });

    res.json({ 
      message: 'Order delivered successfully', 
      order 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders (with filters)
exports.getOrders = async (req, res) => {
  try {
    const { status, repartidorId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (repartidorId) filter.repartidor = repartidorId;

    // If user is repartidor, only show their orders
    if (req.user.role === 'repartidor') {
      filter.repartidor = req.user._id;
    }

    const orders = await Order.find(filter)
      .populate('repartidor', 'name email phoneNumber')
      .populate('customer.zone', 'name')
      .populate('establishment', 'name')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('repartidor', 'name email phoneNumber percentage')
      .populate('customer.zone', 'name')
      .populate('establishment', 'name address')
      .populate({
        path: 'assignmentHistory.repartidor',
        select: 'name email'
      });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'repartidor' && 
        order.repartidor && 
        order.repartidor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get repartidor's order history
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      repartidor: req.user._id,
      status: { $in: ['delivered', 'rejected'] }
    })
      .populate('customer.zone', 'name')
      .populate('establishment', 'name')
      .sort({ createdAt: -1 });

    const stats = {
      totalDelivered: orders.filter(o => o.status === 'delivered').length,
      totalRejected: orders.filter(o => o.status === 'rejected').length,
      totalEarnings: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.repartidorEarning, 0)
    };

    res.json({ orders, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
