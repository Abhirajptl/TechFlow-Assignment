import pool from "../config/db.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to } = req.body;

    const task = await pool.query(
      "INSERT INTO tasks(title, description, assigned_to, created_by) VALUES($1,$2,$3,$4) RETURNING *",
      [title, description, assigned_to, req.user.id]
    );

    await pool.query(
      "INSERT INTO activity_logs(user_id, task_id, action) VALUES($1,$2,$3)",
      [req.user.id, task.rows[0].id, "Task Created"]
    );

    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getTasks = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 5 } = req.query;

    let query = `
      SELECT tasks.*, users.name as assigned_user
      FROM tasks
      LEFT JOIN users ON tasks.assigned_to = users.id
      WHERE 1=1
    `;

    let values = [];
    let index = 1;

    // 🔐 Role-based filtering
    if (req.user.role === "USER") {
      query += ` AND tasks.assigned_to = $${index++}`;
      values.push(req.user.id);
    }

    // 🔍 Filter by status
    if (status) {
      query += ` AND tasks.status = $${index++}`;
      values.push(status);
    }

    // 🔎 Search by title
    if (search) {
      query += ` AND tasks.title ILIKE $${index++}`;
      values.push(`%${search}%`);
    }

    // 📄 Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY tasks.created_at DESC LIMIT $${index++} OFFSET $${index++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const updateTask = async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   const task = await pool.query(
//     "UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *",
//     [status, id]
//   );

//   await pool.query(
//     "INSERT INTO activity_logs(user_id, task_id, action) VALUES($1,$2,$3)",
//     [req.user.id, id, `Status updated to ${status}`]
//   );

//   res.json(task.rows[0]);
// };


export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  const task = await pool.query(
    `UPDATE tasks 
     SET title=$1, description=$2, status=$3 
     WHERE id=$4 
     RETURNING *`,
    [title, description, status, id]
  );

  await pool.query(
    "INSERT INTO activity_logs(user_id, task_id, action) VALUES($1,$2,$3)",
    [req.user.id, id, "Task Updated"]
  );

  res.json(task.rows[0]);
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // delete task
    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);

    // log activity
    await pool.query(
      "INSERT INTO activity_logs(user_id, task_id, action) VALUES($1,$2,$3)",
      [req.user.id, id, "Task Deleted"]
    );

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};