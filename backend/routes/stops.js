const express = require('express');
const router = express.Router();
const { addStop, updateStop, deleteStop, reorderStops } = require('../controllers/stopController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.post('/', addStop);
router.put('/reorder', reorderStops);
router.put('/:id', updateStop);
router.delete('/:id', deleteStop);

module.exports = router;
