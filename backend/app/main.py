import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from . import models  # Ensure models are loaded before creating tables


def _normalized_origin(origin: str) -> str:
    cleaned = origin.strip().strip("\"'")
    return cleaned[:-1] if cleaned.endswith("/") else cleaned


def _parse_allowed_origins() -> list[str]:
    raw_value = os.getenv("ALLOWED_ORIGINS", "")
    if not raw_value:
        return [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost:8082",
            "http://127.0.0.1:8081",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:8082",
            "https://documinnd.netlify.app",
        ]

    origins = [_normalized_origin(item) for item in raw_value.split(",")]
    return [origin for origin in origins if origin]

# Create all tables in the database (SQLAlchemy)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelligent Document Processing API",
    version="1.0.0",
    description="Backend API for processing, analyzing, and extracting data from documents.",
)

# Configure CORS for frontend access
allowed_origins = _parse_allowed_origins()

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
