const mongoose = require('mongoose');

const reverificationSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: [true, 'Please explain why you believe this item is yours'],
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved_in_favor', 'resolved_against'],
    default: 'pending',
  },
  responseMessage: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Prevent duplicate re-verification requests from the same user for the same item
reverificationSchema.index({ itemId: 1, requestedBy: 1 }, { unique: true });
reverificationSchema.index({ claimedBy: 1, status: 1 });

module.exports = mongoose.model('Reverification', reverificationSchema);
