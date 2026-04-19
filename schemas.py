from pydantic import BaseModel


# schemas (Pydantic) → API layer
class ItemCreate(BaseModel):
    """
    Pydantic schema for creating a item via the API.

    This is the request body model used when a client creates a new item.

    Fields:
        text: string, required item title
    """
    list_id: int
    text: str
    color: str = "#666"

class ItemResponse(BaseModel):
    """
    Pydantic schema for API responses.

    Returned to clients when reading items from the API.

    Fields:
        id: database-generated item ID
        text: item text string
        completed: boolean status of item completion
    """

    id: int
    text: str
    color: str
    completed: bool

    class Config:
        from_attributes = True


class ItemUpdate(BaseModel):
    text: str
    color: str


class ListCreate(BaseModel):
    name: str
    color: str = "#666"


class ListResponse(BaseModel):
    id: int
    name: str
    color: str

    class Config:
        from_attributes = True


class ListUpdate(BaseModel):
    name: str
    color: str

