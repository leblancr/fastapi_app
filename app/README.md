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
