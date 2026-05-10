const express = require('express');
const router = express.Router();
const { getPackingItems, addPackingItem, updatePackingItem, deletePackingItem, resetPackingList } = require('../controllers/packingController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/:tripId', getPackingItems);
router.post('/', addPackingItem);
router.put('/reset/:tripId', resetPackingList);
router.put('/:id', updatePackingItem);
router.delete('/:id', deletePackingItem);

module.exports = router;
