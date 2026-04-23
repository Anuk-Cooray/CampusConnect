const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    enum: ['Like New', 'Excellent', 'Good', 'Fair'],
    default: 'Good'
  },
  description: {
    type: String,
    required: true
  },
  sellerName: {
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
  tags: [String],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);