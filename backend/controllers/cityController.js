const db = require('../config/db');

const getCities = async (req, res) => {
  try {
    const { search, country, region, limit = 20 } = req.query;
    let query = 'SELECT * FROM cities WHERE 1=1';
    const params = [];
    if (search) { query += ' AND (name LIKE ? OR country LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (country) { query += ' AND country = ?'; params.push(country); }
    if (region) { query += ' AND region = ?'; params.push(region); }
    query += ' ORDER BY popularity DESC LIMIT ?';
    params.push(parseInt(limit));
    const [cities] = await db.query(query, params);
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCityById = async (req, res) => {
  try {
    const [cities] = await db.query('SELECT * FROM cities WHERE id = ?', [req.params.id]);
    if (cities.length === 0) return res.status(404).json({ error: 'City not found' });
    const [activities] = await db.query('SELECT * FROM activities WHERE city_id = ?', [req.params.id]);
    res.json({ ...cities[0], activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const saveDestination = async (req, res) => {
  try {
    const { city_id } = req.body;
    const [existing] = await db.query('SELECT id FROM saved_destinations WHERE user_id = ? AND city_id = ?', [req.user.id, city_id]);
    if (existing.length > 0) return res.status(409).json({ error: 'Already saved' });
    await db.query('INSERT INTO saved_destinations (user_id, city_id) VALUES (?, ?)', [req.user.id, city_id]);
    res.status(201).json({ message: 'Destination saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSavedDestinations = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, sd.saved_at FROM saved_destinations sd
      JOIN cities c ON c.id = sd.city_id WHERE sd.user_id = ?
      ORDER BY sd.saved_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unsaveDestination = async (req, res) => {
  try {
    await db.query('DELETE FROM saved_destinations WHERE user_id = ? AND city_id = ?', [req.user.id, req.params.cityId]);
    res.json({ message: 'Destination removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCities, getCityById, saveDestination, getSavedDestinations, unsaveDestination };
