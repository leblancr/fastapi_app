from fastapi import Depends
from fastapi import FastAPI, HTTPException
from database import SessionLocal, engine, Base
from sqlalchemy.orm import Session
from schemas import TaskCreate, TaskResponse
from fastapi.middleware.cors import CORSMiddleware
from app.services import task_service

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# client wants to get
@app.get("/")
def root():
    return {"status": "ok"}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# create task
@app.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    return task_service.create_task(db, task.text)


# delete task
@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task_service.delete_task(db, task_id)


# get all tasks
@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return task_service.get_tasks(db)


# get one task
@app.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return task_service.get_task(db, task_id)


# toggle task complete
@app.patch("/tasks/{task_id}/toggle", response_model=TaskResponse)
def toggle_task_completed(task_id: int, db: Session = Depends(get_db)):
    return task_service.toggle_task_completed(db, task_id)


# edit task
@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, updated_task: TaskCreate, db: Session = Depends(get_db)):
    return task_service.update_task(db, task_id, updated_task)

