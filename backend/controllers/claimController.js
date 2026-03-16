const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

// @desc    Create a claim
// @route   POST /api/claims
exports.createClaim = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({ itemId, claimedBy: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You have already claimed this item' });
    }

    const claim = await Claim.create({
      itemId,
      claimedBy: req.user._id,
      message,
    });

    // Notify the item owner
    await Notification.create({
      userId: item.reportedBy,
      type: 'claim_received',
      title: 'New Claim Received',
      message: `Someone has claimed your ${item.type} item "${item.name}". Check your claims for details.`,
      relatedItemId: item._id,
    });

    res.status(201).json({ success: true, claim });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already claimed this item' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all claims (admin)
// @route   GET /api/claims
exports.getClaims = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const claims = await Claim.find(query)
      .populate('itemId')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get claims for current user
// @route   GET /api/claims/my
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user._id })
      .populate('itemId')
      .sort({ createdAt: -1 });

    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update claim status (admin)
// @route   PATCH /api/claims/:id
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = status;
    if (adminNote) claim.adminNote = adminNote;
    await claim.save();

    // If approved, update item status
    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.itemId, { status: 'claimed' });
    }

    // Notify the claimer
    const notificationType = status === 'approved' ? 'claim_approved' : 'claim_rejected';
    await Notification.create({
      userId: claim.claimedBy,
      type: notificationType,
      title: `Claim ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your claim has been ${status}. ${adminNote || ''}`,
      relatedItemId: claim.itemId,
    });

    res.json({ success: true, claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
