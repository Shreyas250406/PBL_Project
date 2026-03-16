const Match = require('../models/Match');

// @desc    Get matches for an item
// @route   GET /api/matches/:itemId
exports.getMatchesForItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const matches = await Match.find({
      $or: [{ lostItemId: itemId }, { foundItemId: itemId }],
      matchScore: { $gt: 30 },
    })
      .populate({
        path: 'lostItemId',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .populate({
        path: 'foundItemId',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .sort({ matchScore: -1 });

    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all matches for current user
// @route   GET /api/matches
exports.getMyMatches = async (req, res) => {
  try {
    const Item = require('../models/Item');
    const userItems = await Item.find({ reportedBy: req.user._id }).select('_id');
    const itemIds = userItems.map((i) => i._id);

    const matches = await Match.find({
      $or: [{ lostItemId: { $in: itemIds } }, { foundItemId: { $in: itemIds } }],
      matchScore: { $gt: 30 },
    })
      .populate({
        path: 'lostItemId',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .populate({
        path: 'foundItemId',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .sort({ matchScore: -1 });

    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update match status (admin)
// @route   PATCH /api/matches/:id
exports.updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
