const Item = require('../models/Item');
const User = require('../models/User');
const Match = require('../models/Match');
const Claim = require('../models/Claim');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalLost, totalFound, totalMatches, totalClaims, pendingClaims, totalUsers] =
      await Promise.all([
        Item.countDocuments({ type: 'lost' }),
        Item.countDocuments({ type: 'found' }),
        Match.countDocuments({ matchScore: { $gt: 60 } }),
        Claim.countDocuments(),
        Claim.countDocuments({ status: 'pending' }),
        User.countDocuments(),
      ]);

    const recentItems = await Item.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalLost,
        totalFound,
        totalMatches,
        totalClaims,
        pendingClaims,
        totalUsers,
      },
      recentItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all items (admin)
// @route   GET /api/admin/items
exports.getAllItems = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      items,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete item (admin)
// @route   DELETE /api/admin/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    // Clean up related matches and claims
    await Match.deleteMany({ $or: [{ lostItemId: req.params.id }, { foundItemId: req.params.id }] });
    await Claim.deleteMany({ itemId: req.params.id });

    res.json({ success: true, message: 'Item and related data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const usersWithCounts = await User.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'reportedBy',
          as: 'reports'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          createdAt: 1,
          reportCount: { $size: '$reports' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json({ success: true, users: usersWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update item status (admin)
// @route   PATCH /api/admin/items/:id/status
exports.updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'claimed', 'resolved', 'expired'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all matches (admin)
// @route   GET /api/admin/matches
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find({ matchScore: { $gt: 30 } })
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
