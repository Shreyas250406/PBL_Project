const express = require('express');
const router = express.Router();
const { getMatchesForItem, getMyMatches, updateMatchStatus } = require('../controllers/matchController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getMyMatches);
router.get('/:itemId', protect, getMatchesForItem);
router.patch('/:id', protect, adminOnly, updateMatchStatus);

module.exports = router;
