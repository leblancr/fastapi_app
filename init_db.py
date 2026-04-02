from database import Base, engine
import models  # ensures TaskDB is registered with Base

Base.metadata.create_all(bind=engine)