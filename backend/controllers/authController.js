const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });
    if (!/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ error: 'Invalid email format' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const profilePhoto = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, profile_photo, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, profilePhoto, 'user']
    );
    const token = generateToken({ id: result.insertId, email, role: 'user' });
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: result.insertId, name, email, profile_photo: profilePhoto, role: 'user' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        profile_photo: user.profile_photo, role: user.role,
        language: user.language
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, profile_photo, role, language, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, language } = req.body;
    const profilePhoto = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;
    const fields = [];
    const vals = [];
    if (name) { fields.push('name = ?'); vals.push(name); }
    if (email) { fields.push('email = ?'); vals.push(email); }
    if (language) { fields.push('language = ?'); vals.push(language); }
    if (profilePhoto) { fields.push('profile_photo = ?'); vals.push(profilePhoto); }
    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(req.user.id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);
    const [rows] = await db.query(
      'SELECT id, name, email, profile_photo, role, language FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ message: 'Profile updated', user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { signup, login, getMe, updateProfile, deleteAccount };
