const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_delivery'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  establishment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment'
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: Number,
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Promotion', promotionSchema);
