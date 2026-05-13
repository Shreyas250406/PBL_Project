const express = require('express');
const router = express.Router();
const { getStats, getAllItems, deleteItem, getUsers, getAllMatches, updateItemStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/items', getAllItems);
router.delete('/items/:id', deleteItem);
router.patch('/items/:id/status', updateItemStatus);
router.get('/users', getUsers);
router.get('/matches', getAllMatches);

module.exports = router;
