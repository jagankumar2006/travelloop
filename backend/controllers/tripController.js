const db = require('../config/db');

const createTrip = async (req, res) => {
  try {
    const { name, description, start_date, end_date } = req.body;
    if (!name || !start_date || !end_date)
      return res.status(400).json({ error: 'Name, start_date and end_date are required' });
    if (new Date(start_date) > new Date(end_date))
      return res.status(400).json({ error: 'Start date must be before end date' });
    const coverPhoto = req.file ? `/uploads/covers/${req.file.filename}` : null;
    const [result] = await db.query(
      'INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, name, description || '', start_date, end_date, coverPhoto]
    );
    // Create default budget entry
    await db.query('INSERT INTO budgets (trip_id, total_budget) VALUES (?, ?)', [result.insertId, 0]);
    const [trip] = await db.query('SELECT * FROM trips WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Trip created', trip: trip[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTrips = async (req, res) => {
  try {
    const { search, sort = 'created_at' } = req.query;
    let query = `
      SELECT t.*,
        (SELECT COUNT(*) FROM trip_stops ts WHERE ts.trip_id = t.id) AS stop_count,
        b.total_budget,
        (SELECT name FROM cities c JOIN trip_stops ts ON ts.city_id = c.id WHERE ts.trip_id = t.id ORDER BY ts.order_index LIMIT 1) AS first_city
      FROM trips t
      LEFT JOIN budgets b ON b.trip_id = t.id
      WHERE t.user_id = ?
    `;
    const params = [req.user.id];
    if (search) { query += ' AND t.name LIKE ?'; params.push(`%${search}%`); }
    query += ` ORDER BY t.${['created_at','start_date','name'].includes(sort) ? sort : 'created_at'} DESC`;
    const [trips] = await db.query(query, params);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const [trips] = await db.query('SELECT * FROM trips WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (trips.length === 0) return res.status(404).json({ error: 'Trip not found' });
    const trip = trips[0];

    const [stops] = await db.query(`
      SELECT ts.*, c.name AS city_name, c.country, c.cost_index, c.image_url AS city_image
      FROM trip_stops ts
      JOIN cities c ON c.id = ts.city_id
      WHERE ts.trip_id = ?
      ORDER BY ts.order_index
    `, [trip.id]);

    for (const stop of stops) {
      const [activities] = await db.query(`
        SELECT ta.*, a.name, a.category, a.description, a.duration_hrs, a.estimated_cost AS base_cost, a.image_url
        FROM trip_activities ta
        JOIN activities a ON a.id = ta.activity_id
        WHERE ta.stop_id = ?
        ORDER BY ta.scheduled_date
      `, [stop.id]);
      stop.activities = activities;
    }

    const [budget] = await db.query('SELECT * FROM budgets WHERE trip_id = ?', [trip.id]);
    const [notes] = await db.query('SELECT * FROM notes WHERE trip_id = ? ORDER BY created_at DESC', [trip.id]);
    const [packing] = await db.query('SELECT * FROM packing_items WHERE trip_id = ?', [trip.id]);

    res.json({ ...trip, stops, budget: budget[0] || {}, notes, packing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTrip = async (req, res) => {
  try {
    const { name, description, start_date, end_date, is_public } = req.body;
    const coverPhoto = req.file ? `/uploads/covers/${req.file.filename}` : undefined;
    const [existing] = await db.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Trip not found' });

    const fields = []; const vals = [];
    if (name) { fields.push('name = ?'); vals.push(name); }
    if (description !== undefined) { fields.push('description = ?'); vals.push(description); }
    if (start_date) { fields.push('start_date = ?'); vals.push(start_date); }
    if (end_date) { fields.push('end_date = ?'); vals.push(end_date); }
    if (is_public !== undefined) { fields.push('is_public = ?'); vals.push(is_public ? 1 : 0); }
    if (coverPhoto) { fields.push('cover_photo = ?'); vals.push(coverPhoto); }
    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(req.params.id);
    await db.query(`UPDATE trips SET ${fields.join(', ')} WHERE id = ?`, vals);
    const [trip] = await db.query('SELECT * FROM trips WHERE id = ?', [req.params.id]);
    res.json({ message: 'Trip updated', trip: trip[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Trip not found' });
    await db.query('DELETE FROM trips WHERE id = ?', [req.params.id]);
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
