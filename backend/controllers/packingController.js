const db = require('../config/db');

const getPackingItems = async (req, res) => {
  try {
    const { tripId } = req.params;
    const [items] = await db.query(
      'SELECT * FROM packing_items WHERE trip_id = ? AND user_id = ? ORDER BY category, name',
      [tripId, req.user.id]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addPackingItem = async (req, res) => {
  try {
    const { trip_id, name, category } = req.body;
    if (!trip_id || !name) return res.status(400).json({ error: 'trip_id and name required' });
    const [result] = await db.query(
      'INSERT INTO packing_items (trip_id, user_id, name, category, is_packed) VALUES (?, ?, ?, ?, 0)',
      [trip_id, req.user.id, name, category || 'General']
    );
    const [item] = await db.query('SELECT * FROM packing_items WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Item added', item: item[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePackingItem = async (req, res) => {
  try {
    const { name, category, is_packed } = req.body;
    const fields = []; const vals = [];
    if (name !== undefined) { fields.push('name = ?'); vals.push(name); }
    if (category !== undefined) { fields.push('category = ?'); vals.push(category); }
    if (is_packed !== undefined) { fields.push('is_packed = ?'); vals.push(is_packed ? 1 : 0); }
    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(req.params.id);
    await db.query(`UPDATE packing_items SET ${fields.join(', ')} WHERE id = ? AND user_id = ${req.user.id}`, vals);
    const [item] = await db.query('SELECT * FROM packing_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item updated', item: item[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePackingItem = async (req, res) => {
  try {
    await db.query('DELETE FROM packing_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetPackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    await db.query('UPDATE packing_items SET is_packed = 0 WHERE trip_id = ? AND user_id = ?', [tripId, req.user.id]);
    res.json({ message: 'Packing list reset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPackingItems, addPackingItem, updatePackingItem, deletePackingItem, resetPackingList };
