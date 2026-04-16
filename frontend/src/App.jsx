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
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [editingListId, setEditingListId] = useState(null)
  const [editingListValue, setEditingListValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [lists, setLists] = useState([])
  const [items, setItems] = useState([])
  const [listName, setListName] = useState("")
  const activeListName = lists.find(l => l.id === activeListId)?.name
  const [sidebarWidth, setSidebarWidth] = useState(200)

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

  // Load items (ONLY for active list)
  useEffect(() => {
    if (!activeListId) return

    const loadItems = async () => {
      const res = await fetch(
        `http://localhost:8000/items?list_id=${activeListId}`
      )
      const data = await res.json()

      setItems(data)
    }

    loadItems().catch(console.error)
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

  // Create item (append only items)
  const createItem = async (text) => {
    const res = await fetch("http://localhost:8000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, list_id: activeListId }),
    })

    const newItem = await res.json()
    setitems(prev => [...prev, newItem])
  }

const deleteList = async (id) => {
  await fetch(`http://localhost:8000/lists/${id}`, {
    method: "DELETE",
  })

  setLists(prev => prev.filter(l => l.id !== id))
}
  const deleteItem = async (id) => {
    await fetch(`http://localhost:8000/items/${id}`, {
      method: "DELETE",
    })

    setItems(prev => prev.filter(t => t.id !== id))
  }

  const toggleItem = async (id) => {
    await fetch(`http://localhost:8000/items/${id}/toggle`, {
      method: "PATCH",
    })

    setItems(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    )
  }

  const startResize = (e) => {
    const startX = e.clientX
    const startWidth = sidebarWidth

    const onMove = (ev) => {
      const next = startWidth + (ev.clientX - startX)
      setSidebarWidth(Math.max(160, Math.min(400, next)))
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
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

  const updateItem = async (id, text) => {
    await fetch(`http://localhost:8000/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    setItems(prev =>
      prev.map(t =>
        t.id === id ? { ...t, text } : t
      )
    )

    setEditingId(null)
    setEditValue("")
  }

  /* ---------------- Return (UI) ---------------- */
  return (
    <div className="app">

      {/* LEFT: lists */}
      <div className="sidebar" style={{ width: sidebarWidth }}>
        <h1>Lists</h1>
        <ul>
          {lists.map(list => (
            <List
              key={list.id}
              list={list}
              setActiveListId={setActiveListId}
              deleteList={deleteList}
              editingListId={editingListId}
              editingListValue={editingListValue}
              setEditingListId={setEditingListId}
              setEditingListValue={setEditingListValue}
              updateList={updateList}
            />
          ))}

          <div className="row no-hover">
            <button onClick={() => setIsOpen(true)}>New List</button>
          </div>
        </ul>
      </div>

     <div
       className="resizer"
       onMouseDown={startResize}
     />

      {/* RIGHT: items */}
      <div className="content">
      <h2>{activeListName}</h2>
      <ul>
        {items.map(item => (
          <Item
            key={item.id}
            item={item}
            editingId={editingId}
            editValue={editValue}
            setEditingId={setEditingId}
            setEditValue={setEditValue}
            updateItem={updateItem}
            toggleItem={toggleItem}
            deleteItem={deleteItem}
          />
        ))}
      </ul>
    </div>

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

// list item component: renders a list of lists
function List({
  list,
  setActiveListId,
  deleteList,
  editingListId,
  editingListValue,
  setEditingListId,
  setEditingListValue,
  updateList
}) {
  return (
    <li className="row">

      {editingListId === list.id ? (
        <input
          value={editingListValue}
          onChange={(e) => setEditingListValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateList(list.id, editingListValue)
            }
          }}
        />
      ) : (
        <span className="list-name" onClick={() => setActiveListId(list.id)}>
          {list.name}
        </span>
      )}

      <div className="actions">
        <button onClick={() => {
          setEditingListId(list.id)
          setEditingListValue(list.name)
        }}>
          edit
        </button>

        <button onClick={() => deleteList(list.id)}>
          delete
        </button>
      </div>

    </li>
  )
}

// item component: renders a single list row
function Item({
  item,
  editingId,
  editValue,
  setEditingId,
  setEditValue,
  updateItem,
  toggleItem,
  deleteItem,
  editRef
}) {
  return (
    <li className="row">
      {editingId === item.id ? (
        <div ref={editRef}>
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <button onClick={() => updateItem(item.id, editValue)}>
            save
          </button>
        </div>
      ) : (
        <>
          <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
            {item.text}
          </span>

          <div className="actions">
            <button onClick={() => {
              setEditingId(item.id)
              setEditValue(item.text)
            }}>
              edit
            </button>

            <button onClick={() => toggleItem(item.id)}>
              toggle
            </button>

            <button onClick={() => deleteItem(item.id)}>
              delete
            </button>
          </div>
        </>
      )}
    </li>
  )
}

export default App
