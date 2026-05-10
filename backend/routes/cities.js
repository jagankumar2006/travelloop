const express = require('express');
const router = express.Router();
const { getCities, getCityById, saveDestination, getSavedDestinations, unsaveDestination } = require('../controllers/cityController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', getCities);
router.get('/:id', getCityById);
router.post('/saved', authMiddleware, saveDestination);
router.get('/saved/list', authMiddleware, getSavedDestinations);
router.delete('/saved/:cityId', authMiddleware, unsaveDestination);

module.exports = router;
