const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'repartidor'],
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  // Specific fields for Repartidor
  isAvailable: {
    type: Boolean,
    default: false
  },
  schedule: {
    startTime: String, // e.g., "09:00"
    endTime: String,   // e.g., "18:00"
    days: [String]     // e.g., ["lunes", "martes", ...]
  },
  percentage: {
    type: Number,
    default: 70, // Percentage of delivery fee the repartidor receives
    min: 0,
    max: 100
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  fines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fine'
  }],
  totalFines: {
    type: Number,
    default: 0
  },
  isDisabledByAdmin: {
    type: Boolean,
    default: false
  },
  unavailableCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
