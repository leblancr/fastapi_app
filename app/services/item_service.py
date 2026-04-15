from fastapi import HTTPException
from schemas import ItemCreate
from sqlalchemy.orm import Session
from models import Item
from database import commit


# endpoints
def create_item(db: Session, text: str, list_id: int):
    item = Item(text=text, list_id=list_id)
    if not item:
        raise HTTPException(status_code=404, detail="item not found")
    db.add(item)
    commit(db)
    db.refresh(item)
    return item


def delete_item(db: Session, item_id: int):
    item = get_item(db, item_id)
    db.delete(item)
    commit(db)
    return True


def get_item(db: Session, item_id: int):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="item not found")
    return item


def get_items(db: Session, list_id: int):
    return db.query(Item).filter(Item.list_id == list_id).all()


def toggle_item_completed(db: Session, item_id: int):
    item = get_item(db, item_id)
    item.completed = not item.completed
    commit(db)
    db.refresh(item)
    return item


#
def update_item(db: Session, item_id: int, updated: ItemCreate):
    item = get_item(db, item_id)
    item.text = updated.text
    commit(db)
    db.refresh(item)
    return item
