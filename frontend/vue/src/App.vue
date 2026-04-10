<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/* ---------------- STATE ---------------- */
// Vue is creating a reactive reference object
// ref() returns object:
// tasks = {
//  value: []
// hidden internal tracking stuff
// }
// a ref is designed to hold one piece of data only.
const tasks = ref([])  // reactive wrapper object holding your array
const newTask = ref('')  // reactive wrapper object holding your string
const editingId = ref(null)
const editValue = ref('')

/* ------- FUNCTIONS (LOGIC) communicates with the backend ------ */
const createTask = async () => {
  if (!newTask.value.trim()) return

  const res = await fetch('http://localhost:8000/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: newTask.value })
  })

  const created = await res.json()
  tasks.value = [...tasks.value, created].sort((a, b) => a.id - b.id)

  newTask.value = ''
}

const deleteTask = async (id) => {
  await fetch(`http://localhost:8000/tasks/${id}`, {
    method: 'DELETE'
  })

  tasks.value = tasks.value.filter(t => t.id !== id)
}

const loadTasks = async () => {
  const res = await fetch('http://localhost:8000/tasks')
  const data = await res.json()
  tasks.value = data.sort((a, b) => a.id - b.id)
}

const toggleTask = async (id) => {
  await fetch(`http://localhost:8000/tasks/${id}/toggle`, {
    method: 'PATCH'
  })

  tasks.value = tasks.value.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  )
}

const updateTask = async (id, text) => {
  await fetch(`http://localhost:8000/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

  tasks.value = tasks.value.map(t =>
    t.id === id ? { ...t, text } : t
  )

  editingId.value = null
  editValue.value = ''
}

const startEdit = (task) => {
  editingId.value = task.id
  editValue.value = task.text
}

const handleClick = () => {
  console.log('click detected')
}

/* ------ lifecycle ------ */
onMounted(() => {
  loadTasks()
})

onBeforeUnmount(() => {
})
</script>

<!-- ----------------
<template> is compiled by vue
vue internally generates a render function for you
everything in <script setup> is auto-exposed to the template
---------------- -->
<template>
  <div
    style="padding: 2rem; max-width: 600px; margin: 0 auto;"
  >
  <h1>Tasks</h1>
    <input v-model="newTask" placeholder="New task" />
    <button @click="createTask">Add</button>
    <ul>
      <li v-for="task in tasks" :key="task.id" class="row">
        <!-- edit mode - Vue only re-renders when you replace tasks.value,
         so saving must update the array, not just the input (task.text).
        -->
        <div v-if="editingId === task.id">
          <input v-model="editValue" />
          <button @click="updateTask(task.id, editValue)">save</button>
        </div>

        <!-- tasks not being edited -->
        <template v-else>
          <span :style="{ textDecoration: task.completed ? 'line-through' : 'none' }">
            {{ task.text }}
          </span>

          <div class="actions">
            <button @click.stop="startEditq(task)">edit</button>
            <button @click="toggleTask(task.id)">toggle</button>
            <button @click="deleteTask(task.id)">delete</button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>
