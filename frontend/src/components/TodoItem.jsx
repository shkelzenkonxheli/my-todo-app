import { useEffect, useState } from "react";

export default function TodoItem() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editTask, setEditTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const base_url = import.meta.env.VITE_BASE_URL;
  const api_url = `${base_url}/api/todos`;

  const handleAdd = async () => {
    if (newTask.trim() === "") return;

    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTask }),
      });

      const data = await response.json();
      setTasks([data, ...tasks]);
      setNewTask("");
    } catch (error) {
      console.error("Error adding task", error);
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await fetch(api_url);
      const data = await response.json();
      setTasks(data);
    };

    fetchTodos();
  }, [api_url]);

  function toggleComplete(index) {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  }

  function handleEdit(index) {
    setEditTask(tasks[index].title);
    setEditIndex(index);
  }

  const handleSave = async () => {
    const id = tasks[editIndex].id;
    try {
      const response = await fetch(api_url + `/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editTask }),
      });

      const updatedTask = await response.json();

      const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t));

      setTasks(updatedTasks);
      setEditIndex(null);
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const handleDelete = async (id) => {
    const response = await fetch(api_url + `/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setTasks(tasks.filter((task) => task.id !== id));
    } else {
      console.error("Error deleting task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
          TO DO APP
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            placeholder="Enter a task"
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Add
          </button>
        </div>

        <ol className="space-y-3">
          {tasks.map((task, index) => (
            <li
              key={index}
              className="bg-gray-100 p-3 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(index)}
                  className="w-5 h-5 accent-indigo-600"
                />
                {editIndex === index ? (
                  <input
                    type="text"
                    value={editTask}
                    onChange={(e) => setEditTask(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  <span
                    className={`cursor-pointer text-lg ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                )}
              </div>

              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>

                {!task.completed && editIndex !== index && (
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}

                {editIndex === index && (
                  <button
                    onClick={handleSave}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Save
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
