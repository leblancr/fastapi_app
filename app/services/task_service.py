from sqlalchemy.orm import Session
from models import Task

def create_task(db: Session, title: str):
    task = Task(title=title)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task