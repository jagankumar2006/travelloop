const express = require('express');
const router = express.Router();
const { getBudget, updateBudget } = require('../controllers/budgetController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/:tripId', getBudget);
router.put('/:tripId', updateBudget);

module.exports = router;
