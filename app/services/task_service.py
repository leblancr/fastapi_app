from fastapi import HTTPException
from schemas import TaskCreate
from sqlalchemy.orm import Session
from models import Task
from database import commit


# endpoints
def create_task(db: Session, text: str, list_id: int):
    task = Task(text=text, list_id=list_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.add(task)
    commit(db)
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int):
    task = get_task(db, task_id)
    db.delete(task)
    commit(db)
    return True


def get_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="task not found")
    return task


def get_tasks(db: Session, list_id: int):
    return db.query(Task).filter(Task.list_id == list_id).all()


def toggle_task_completed(db: Session, task_id: int):
    task = get_task(db, task_id)
    task.completed = not task.completed
    commit(db)
    db.refresh(task)
    return task


#
def update_task(db: Session, task_id: int, updated: TaskCreate):
    task = get_task(db, task_id)
    task.text = updated.text
    commit(db)
    db.refresh(task)
    return task
