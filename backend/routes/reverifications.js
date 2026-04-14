const express = require('express');
const router = express.Router();
const {
  createReverification,
  getMyRequests,
  getReceivedRequests,
  getItemReverifications,
  respondToReverification,
} = require('../controllers/reverificationController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReverification);
router.get('/my-requests', protect, getMyRequests);
router.get('/received', protect, getReceivedRequests);
router.get('/item/:itemId', protect, getItemReverifications);
router.patch('/:id/respond', protect, respondToReverification);

module.exports = router;
