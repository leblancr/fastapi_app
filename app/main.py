from fastapi import Depends
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from database import SessionLocal, engine, Base
from sqlalchemy.orm import Session
from models import TaskDB

class Task(BaseModel):
    title: str

app = FastAPI()

# client wants to get
@app.get("/")
def root():
    return {"status": "ok"}

tasks = []
task_id = 0


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/tasks", status_code=201)
def create_task(task: Task, db: Session = Depends(get_db)):
    new_task = TaskDB(title=task.title)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="task not found")

    db.delete(task)
    db.commit()


@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    return db.query(TaskDB).all()


@app.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="task not found")
    return task


@app.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: Task):
    for task in tasks:
        if task.id == task_id:
            task.title = updated_task.title
            return task
    raise HTTPException(status_code=404, detail="task not found")


