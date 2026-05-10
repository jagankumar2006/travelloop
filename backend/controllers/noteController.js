const db = require('../config/db');

const getNotes = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { stop_id, sort = 'desc' } = req.query;
    let query = 'SELECT * FROM notes WHERE trip_id = ? AND user_id = ?';
    const params = [tripId, req.user.id];
    if (stop_id) { query += ' AND stop_id = ?'; params.push(stop_id); }
    query += ` ORDER BY created_at ${sort === 'asc' ? 'ASC' : 'DESC'}`;
    const [notes] = await db.query(query, params);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createNote = async (req, res) => {
  try {
    const { trip_id, stop_id, content } = req.body;
    if (!trip_id || !content) return res.status(400).json({ error: 'trip_id and content required' });
    const [result] = await db.query(
      'INSERT INTO notes (trip_id, stop_id, user_id, content) VALUES (?, ?, ?, ?)',
      [trip_id, stop_id || null, req.user.id, content]
    );
    const [note] = await db.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Note created', note: note[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    await db.query('UPDATE notes SET content = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [content, req.params.id, req.user.id]);
    const [note] = await db.query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Note updated', note: note[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    await db.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
