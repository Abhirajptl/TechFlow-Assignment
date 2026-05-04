import pool from "../config/db.js";

export const getLogs = async (req, res) => {
  try {
    const logs = await pool.query(`
      SELECT activity_logs.*, users.name, tasks.title
      FROM activity_logs
      JOIN users ON activity_logs.user_id = users.id
      JOIN tasks ON activity_logs.task_id = tasks.id
      ORDER BY activity_logs.created_at DESC
    `);

    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};