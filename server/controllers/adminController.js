const User = require('../models/User');
const Order = require('../models/Order');
const Fine = require('../models/Fine');
const Zone = require('../models/Zone');
const Establishment = require('../models/Establishment');
const Promotion = require('../models/Promotion');
const Notification = require('../models/Notification');

// Get all repartidores
exports.getRepartidores = async (req, res) => {
  try {
    const repartidores = await User.find({ role: 'repartidor' })
      .select('-password')
      .populate('fines')
      .sort({ createdAt: -1 });

    res.json({ repartidores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update repartidor settings
exports.updateRepartidor = async (req, res) => {
  try {
    const { repartidorId } = req.params;
    const { percentage, schedule, isDisabledByAdmin, unavailableCount } = req.body;

    const updates = {};
    if (percentage !== undefined) updates.percentage = percentage;
    if (schedule) updates.schedule = schedule;
    if (isDisabledByAdmin !== undefined) updates.isDisabledByAdmin = isDisabledByAdmin;
    if (unavailableCount !== undefined) updates.unavailableCount = unavailableCount;

    const repartidor = await User.findByIdAndUpdate(
      repartidorId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!repartidor) {
      return res.status(404).json({ error: 'Repartidor not found' });
    }

    // Notify repartidor of changes
    if (percentage !== undefined || schedule || isDisabledByAdmin !== undefined) {
      let message = 'Your account settings have been updated by administrator.';
      if (percentage !== undefined) message += ` New percentage: ${percentage}%.`;
      if (isDisabledByAdmin === true) message = 'Your account has been disabled by administrator.';
      if (isDisabledByAdmin === false) message = 'Your account has been re-enabled by administrator.';

      await Notification.create({
        user: repartidorId,
        type: 'message',
        title: 'Account Settings Updated',
        message
      });
    }

    res.json({ 
      message: 'Repartidor updated successfully', 
      repartidor 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create fine
exports.createFine = async (req, res) => {
  try {
    const { repartidorId, type, amount, description, orderId } = req.body;

    const repartidor = await User.findById(repartidorId);
    if (!repartidor || repartidor.role !== 'repartidor') {
      return res.status(404).json({ error: 'Repartidor not found' });
    }

    const fine = new Fine({
      repartidor: repartidorId,
      type,
      amount,
      description,
      order: orderId,
      createdBy: req.user._id
    });

    await fine.save();

    // Update repartidor's total fines
    repartidor.fines.push(fine._id);
    repartidor.totalFines += amount;
    await repartidor.save();

    // Notify repartidor
    await Notification.create({
      user: repartidorId,
      type: 'fine_added',
      title: 'Fine Added',
      message: `A fine of $${amount} has been added to your account. Reason: ${description}`,
      fine: fine._id
    });

    res.status(201).json({ 
      message: 'Fine created successfully', 
      fine 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all fines
exports.getAllFines = async (req, res) => {
  try {
    const { repartidorId, status } = req.query;
    const filter = {};

    if (repartidorId) filter.repartidor = repartidorId;
    if (status) filter.status = status;

    const fines = await Fine.find(filter)
      .populate('repartidor', 'name email')
      .populate('order', 'orderNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ fines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update fine status
exports.updateFine = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { status } = req.body;

    const fine = await Fine.findByIdAndUpdate(
      fineId,
      { 
        status,
        paidAt: status === 'paid' ? new Date() : undefined
      },
      { new: true }
    );

    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    res.json({ 
      message: 'Fine updated successfully', 
      fine 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    const { period, repartidorId } = req.query; // 'daily', 'weekly', 'monthly'
    
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
        startDate = new Date(0);
    }

    const filter = {
      status: 'delivered',
      deliveredAt: { $gte: startDate }
    };

    if (repartidorId) {
      filter.repartidor = repartidorId;
    }

    const orders = await Order.find(filter)
      .populate('repartidor', 'name percentage');

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalDeliveryFees = orders.reduce((sum, o) => sum + o.deliveryFee, 0);
    const totalRepartidorEarnings = orders.reduce((sum, o) => sum + o.repartidorEarning, 0);

    // Group by repartidor
    const byRepartidor = {};
    orders.forEach(order => {
      if (order.repartidor) {
        const id = order.repartidor._id.toString();
        if (!byRepartidor[id]) {
          byRepartidor[id] = {
            repartidor: order.repartidor.name,
            orders: 0,
            earnings: 0,
            percentage: order.repartidor.percentage
          };
        }
        byRepartidor[id].orders += 1;
        byRepartidor[id].earnings += order.repartidorEarning;
      }
    });

    res.json({
      period: period || 'all_time',
      summary: {
        totalOrders,
        totalRevenue,
        totalDeliveryFees,
        totalRepartidorEarnings,
        companyProfit: totalDeliveryFees - totalRepartidorEarnings
      },
      byRepartidor: Object.values(byRepartidor)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Zone management
exports.createZone = async (req, res) => {
  try {
    const zone = new Zone(req.body);
    await zone.save();
    res.status(201).json({ message: 'Zone created successfully', zone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find().sort({ name: 1 });
    res.json({ zones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateZone = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const zone = await Zone.findByIdAndUpdate(zoneId, req.body, { new: true, runValidators: true });
    
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    res.json({ message: 'Zone updated successfully', zone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteZone = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const zone = await Zone.findByIdAndDelete(zoneId);
    
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Establishment management
exports.createEstablishment = async (req, res) => {
  try {
    const establishment = new Establishment(req.body);
    await establishment.save();
    res.status(201).json({ message: 'Establishment created successfully', establishment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEstablishments = async (req, res) => {
  try {
    const establishments = await Establishment.find()
      .populate('zone', 'name')
      .sort({ name: 1 });
    res.json({ establishments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEstablishment = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const establishment = await Establishment.findByIdAndUpdate(
      establishmentId, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }

    res.json({ message: 'Establishment updated successfully', establishment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEstablishment = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const establishment = await Establishment.findByIdAndDelete(establishmentId);
    
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }

    res.json({ message: 'Establishment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Promotion management
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json({ message: 'Promotion created successfully', promotion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('establishment', 'name')
      .populate('zone', 'name')
      .sort({ createdAt: -1 });
    res.json({ promotions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const promotion = await Promotion.findByIdAndUpdate(
      promotionId, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ message: 'Promotion updated successfully', promotion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const promotion = await Promotion.findByIdAndDelete(promotionId);
    
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
