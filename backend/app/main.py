from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Intelligent Document Processing API",
    version="1.0.0",
    description="Backend API for processing, analyzing, and extracting data from documents.",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8082",
    ],  # React/Vite dev ports
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
from app.routes import upload

app.include_router(upload.router, prefix="/api/v1")
# app.include_router(upload.router, prefix="/api/v1")
