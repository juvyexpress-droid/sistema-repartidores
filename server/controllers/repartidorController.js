const User = require('../models/User');
const Order = require('../models/Order');
const Fine = require('../models/Fine');
const Notification = require('../models/Notification');

// Toggle availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const repartidor = await User.findById(req.user._id);

    if (!repartidor.schedule || !repartidor.schedule.startTime || !repartidor.schedule.endTime) {
      return res.status(400).json({ 
        error: 'Schedule not set. Please contact administrator to set your schedule.' 
      });
    }

    // Check if current time is within schedule
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][now.getDay()];

    const isWithinSchedule = 
      repartidor.schedule.days.includes(currentDay) &&
      currentTime >= repartidor.schedule.startTime &&
      currentTime <= repartidor.schedule.endTime;

    if (isAvailable && !isWithinSchedule) {
      return res.status(400).json({ 
        error: 'Cannot set availability outside your assigned schedule',
        schedule: repartidor.schedule
      });
    }

    // Track unavailability count
    if (!isAvailable) {
      repartidor.unavailableCount += 1;
      
      // Warn after 3 times, disable after 5
      if (repartidor.unavailableCount >= 5) {
        repartidor.isDisabledByAdmin = true;
        
        // Notify admin
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await Notification.create({
            user: admin._id,
            type: 'availability_warning',
            title: 'Repartidor Auto-disabled',
            message: `${repartidor.name} has been automatically disabled due to repeated unavailability (${repartidor.unavailableCount} times)`
          });
        }
        
        return res.status(403).json({ 
          error: 'Your account has been disabled due to repeated unavailability. Please contact administrator.' 
        });
      } else if (repartidor.unavailableCount === 3) {
        // Send warning notification
        await Notification.create({
          user: repartidor._id,
          type: 'availability_warning',
          title: 'Availability Warning',
          message: 'You have marked yourself unavailable 3 times. After 5 times, your account will be disabled.'
        });
      }
    }

    repartidor.isAvailable = isAvailable;
    await repartidor.save();

    res.json({ 
      message: `Availability set to ${isAvailable ? 'available' : 'unavailable'}`,
      isAvailable: repartidor.isAvailable,
      unavailableCount: repartidor.unavailableCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get repartidor earnings
exports.getEarnings = async (req, res) => {
  try {
    const { period } = req.query; // 'daily', 'weekly', 'monthly'
    
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - dayOfWeek));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const orders = await Order.find({
      repartidor: req.user._id,
      status: 'delivered',
      deliveredAt: { $gte: startDate }
    });

    const totalEarnings = orders.reduce((sum, order) => sum + order.repartidorEarning, 0);
    const totalOrders = orders.length;

    res.json({
      period: period || 'all_time',
      totalEarnings,
      totalOrders,
      averageEarning: totalOrders > 0 ? totalEarnings / totalOrders : 0,
      percentage: req.user.percentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get repartidor fines
exports.getFines = async (req, res) => {
  try {
    const fines = await Fine.find({ repartidor: req.user._id })
      .populate('order', 'orderNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
    const pendingFines = fines.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);

    res.json({
      fines,
      totalFines,
      pendingFines,
      paidFines: totalFines - pendingFines
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available repartidores
exports.getAvailableRepartidores = async (req, res) => {
  try {
    const repartidores = await User.find({
      role: 'repartidor',
      isAvailable: true,
      isDisabledByAdmin: false
    }).select('name email phoneNumber totalDeliveries rating percentage');

    res.json({ repartidores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
