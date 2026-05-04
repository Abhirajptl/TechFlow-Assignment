import pool from "../config/db.js";

export const getUsers = async (req, res) => {
  const users = await pool.query(
    "SELECT id, name, role FROM users"
  );

  res.json(users.rows);
};