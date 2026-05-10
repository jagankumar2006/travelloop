const express = require('express');
const router = express.Router();
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip } = require('../controllers/tripController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authMiddleware);
router.get('/', getTrips);
router.post('/', (req, res, next) => { req.uploadType = 'cover'; next(); }, upload.single('cover_photo'), createTrip);
router.get('/:id', getTripById);
router.put('/:id', (req, res, next) => { req.uploadType = 'cover'; next(); }, upload.single('cover_photo'), updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
