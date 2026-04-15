# app/services/list_service.py

from sqlalchemy.orm import Session
from models import ItemList
from database import commit


def create_list(db: Session, name: str):
    l = ItemList(name=name)
    db.add(l)
    commit(db)
    db.refresh(l)
    return l


def delete_list(db: Session, item_list_id: int):
    l = get_list(db, item_list_id)
    db.delete(l)
    commit(db)
    return True


def get_list(db: Session, list_id: int):
    return db.query(ItemList).filter(ItemList.id == list_id).first()


def get_lists(db: Session):
    return db.query(ItemList).all()

