import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const editRef = useRef(null)

  const loadTasks = async () => {
    const res = await fetch('http://localhost:8000/tasks')
    const data = await res.json()
    setTasks(data)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (editingId !== null && editRef.current && !editRef.current.contains(e.target)) {
        setEditingId(null)
        setEditValue("")
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [editingId])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Tasks</h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const title = e.target.title.value

          await fetch('http://localhost:8000/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
          })

          e.target.reset()
          loadTasks()
        }}
      >
        <input name="title" placeholder="New task" required />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="task">
            {editingId === task.id ? (
              <div ref={editRef}>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button
                  onClick={async () => {
                    await fetch(`http://localhost:8000/tasks/${task.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: editValue }),
                    })

                    setEditingId(null)
                    setEditValue("")
                    loadTasks()
                  }}
                >
                  save
                </button>
              </div>
            ) : (
              <>
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </span>

                <div className="actions">
                  <button
                    onClick={() => {
                      setEditingId(task.id)
                      setEditValue(task.title)
                    }}
                  >
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
        ))}
      </ul>
    </div>
  )
}

export default App
