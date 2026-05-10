const db = require('../config/db');

const getActivities = async (req, res) => {
  try {
    const { category, min_cost, max_cost, max_duration, city_id, search } = req.query;
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (min_cost) { query += ' AND estimated_cost >= ?'; params.push(parseFloat(min_cost)); }
    if (max_cost) { query += ' AND estimated_cost <= ?'; params.push(parseFloat(max_cost)); }
    if (max_duration) { query += ' AND duration_hrs <= ?'; params.push(parseFloat(max_duration)); }
    if (city_id) { query += ' AND (city_id = ? OR city_id IS NULL)'; params.push(city_id); }
    if (search) { query += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY name ASC';
    const [activities] = await db.query(query, params);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createActivity = async (req, res) => {
  try {
    const { name, category, description, duration_hrs, estimated_cost, city_id } = req.body;
    const imageUrl = req.file ? `/uploads/misc/${req.file.filename}` : null;
    const [result] = await db.query(
      'INSERT INTO activities (name, category, description, duration_hrs, estimated_cost, city_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, description || '', duration_hrs || 1, estimated_cost || 0, city_id || null, imageUrl]
    );
    const [activity] = await db.query('SELECT * FROM activities WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Activity created', activity: activity[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addActivityToStop = async (req, res) => {
  try {
    const { stop_id, activity_id, scheduled_date, custom_cost, notes } = req.body;
    if (!stop_id || !activity_id) return res.status(400).json({ error: 'stop_id and activity_id required' });
    const [result] = await db.query(
      'INSERT INTO trip_activities (stop_id, activity_id, scheduled_date, custom_cost, notes) VALUES (?, ?, ?, ?, ?)',
      [stop_id, activity_id, scheduled_date || null, custom_cost || null, notes || '']
    );
    const [ta] = await db.query(`
      SELECT ta.*, a.name, a.category, a.description, a.duration_hrs, a.estimated_cost AS base_cost, a.image_url
      FROM trip_activities ta JOIN activities a ON a.id = ta.activity_id WHERE ta.id = ?
    `, [result.insertId]);
    res.status(201).json({ message: 'Activity added to stop', tripActivity: ta[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeActivityFromStop = async (req, res) => {
  try {
    await db.query('DELETE FROM trip_activities WHERE id = ?', [req.params.id]);
    res.json({ message: 'Activity removed from stop' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getActivities, createActivity, addActivityToStop, removeActivityFromStop };
