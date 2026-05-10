const express = require('express');
const router = express.Router();
const { getActivities, createActivity, addActivityToStop, removeActivityFromStop } = require('../controllers/activityController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getActivities);
router.post('/', authMiddleware, adminMiddleware, (req, res, next) => { req.uploadType = 'misc'; next(); }, upload.single('image'), createActivity);
router.post('/assign', authMiddleware, addActivityToStop);
router.delete('/assign/:id', authMiddleware, removeActivityFromStop);

module.exports = router;
