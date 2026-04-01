from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

class Task(BaseModel):
    id: int | None = None
    title: str

app = FastAPI()

# client wants to get
@app.get("/")
def root():
    return {"status": "ok"}

tasks = []
task_id = 0


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    for i, task in enumerate(tasks):
        if task.id == task_id:
            del tasks[i]
            return None
    raise HTTPException(status_code=404, detail="task not found")


@app.get("/tasks")
def get_tasks():
    return tasks


@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    for task in tasks:
        if task.id == task_id:
            return task
    return {"error": "task not found"}


@app.post("/tasks, status_code=201")
def create_task(task: Task):
    global task_id
    task_id += 1
    task.id = task_id
    tasks.append(task)
    return task


@app.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: Task):
    for task in tasks:
        if task.id == task_id:
            task.title = updated_task.title
            return task
    raise HTTPException(status_code=404, detail="task not found")


