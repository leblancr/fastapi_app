from fastapi import Depends
from fastapi import FastAPI, HTTPException
from database import SessionLocal, engine, Base
from sqlalchemy.orm import Session
from schemas import ItemCreate, ItemResponse
from fastapi.middleware.cors import CORSMiddleware
from app.services import list_service, item_service
from models import List
from pydantic import BaseModel


class ListUpdate(BaseModel):
    name: str

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


# API routes
# create list
@app.post("/lists")
def create_list(name: str, db: Session = Depends(get_db)):
    l = List(name=name)
    db.add(l)
    db.commit()
    db.refresh(l)
    return l


# create item
@app.post("/items", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    return item_service.create_item(db, item.text, item.list_id)


# delete list
@app.delete("/lists/{list_id}", status_code=204)
def delete_list(list_id: int, db: Session = Depends(get_db)):
    list_service.delete_list(db, list_id)


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item_service.delete_item(db, item_id)


# get all lists
@app.get("/lists")
def get_lists(db: Session = Depends(get_db)):
    return list_service.get_lists(db)


# get all items
@app.get("/items", response_model=list[ItemResponse])
def get_items(list_id: int,db: Session = Depends(get_db)):
    return item_service.get_items(db, list_id)


# get one item
@app.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    return item_service.get_item(db, item_id)


# toggle item complete
@app.patch("/items/{item_id}/toggle", response_model=ItemResponse)
def toggle_item_completed(item_id: int, db: Session = Depends(get_db)):
    return item_service.toggle_item_completed(db, item_id)


# edit lists
@app.put("/lists/{list_id}")
def update_list(list_id: int, updated: ListUpdate, db: Session = Depends(get_db)):
    lst = db.query(List).filter(List.id == list_id).first()
    lst.name = updated.name
    db.commit()
    db.refresh(lst)
    return lst


# edit item
@app.put("/items/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, updated_item: ItemCreate, db: Session = Depends(get_db)):
    return item_service.update_item(db, item_id, updated_item)

