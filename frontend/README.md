# 📝 To Do App

A simple full-stack To-Do List application built with **React (Vite)** on the frontend and **Node.js + Express + PostgreSQL** on the backend.

---

## 🚀 Features

- ✅ Add, edit, delete, and complete tasks
- 🔗 Frontend ↔ Backend communication via REST API
- 🛡 Environment variables managed securely
- 🐘 PostgreSQL integration for data persistence

---

## 📁 Project Structure

my-todo-app/
├── backend/ # Express + PostgreSQL API
│ ├── index.js
│ ├── .env
│ └── package.json
├── frontend/ # React (Vite) app
│ ├── src/
│ ├── .env.local
│ └── package.json

---

## 🛠 Requirements

- Node.js ≥ 18
- PostgreSQL installed and running
- A PostgreSQL database created (e.g. `todo_db`)

---

## ⚙️ Environment Setup

### 🔒 `.env` (backend)

Create a `.env` file inside `backend/`:

```env
PG_USER=your_postgres_username
PG_PASSWORD=your_postgres_password
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=todo_db

🧑‍💻 Run Locally
1. Clone the repository
git clone https://github.com/your-username/my-todo-app.git
cd my-todo-app
2. Setup backend
cd backend
npm install
node index.js
3. Setup frontend
cd ../frontend
npm install
npm run dev

```
