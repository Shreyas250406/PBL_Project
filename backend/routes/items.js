const express = require('express');
const router = express.Router();
const {
  reportLostItem,
  reportFoundItem,
  getLostItems,
  getFoundItems,
  getItem,
  getMyItems,
  deleteItem,
  updateItemStatus,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/lost', protect, upload.single('image'), reportLostItem);
router.post('/found', protect, upload.single('image'), reportFoundItem);
router.get('/lost', getLostItems);
router.get('/found', getFoundItems);
router.get('/my/items', protect, getMyItems);
router.get('/:id', getItem);
router.delete('/:id', protect, deleteItem);
router.patch('/:id/status', protect, updateItemStatus);

module.exports = router;
