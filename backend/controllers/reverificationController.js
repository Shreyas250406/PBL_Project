const Reverification = require('../models/Reverification');
const Item = require('../models/Item');

// @desc    Create a re-verification request (Person C disputes Person B's claim)
// @route   POST /api/reverifications
exports.createReverification = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    const item = await Item.findById(itemId).populate('claimedBy', 'name email');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Item must be in "claimed" status to request re-verification
    if (item.status !== 'claimed') {
      return res.status(400).json({ success: false, message: 'This item has not been claimed yet or is already resolved' });
    }

    // Can't re-verify your own claim
    if (item.claimedBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot dispute your own claim' });
    }

    // Can't re-verify if you are the reporter
    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You reported this item, you cannot claim it' });
    }

    const reverification = await Reverification.create({
      itemId,
      requestedBy: req.user._id,
      claimedBy: item.claimedBy._id,
      message,
    });

    // Reset the auto-delete timer since someone disputed the claim
    const newAutoDeleteAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    await Item.findByIdAndUpdate(itemId, { autoDeleteAt: newAutoDeleteAt });

    res.status(201).json({ success: true, reverification });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a re-verification request for this item' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get re-verification requests I've sent (Person C's view)
// @route   GET /api/reverifications/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const reverifications = await Reverification.find({ requestedBy: req.user._id })
      .populate({
        path: 'itemId',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, reverifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get re-verification requests received (Person B's view)
// @route   GET /api/reverifications/received
exports.getReceivedRequests = async (req, res) => {
  try {
    const reverifications = await Reverification.find({ claimedBy: req.user._id })
      .populate({
        path: 'itemId',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, reverifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all re-verification requests for a specific item
// @route   GET /api/reverifications/item/:itemId
exports.getItemReverifications = async (req, res) => {
  try {
    const reverifications = await Reverification.find({ itemId: req.params.itemId })
      .populate('requestedBy', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, reverifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to a re-verification request (Person B responds)
// @route   PATCH /api/reverifications/:id/respond
exports.respondToReverification = async (req, res) => {
  try {
    const { status, responseMessage } = req.body;

    if (!['acknowledged', 'resolved_in_favor', 'resolved_against'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const reverification = await Reverification.findById(req.params.id);
    if (!reverification) {
      return res.status(404).json({ success: false, message: 'Re-verification request not found' });
    }

    // Only the claimer (Person B) can respond
    if (reverification.claimedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the current claimer can respond to this request' });
    }

    reverification.status = status;
    if (responseMessage) reverification.responseMessage = responseMessage;
    await reverification.save();

    const item = await Item.findById(reverification.itemId);

    // If resolved in favor of Person C — transfer the claim
    if (status === 'resolved_in_favor' && item) {
      item.claimedBy = reverification.requestedBy;
      item.claimedAt = new Date();
      item.autoDeleteAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      await item.save();
    }

    res.json({ success: true, reverification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
