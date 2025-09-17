import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

app.post("/api/todos", async (req, res) => {
  const { title, priority, deadline } = req.body;
  try {
    console.log("Req body:", req.body);
    const result = await pool.query(
      "INSERT INTO todos (title, priority, deadline) VALUES ($1, $2, $3) RETURNING *",
      [title, priority, deadline]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot get todos" });
  }
});
app.delete("/api/todos/clear", async (req, res) => {
  try {
    await pool.query("DELETE FROM todos");
    res.json({ message: "All tasks deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting all tasks" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount > 0) {
      res.json({ message: "Task deleted successfully" });
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting task" });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const { priority, deadline } = req.body;

  try {
    const result = await pool.query(
      "UPDATE todos SET title = $1, priority = $2, deadline = $3 WHERE id = $4 RETURNING *",
      [title, priority, deadline, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Cannot update todo:", err);
    res.status(500).json({ error: "Cannot update todo" });
  }
});

app.listen(port, () => {
  console.log(`Server listen on http://localhost:${port}`);
});
