const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);
router.get('/stats', getAdminStats);

module.exports = router;
