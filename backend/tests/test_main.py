from fastapi.testclient import TestClient
from app.main import app
import os
import pytest

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Intelligent Document Processing API is running"}

def test_upload_no_file():
    response = client.post("/api/v1/upload")
    assert response.status_code == 422  # Unprocessable Entity because file is missing
