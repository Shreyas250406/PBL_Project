const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  lostItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  foundItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  breakdown: {
    nameScore: { type: Number, default: 0 },
    categoryScore: { type: Number, default: 0 },
    colorScore: { type: Number, default: 0 },
    descriptionScore: { type: Number, default: 0 },
    locationScore: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });
matchSchema.index({ matchScore: -1 });

module.exports = mongoose.model('Match', matchSchema);
