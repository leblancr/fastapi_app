Setup:
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn

We will build exactly this, in order:

task model becomes structured
tasks get an id
GET single task by id
update task by id
delete task by id
keep in-memory only until all 5 work
only then consider database

To run:
uvicorn app.main:app --reload

sudo -u postgres createdb -O rich fastapi_app_db

Client → Task (Pydantic) → TaskDB (SQLAlchemy) → PostgreSQL
And reverse on output:
PostgreSQL → TaskDB → Task (response)

Target architecture:

main.py = handles HTTP requests and responses only
services/ = all database + application logic
routes should not touch SQLAlchemy directly

fastapi_app/
│
├── main.py
├── models.py
├── schemas.py
├── database.py
│
└── services/
    ├── __init__.py
    └── task_service.py