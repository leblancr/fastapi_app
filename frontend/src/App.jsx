import { useState, useEffect } from 'react'
import './App.css'

// app component: owns state and data loading
function App() {
  /* ---------------- STATE ----------------
    useState
    changes → re-render happens
    useRef
    changes → NO re-render
  */
  const [activeListId, setActiveListId] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [lists, setLists] = useState([
    { id: 1, name: "Tasks", tasks: [] }
  ])
  const [listName, setListName] = useState("")

  /* ---------------- EFFECTS (React lifecycle hooks) ------ */
  // load tasks once on page load
  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:8000/tasks")
      const data = await res.json()

      // update task locally after backend save
      setLists([
        {
          id: 1,
          name: "Tasks",
          tasks: data.sort((a, b) => a.id - b.id)
        }
      ])
    }

    // calls the above function
    load().catch(err => {
      console.error(err)
    })
  }, [])

  /* ------- FUNCTIONS (LOGIC) communicates with the backend ------ */
  const createList = () => {
    if (!listName) return

    setLists(prev => [
      ...prev,
      {
        id: Date.now(),
        name: listName,
        tasks: []
      }
    ])

    setListName("")
  }

  const createTask = async (text) => {
  const res = await fetch("http://localhost:8000/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  const newTask = await res.json()

  setLists(prev =>
    prev.map(list =>
      list.id === activeListId
        ? {
            ...list,
            tasks: [...list.tasks, newTask].sort((a, b) => a.id - b.id)
          }
        : list
      )
    )

    return newTask
  }

  const deleteTask = async (id) => {
    await fetch(`http://localhost:8000/tasks/${id}`, {
      method: "DELETE",
    })

    setLists(prev =>
      prev.map(list =>
        list.id === activeListId
          ? { ...list, tasks: list.tasks.filter(t => t.id !== id) }
          : list
      )
    )
  }

  const toggleTask = async (id) => {
    await fetch(`http://localhost:8000/tasks/${id}/toggle`, {
      method: "PATCH",
    })

    setLists(prev =>
      prev.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks
                .map(t =>
                  t.id === id ? { ...t, completed: !t.completed } : t
                )
                .sort((a, b) => a.id - b.id)
            }
          : list
      )
    )
  }

  const updateTask = async (id, text) => {
    await fetch(`http://localhost:8000/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    setLists(prev =>
      prev.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks.map(t =>
                t.id === id ? { ...t, text } : t
              )
            }
          : list
      )
    )

    setEditingId(null)
    setEditValue("")
  }

  const activeList = lists.find(l => l.id === activeListId)

  /* ---------------- Return (UI) ---------------- */
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Tasks</h1>
      <div>
        {lists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            style={{
              fontWeight: list.id === activeListId ? "bold" : "normal"
            }}
          >
            {list.name}
          </button>
        ))}
      </div>

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

      <div>
        <input
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="New list name"
        />
        <button onClick={createList}>Create list</button>
      </div>

      {/* task list section */}
      <ul>
        {activeList.tasks.map(task => (
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
