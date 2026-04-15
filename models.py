from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base


# models (SQLAlchemy) → database layer
class ItemList(Base):
    __tablename__ = "lists"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)


class Item(Base):
    """
    SQLAlchemy ORM model for the items table.

    Database mapping:
        This is the actual table structure tied to the database.
        Used by SQLAlchemy to read/write rows it defines.

    Columns:
        id: primary key
        title: required text field
        completed: boolean flag, defaults to False

    Notes:
        columns: (id, text, completed)
        types: (Integer, String, Boolean)
        defaults: (default=False)

        this is what gets persisted to Postgres
    """
    __tablename__ = "items"

    completed = Column(Boolean, default=False)
    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("lists.id"))
    text = Column(String, nullable=False)