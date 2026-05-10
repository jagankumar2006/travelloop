const db = require('../config/db');

const addStop = async (req, res) => {
  try {
    const { trip_id, city_id, arrival_date, departure_date, notes } = req.body;
    if (!trip_id || !city_id) return res.status(400).json({ error: 'trip_id and city_id required' });
    const [tripCheck] = await db.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [trip_id, req.user.id]);
    if (tripCheck.length === 0) return res.status(403).json({ error: 'Trip not found or access denied' });
    const [maxOrder] = await db.query('SELECT MAX(order_index) AS maxIdx FROM trip_stops WHERE trip_id = ?', [trip_id]);
    const order = (maxOrder[0].maxIdx || 0) + 1;
    const [result] = await db.query(
      'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [trip_id, city_id, arrival_date || null, departure_date || null, order, notes || '']
    );
    const [stop] = await db.query(`
      SELECT ts.*, c.name AS city_name, c.country, c.cost_index, c.image_url AS city_image
      FROM trip_stops ts JOIN cities c ON c.id = ts.city_id WHERE ts.id = ?
    `, [result.insertId]);
    res.status(201).json({ message: 'Stop added', stop: stop[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateStop = async (req, res) => {
  try {
    const { arrival_date, departure_date, notes } = req.body;
    const [stop] = await db.query(`
      SELECT ts.id FROM trip_stops ts
      JOIN trips t ON t.id = ts.trip_id
      WHERE ts.id = ? AND t.user_id = ?
    `, [req.params.id, req.user.id]);
    if (stop.length === 0) return res.status(404).json({ error: 'Stop not found' });
    await db.query(
      'UPDATE trip_stops SET arrival_date = ?, departure_date = ?, notes = ? WHERE id = ?',
      [arrival_date || null, departure_date || null, notes || '', req.params.id]
    );
    res.json({ message: 'Stop updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteStop = async (req, res) => {
  try {
    const [stop] = await db.query(`
      SELECT ts.id FROM trip_stops ts
      JOIN trips t ON t.id = ts.trip_id
      WHERE ts.id = ? AND t.user_id = ?
    `, [req.params.id, req.user.id]);
    if (stop.length === 0) return res.status(404).json({ error: 'Stop not found' });
    await db.query('DELETE FROM trip_stops WHERE id = ?', [req.params.id]);
    res.json({ message: 'Stop deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reorderStops = async (req, res) => {
  try {
    const { stops } = req.body; // [{id, order_index}]
    if (!Array.isArray(stops)) return res.status(400).json({ error: 'stops array required' });
    for (const s of stops) {
      await db.query('UPDATE trip_stops SET order_index = ? WHERE id = ?', [s.order_index, s.id]);
    }
    res.json({ message: 'Stops reordered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addStop, updateStop, deleteStop, reorderStops };
