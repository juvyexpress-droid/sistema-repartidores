const mongoose = require('mongoose');

const establishmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['restaurant', 'pharmacy', 'grocery', 'retail', 'other']
  },
  address: {
    type: String,
    required: true
  },
  phone: String,
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  sector: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  menu: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Establishment', establishmentSchema);
