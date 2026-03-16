const express = require('express');
const router = express.Router();
const { createClaim, getClaims, getMyClaims, updateClaimStatus } = require('../controllers/claimController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createClaim);
router.get('/', protect, adminOnly, getClaims);
router.get('/my', protect, getMyClaims);
router.patch('/:id', protect, adminOnly, updateClaimStatus);

module.exports = router;
