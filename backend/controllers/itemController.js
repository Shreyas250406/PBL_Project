const Item = require('../models/Item');
const { runMatching } = require('../utils/matchingAlgorithm');

// @desc    Report a lost item
// @route   POST /api/items/lost
exports.reportLostItem = async (req, res) => {
  try {
    const { name, category, color, description, location, date, contactPhone, contactEmail } = req.body;

    const item = await Item.create({
      type: 'lost',
      name,
      category,
      color,
      description,
      location,
      date,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      contactInfo: { phone: contactPhone || '', email: contactEmail || '' },
      reportedBy: req.user._id,
    });

    // Run matching in background
    const matches = await runMatching(item);

    res.status(201).json({
      success: true,
      item,
      matchesFound: matches.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report a found item
// @route   POST /api/items/found
exports.reportFoundItem = async (req, res) => {
  try {
    const { name, category, color, description, location, date, contactPhone, contactEmail } = req.body;

    const item = await Item.create({
      type: 'found',
      name,
      category,
      color,
      description,
      location,
      date,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      contactInfo: { phone: contactPhone || '', email: contactEmail || '' },
      reportedBy: req.user._id,
    });

    const matches = await runMatching(item);

    res.status(201).json({
      success: true,
      item,
      matchesFound: matches.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all lost items
// @route   GET /api/items/lost
exports.getLostItems = async (req, res) => {
  try {
    const { category, color, search, sort, page = 1, limit = 12 } = req.query;
    const query = { type: 'lost', status: 'active' };

    if (category) query.category = category;
    if (color) query.color = { $regex: color, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all found items
// @route   GET /api/items/found
exports.getFoundItems = async (req, res) => {
  try {
    const { category, color, search, sort, page = 1, limit = 12 } = req.query;
    const query = { type: 'found', status: 'active' };

    if (category) query.category = category;
    if (color) query.color = { $regex: color, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's items
// @route   GET /api/items/my/items
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Only owner or admin can delete
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update item status
// @route   PATCH /api/items/:id/status
exports.updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    item.status = status;
    await item.save();

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
