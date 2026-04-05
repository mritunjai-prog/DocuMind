import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from . import models  # Ensure models are loaded before creating tables

# Create all tables in the database (SQLAlchemy)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelligent Document Processing API",
    version="1.0.0",
    description="Backend API for processing, analyzing, and extracting data from documents.",
)

# Configure CORS for frontend access
allowed_origins = (
    os.getenv("ALLOWED_ORIGINS", "").split(",")
    if os.getenv("ALLOWED_ORIGINS")
    else [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8082",
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint to verify backend status.
    """
    return {"status": "ok", "message": "Intelligent Document Processing API is running"}


# Include routers
from .routes import upload

app.include_router(upload.router, prefix="/api/v1")
# app.include_router(upload.router, prefix="/api/v1")
