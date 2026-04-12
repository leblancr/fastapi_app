from pydantic import BaseModel


# schemas (Pydantic) → API layer
class TaskCreate(BaseModel):
    """
    Pydantic schema for creating a task via the API.

    This is the request body model used when a client creates a new task.

    Fields:
        text: string, required task title
    """
    list_id: int
    text: str


class TaskResponse(BaseModel):
    """
    Pydantic schema for API responses.

    Returned to clients when reading tasks from the API.

    Fields:
        id: database-generated task ID
        text: task text string
        completed: boolean status of task completion
    """

    id: int
    text: str
    completed: bool

    class Config:
        from_attributes = True