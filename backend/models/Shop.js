const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: String,
    required: true
  },
  services: [String],
  description: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  nic: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Campus'
  },
  priceRange: {
    type: String,
    default: 'Contact for pricing'
  },
  availability: {
    type: String,
    default: 'Flexible hours'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date,
    default: null
  },
  rating: {
    type: Number,
    default: 5.0
  },
  reviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema);