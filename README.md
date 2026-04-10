Setup:
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn

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

To start backend:
uvicorn app.main:app --reload

sudo -u postgres createdb -O rich fastapi_app_db

Client → Task (Pydantic) → TaskDB (SQLAlchemy) → PostgreSQL
And reverse on output:
PostgreSQL → TaskDB → Task (response)

To start frontend:
cd react
npm run dev
or
cd vue
npm run dev

State:
React: tasks + setTasks
Vue:   tasks.value

React code:
const [tasks, setTasks] = useState([])
const [newTask, setNewTask] = useState('')

Vue equivalent:
const tasks = ref([])
const newTask = ref('')

State
React: useState([])
Vue:   ref([])

Update list
React: setTasks(...)
Vue:   tasks.value = ...

Loop
React: map()
Vue:   v-for

Click
React: onClick
Vue:   @click

