import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaTrash,
  FaEdit,
  FaSave,
  FaPrint,
  FaSearch,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default function TodoItem() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("low");
  const [deadline, setDeadline] = useState("");
  const [editTask, setEditTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const base_url = import.meta.env.VITE_BASE_URL;
  const api_url = `${base_url}/api/todos`;

  const handleAdd = async () => {
    if (newTask.trim() === "") return;
    const existingTask = tasks.some(
      (task) => task.title.toLowerCase() === newTask.trim().toLowerCase()
    );
    if (existingTask) {
      alert("Task already exists");
      setNewTask("");
      setPriority("low");
      setDeadline("");
      return;
    }

    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask,
          priority: priority,
          deadline: deadline,
        }),
      });

      const data = await response.json();
      setTasks([data, ...tasks]);
      setNewTask("");
      setPriority("low");
      setDeadline("");
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
    setPriority(tasks[index].priority);
    setDeadline(tasks[index].deadline || "");
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
        body: JSON.stringify({
          title: editTask,
          priority: priority,
          deadline: deadline,
        }),
      });

      const updatedTask = await response.json();

      const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t));

      setTasks(updatedTasks);
      setEditIndex(null);
    } catch (error) {
      console.error("Error updating task", error);
    }
  };
  const handleClear = async () => {
    const confirmClear = window.confirm(
      "⚠️ Are you sure you want to delete all tasks?"
    );
    if (!confirmClear) return;

    try {
      const response = await fetch(api_url + "/clear", {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks([]);
        alert("✅ All tasks deleted successfully!");
      } else {
        alert("❌ Failed to delete all tasks. Try again.");
      }
    } catch (error) {
      console.error("Error clearing tasks:", error);
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

  const priorityColors = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "all") return true;
      if (filter === "completed") return task.completed;
      if (filter === "uncompleted") return !task.completed;
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const completedTask = filteredTasks.filter((task) => task.completed).length;
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("My To-Do List", 14, 20);

    const tableColumn = ["#", "Task", "Priority", "Deadline", "Status"];
    const tableRows = [];

    tasks.forEach((task, index) => {
      const status = task.completed ? " Completed" : " Uncompleted";
      const deadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString()
        : "No deadline";

      const rowData = [index + 1, task.title, task.priority, deadline, status];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      bodyStyles: { textColor: 50 },
    });

    doc.save("todo-list.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-4 bg-gray-50">
      <div className="mb-8 text-center px-2">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-600">
          {completedTask}/{tasks.length} tasks
        </h1>
        <p className="text-gray-500 mt-2 sm:mt-4 text-sm sm:text-base">
          {tasks.length === 0
            ? "Your task list is empty."
            : completedTask === tasks.length
            ? "🎉 Congratulations, you've completed all tasks!"
            : completedTask === 0
            ? "Let's get started!"
            : completedTask < tasks.length / 2
            ? "Keep going, you're making progress!"
            : "Great job, you're more than halfway there!"}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-indigo-600">
          ✅ TO DO APP
        </h1>

        {/* Input area */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <input
            type="text"
            value={newTask}
            placeholder="Enter a task..."
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium"
          >
            Add
          </button>
        </div>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">All</option>
            <option value="uncompleted">Uncompleted</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Task list */}
        <ol className="space-y-3">
          {filteredTasks.map((task, index) => (
            <li
              key={index}
              className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3"
            >
              <div className="flex items-center gap-2 flex-1 w-full">
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
                    className={`text-sm sm:text-base ${
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {task.title}
                  </span>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                  {task.deadline && (
                    <span className="text-xs sm:text-sm text-blue-600 flex items-center gap-1">
                      <FaCalendarAlt />
                      {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
                {!task.completed && editIndex !== index && (
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                )}
                {editIndex === index && (
                  <button
                    onClick={handleSave}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaSave />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Actions */}
        {tasks.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
            <button
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Clear All
            </button>
            <button
              onClick={exportToPDF}
              className="bg-indigo-600 flex items-center gap-2 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Export to PDF <FaPrint />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
