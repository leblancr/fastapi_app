<script setup>
import { ref, onMounted } from 'vue'

const tasks = ref([])
const newTask = ref('')

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

onMounted(() => {
  loadTasks()
})
</script>

<template>
  <div style="padding: 2rem; max-width: 600px; margin: 0 auto;">
    <h1>Tasks</h1>

    <ul>
      <li v-for="task in tasks" :key="task.id" class="row">
        <span
          class="text"
          :style="{ textDecoration: task.completed ? 'line-through' : 'none' }"
        >
          {{ task.text }}
        </span>

        <div class="actions">
          <button @click="toggleTask(task.id)">toggle</button>
          <button @click="deleteTask(task.id)">delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>
