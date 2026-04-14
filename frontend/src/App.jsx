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
  const [activeListId, setActiveListId] = useState(null)
  const [hoveredListId, setHoveredListId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [editingListId, setEditingListId] = useState(null)
  const [editingListValue, setEditingListValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [lists, setLists] = useState([])
  const [tasks, setTasks] = useState([])
  const [listName, setListName] = useState("")
  const activeListName = lists.find(l => l.id === activeListId)?.name


  /* ---------------- EFFECTS (React lifecycle hooks) ------ */
  // Load lists (ONLY ids + names)
  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:8000/lists")
      const data = await res.json()

      setLists(data)

      if (data.length > 0) {
        setActiveListId(data[0].id)
      } else {
        setActiveListId(null)
      }
    }

    load().catch(console.error)
  }, [])

  // Load tasks (ONLY for active list)
  useEffect(() => {
    if (!activeListId) return

    const loadTasks = async () => {
      const res = await fetch(
        `http://localhost:8000/tasks?list_id=${activeListId}`
      )
      const data = await res.json()

      setTasks(data)
    }

    loadTasks().catch(console.error)
  }, [activeListId])

  useEffect(() => {
  console.log("activeListId:", activeListId)
}, [activeListId])

  /* ------- FUNCTIONS (LOGIC) communicates with the backend ------ */
  // Create list (append only list data)
  const createList = async () => {
    if (!listName) return

    const res = await fetch(
      "http://localhost:8000/lists?name=" + encodeURIComponent(listName),
      { method: "POST" }
    )

    const newList = await res.json()

    setLists(prev => [...prev, newList])
    setListName("")
  }

  // Create task (append only tasks)
  const createTask = async (text) => {
    const res = await fetch("http://localhost:8000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, list_id: activeListId }),
    })

    const newTask = await res.json()
    setTasks(prev => [...prev, newTask])
  }

const deleteList = async (id) => {
  await fetch(`http://localhost:8000/lists/${id}`, {
    method: "DELETE",
  })

  setLists(prev => prev.filter(l => l.id !== id))
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
      )
    )
  }

  const updateList = async (id, name) => {
    await fetch(`http://localhost:8000/lists/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    setLists(prev =>
      prev.map(l =>
        l.id === id ? { ...l, name } : l
      )
    )

    setEditingListId(null)
    setEditingListValue("")
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

    setEditingId(null)
    setEditValue("")
  }

  /* ---------------- Return (UI) ---------------- */
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
    <h1>Lists</h1>
      <div style={{ width: "100%" }}>
        {/* Render lists (buttons) */}
        <ul>
          {lists.map(list => (
            <ListItem
              key={list.id}
              list={list}
              activeListId={activeListId}
              setActiveListId={setActiveListId}
              hoveredListId={hoveredListId}
              setHoveredListId={setHoveredListId}
              deleteList={deleteList}
              editingListId={editingListId}
              setEditingListId={setEditingListId}
              editingListValue={editingListValue}
              setEditingListValue={setEditingListValue}
              updateList={updateList}
            />
          ))}

          <div className="row no-hover">
            <button onClick={() => setIsOpen(true)}>New List (modal)</button>
          </div>
        </ul>
      </div>

      <div className="divider" />

      <h2>{activeListName}</h2>

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

      {/* create list section */}
      {isOpen && (
        <div className="overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <h3>New List</h3>

            <input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="List name"
            />

          <div className="modal-actions">
            <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button
                onClick={() => {
                  createList()
                  setIsOpen(false)
                }}
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

// list item component: renders a single list row
function ListItem({ list, setActiveListId, deleteList }) {
  return (
    <li className="row">
      <span onClick={() => setActiveListId(list.id)}>
        {list.name}
      </span>

      <div className="actions">
        <button>edit</button>
        <button onClick={() => deleteList(list.id)}>delete</button>
      </div>
    </li>
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
