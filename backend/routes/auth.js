const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile, deleteAccount } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/signup', (req, res, next) => { req.uploadType = 'profile'; next(); }, upload.single('profile_photo'), signup);
router.post('/login', login);
router.post('/logout', (req, res) => res.json({ message: 'Logged out successfully' }));
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, (req, res, next) => { req.uploadType = 'profile'; next(); }, upload.single('profile_photo'), updateProfile);
router.delete('/profile', authMiddleware, deleteAccount);

module.exports = router;
