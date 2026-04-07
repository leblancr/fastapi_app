from fastapi import HTTPException
from sqlalchemy.orm import Session
from models import Task

def create_task(db: Session, title: str):
    task = Task(title=title)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int):
    task = get_task(db, task_id)
    db.delete(task)
    db.commit()
    return True


def get_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="task not found")
    return task


def get_tasks(db: Session):
    return db.query(Task).all()


def toggle_task_completed(db: Session, task_id: int):
    task = get_task(db, task_id)

    # add these lines right here
    print("before:", task.completed)
    task.completed = not task.completed
    print("after:", task.completed)

    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, updated: TaskCreate):
    task = get_task(db, task_id)
    task.title = updated.title
    db.commit()
    db.refresh(task)
    return task
