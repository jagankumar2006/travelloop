const express = require('express');
const router = express.Router();
const { shareTrip, getSharedTrip, unshareTrip } = require('../controllers/shareController');
const { authMiddleware } = require('../middleware/auth');

router.post('/:tripId', authMiddleware, shareTrip);
router.delete('/:tripId', authMiddleware, unshareTrip);
router.get('/view/:token', getSharedTrip);

module.exports = router;
