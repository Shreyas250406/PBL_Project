const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['phone', 'wallet', 'bag', 'id_card', 'laptop', 'keys', 'books', 'clothing', 'electronics', 'other'],
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  contactInfo: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'claimed', 'resolved', 'expired'],
    default: 'active',
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  claimedAt: {
    type: Date,
    default: null,
  },
  autoDeleteAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Text index for search
itemSchema.index({ name: 'text', description: 'text', location: 'text' });
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Item', itemSchema);
