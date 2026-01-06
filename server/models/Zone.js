const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  sectors: [{
    name: String,
    baseDeliveryFee: {
      type: Number,
      required: true
    },
    boundaries: {
      type: Object // GeoJSON or coordinate boundaries
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Zone', zoneSchema);
