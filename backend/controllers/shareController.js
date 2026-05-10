const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const shareTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const [tripCheck] = await db.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [tripId, req.user.id]);
    if (tripCheck.length === 0) return res.status(403).json({ error: 'Access denied' });

    const [existing] = await db.query('SELECT public_token FROM shared_itineraries WHERE trip_id = ?', [tripId]);
    if (existing.length > 0) {
      return res.json({
        message: 'Share link already exists',
        public_token: existing[0].public_token,
        share_url: `/share/${existing[0].public_token}`
      });
    }

    const token = uuidv4();
    await db.query('INSERT INTO shared_itineraries (trip_id, public_token) VALUES (?, ?)', [tripId, token]);
    await db.query('UPDATE trips SET is_public = 1 WHERE id = ?', [tripId]);
    res.status(201).json({
      message: 'Trip shared successfully',
      public_token: token,
      share_url: `/share/${token}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSharedTrip = async (req, res) => {
  try {
    const { token } = req.params;
    const [shared] = await db.query('SELECT * FROM shared_itineraries WHERE public_token = ?', [token]);
    if (shared.length === 0) return res.status(404).json({ error: 'Shared itinerary not found' });

    const tripId = shared[0].trip_id;
    const [trips] = await db.query(`
      SELECT t.*, u.name AS author_name FROM trips t
      JOIN users u ON u.id = t.user_id WHERE t.id = ?
    `, [tripId]);
    if (trips.length === 0) return res.status(404).json({ error: 'Trip not found' });
    const trip = trips[0];

    const [stops] = await db.query(`
      SELECT ts.*, c.name AS city_name, c.country, c.cost_index, c.image_url AS city_image
      FROM trip_stops ts JOIN cities c ON c.id = ts.city_id
      WHERE ts.trip_id = ? ORDER BY ts.order_index
    `, [tripId]);

    for (const stop of stops) {
      const [activities] = await db.query(`
        SELECT ta.*, a.name, a.category, a.description, a.duration_hrs, a.estimated_cost AS base_cost, a.image_url
        FROM trip_activities ta JOIN activities a ON a.id = ta.activity_id
        WHERE ta.stop_id = ? ORDER BY ta.scheduled_date
      `, [stop.id]);
      stop.activities = activities;
    }

    const [budget] = await db.query('SELECT * FROM budgets WHERE trip_id = ?', [tripId]);
    res.json({ ...trip, stops, budget: budget[0] || {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unshareTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    await db.query('DELETE FROM shared_itineraries WHERE trip_id = ?', [tripId]);
    await db.query('UPDATE trips SET is_public = 0 WHERE id = ? AND user_id = ?', [tripId, req.user.id]);
    res.json({ message: 'Trip sharing disabled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { shareTrip, getSharedTrip, unshareTrip };
