const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true
    },
    sector: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment'
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  repartidor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  repartidorEarning: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'in_transit', 'delivered', 'rejected', 'cancelled'],
    default: 'pending'
  },
  assignmentHistory: [{
    repartidor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    status: String,
    rejectionReason: String
  }],
  acceptedAt: Date,
  deliveredAt: Date,
  rejectedAt: Date,
  estimatedDeliveryTime: Date,
  notes: String,
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
