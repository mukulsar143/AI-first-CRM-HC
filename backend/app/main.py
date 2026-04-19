from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .routes import auth, scores, charity, draw, admin
from .db.session import engine, Base
from .models import models # Ensure models are loaded

app = FastAPI(title="Digital Heroes API")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Digital Heroes API", "status": "healthy"}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(scores.router, prefix="/api/scores", tags=["scores"])
app.include_router(charity.router, prefix="/api/charity", tags=["charity"])
app.include_router(draw.router, prefix="/api/draw", tags=["draw"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
