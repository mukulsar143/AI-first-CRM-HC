from app.db.session import engine, Base
from app.models.models import User, Score, Charity, UserCharity, Draw, Winner

def init_db():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()
