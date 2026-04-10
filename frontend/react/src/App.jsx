import { useState, useEffect, useRef } from 'react'
import './App.css'

// app component: owns state and data loading
function App() {
  /* ---------------- STATE ----------------
    useState
    changes → re-render happens
    useRef
    changes → NO re-render
  */
  const [tasks, setTasks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")

  /* ---------------- REFS ---------------- */
  const editRef = useRef(null)

  /* ---------------- EFFECTS (React lifecycle hooks) ------ */
  // close edit mode when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (editingId !== null && editRef.current && !editRef.current.contains(e.target)) {
        setEditingId(null)  // no task is being edited anymore
        setEditValue("")  // clear the input field
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [editingId])

  // load tasks once on page load
  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:8000/tasks")
      const data = await res.json()
      // update task locally after backend save
      setTasks(data.sort((a, b) => a.id - b.id))
    }

    load()  //
  }, [])

  /* ------- FUNCTIONS (LOGIC) communicates with the backend ------ */
  const createTask = async (text) => {
  const res = await fetch("http://localhost:8000/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  const newTask = await res.json()

  setTasks(prev =>
    [...prev, newTask].sort((a, b) => a.id - b.id)
  )

  return newTask
}

const deleteTask = async (id) => {
    await fetch(`http://localhost:8000/tasks/${id}`, {
      method: "DELETE",
    })

    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const toggleTask = async (id) => {
    await fetch(`http://localhost:8000/tasks/${id}/toggle`, {
      method: "PATCH",
    })

    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ).sort((a, b) => a.id - b.id)
    )
  }

  const updateTask = async (id, text) => {
    await fetch(`http://localhost:8000/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, text } : t
      )
    )
  }

  /* ---------------- Return (UI) ---------------- */
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Tasks</h1>

      {/* create task section */}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const text = e.target.text.value
          if (!text) return
          await createTask(text)
          e.target.reset()
        }}
      >
        <input name="text" placeholder="New task" required />
        <button type="submit">Add</button>
      </form>

      {/* task list section */}
      <ul>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            editingId={editingId}
            editValue={editValue}
            setEditingId={setEditingId}
            setEditValue={setEditValue}
            updateTask={updateTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        ))}
      </ul>
    </div>
  )
}

// task item component: renders a single task row
function TaskItem({
  task,
  editingId,
  editValue,
  setEditingId,
  setEditValue,
  updateTask,
  toggleTask,
  deleteTask,
  editRef
}) {
  return (
    <li className="row">
      {editingId === task.id ? (
        <div ref={editRef}>
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <button onClick={() => updateTask(task.id, editValue)}>
            save
          </button>
        </div>
      ) : (
        <>
          <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.text}
          </span>

          <div className="actions">
            <button onClick={() => {
              setEditingId(task.id)
              setEditValue(task.text)
            }}>
              edit
            </button>

            <button onClick={() => toggleTask(task.id)}>
              toggle
            </button>

            <button onClick={() => deleteTask(task.id)}>
              delete
            </button>
          </div>
        </>
      )}
    </li>
  )
}

export default App
