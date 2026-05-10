const db = require('../config/db');

const getBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const [tripCheck] = await db.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [tripId, req.user.id]);
    if (tripCheck.length === 0) return res.status(403).json({ error: 'Access denied' });

    const [budget] = await db.query('SELECT * FROM budgets WHERE trip_id = ?', [tripId]);
    const [activityCosts] = await db.query(`
      SELECT
        SUM(COALESCE(ta.custom_cost, a.estimated_cost)) AS total_activity_cost,
        COUNT(ta.id) AS activity_count
      FROM trip_activities ta
      JOIN activities a ON a.id = ta.activity_id
      JOIN trip_stops ts ON ts.id = ta.stop_id
      WHERE ts.trip_id = ?
    `, [tripId]);

    const [stops] = await db.query(`
      SELECT ts.arrival_date, ts.departure_date, c.cost_index, c.name AS city_name
      FROM trip_stops ts JOIN cities c ON c.id = ts.city_id WHERE ts.trip_id = ?
    `, [tripId]);

    let daily_stay_cost = 0;
    let total_days = 0;
    for (const stop of stops) {
      if (stop.arrival_date && stop.departure_date) {
        const days = Math.max(1, Math.ceil((new Date(stop.departure_date) - new Date(stop.arrival_date)) / (1000 * 60 * 60 * 24)));
        total_days += days;
        daily_stay_cost += days * (stop.cost_index || 50);
      }
    }

    const b = budget[0] || {};
    const computed = {
      ...b,
      computed_activity_cost: Math.round(activityCosts[0].total_activity_cost || 0),
      computed_stay_cost: Math.round(daily_stay_cost),
      total_days,
      total_computed: Math.round(
        (b.transport || 0) + daily_stay_cost + (activityCosts[0].total_activity_cost || 0) +
        (b.meals || 0) + (b.miscellaneous || 0)
      ),
      over_budget: b.total_budget > 0 && (
        (b.transport || 0) + daily_stay_cost + (activityCosts[0].total_activity_cost || 0) +
        (b.meals || 0) + (b.miscellaneous || 0)
      ) > b.total_budget,
      cheapest_recommendations: stops
        .sort((a, b) => (a.cost_index || 0) - (b.cost_index || 0))
        .slice(0, 3)
        .map(s => ({ city: s.city_name, cost_index: s.cost_index }))
    };
    res.json(computed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { total_budget, transport, stay, activities, meals, miscellaneous } = req.body;
    const [tripCheck] = await db.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [tripId, req.user.id]);
    if (tripCheck.length === 0) return res.status(403).json({ error: 'Access denied' });
    await db.query(`
      UPDATE budgets SET total_budget = ?, transport = ?, stay = ?, activities = ?, meals = ?, miscellaneous = ?
      WHERE trip_id = ?
    `, [total_budget || 0, transport || 0, stay || 0, activities || 0, meals || 0, miscellaneous || 0, tripId]);
    const [budget] = await db.query('SELECT * FROM budgets WHERE trip_id = ?', [tripId]);
    res.json({ message: 'Budget updated', budget: budget[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getBudget, updateBudget };
