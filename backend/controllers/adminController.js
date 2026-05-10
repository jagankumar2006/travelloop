const db = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) AS total_users FROM users WHERE role != "admin"');
    const [[{ total_trips }]] = await db.query('SELECT COUNT(*) AS total_trips FROM trips');
    const [popular_cities] = await db.query(`
      SELECT c.name, c.country, COUNT(ts.id) AS visit_count
      FROM trip_stops ts JOIN cities c ON c.id = ts.city_id
      GROUP BY c.id ORDER BY visit_count DESC LIMIT 10
    `);
    const [popular_activities] = await db.query(`
      SELECT a.name, a.category, COUNT(ta.id) AS use_count
      FROM trip_activities ta JOIN activities a ON a.id = ta.activity_id
      GROUP BY a.id ORDER BY use_count DESC LIMIT 10
    `);
    const [monthly_trips] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM trips GROUP BY month ORDER BY month DESC LIMIT 12
    `);
    const [user_growth] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM users GROUP BY month ORDER BY month DESC LIMIT 12
    `);
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 50');

    res.json({ total_users, total_trips, popular_cities, popular_activities, monthly_trips, user_growth, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAdminStats };
