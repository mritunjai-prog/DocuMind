import uuid
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db, SessionLocal
from app.models.document import Document
from app.services.storage import StorageService
from app.services.rag import DocumentRAG

router = APIRouter()
storage = StorageService()


async def virus_scan(file: UploadFile) -> bool:
    # A mock virus scan placeholder. Always returns True.
    return True


def background_process_document(doc_id: str, file_path: str):
    print(f"Starting Background Processing for {doc_id}")
    success = DocumentRAG.process_document_into_rag(doc_id, file_path)

    analysis = DocumentRAG.analyze_document(doc_id)

    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            if success and analysis.get("status") == "completed":
                doc.status = "completed"
                doc.summary = analysis.get("summary")
                doc.entities = json.dumps(analysis.get("entities", []))
                doc.extracted_text = analysis.get("ocr_text", "No text extracted.")
                doc.document_type = analysis.get("document_type", "Unknown")
                doc.completed_at = datetime.now()
            else:
                doc.status = "failed"
                doc.summary = analysis.get("summary", "Process failed.")
            db.commit()
    finally:
        db.close()


@router.post("/upload")
async def upload_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    user_id: str = "guest_user",
    batch_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    1. Validate file types & size
    2. Scan for viruses
    3. Generate unique IDs
    4. Store in S3 (mocked to local storage)
    5. Create database records
    6. Queue for processing (mocked queue)
    7. Return request IDs
    """
    results = []

    if batch_id is None:
        batch_id = str(uuid.uuid4())

    for file in files:
        # Validate Size (simulated via headers/mock since fastapi File checks need stream reading)
        # Using a fixed arbitrary limit check logic if needed
        # In actual usage you'd use a middleware or checking chunk sizes

        # Virus Scan
        is_safe = await virus_scan(file)
        if not is_safe:
            raise HTTPException(status_code=400, detail="Malicious file detected")

        # Upload using Storage Service
        file_path = await storage.upload(file, bucket="documents")

        # Determine pseudo file size since it's saved locally
        import os

        file_size = os.path.getsize(file_path)

        if file_size > 500_000_000:  # 500MB
            raise HTTPException(status_code=413, detail="File too large")

        doc_id = str(uuid.uuid4())

        # Create Database Record
        doc_record = Document(
            id=doc_id,
            filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            user_id=user_id,
        )
        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)

        # Queueing logic: Now using our real RAG processor with background DB save
        background_tasks.add_task(background_process_document, doc_id, file_path)

        results.append(
            {
                "request_id": doc_record.id,
                "filename": file.filename,
                "status": "processing",
            }
        )

    return results


from pydantic import BaseModel


class QueryRequest(BaseModel):
    query: str


@router.get("/documents")
def get_all_documents(user_id: str = "guest_user", db: Session = Depends(get_db)):
    """
    Fetch all historical documents uploaded by a user.
    """
    docs = (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )

    results = []
    for doc in docs:
        results.append(
            {
                "id": doc.id,
                "filename": doc.filename,
                "status": doc.status,
                "document_type": doc.document_type or "Unknown",
                "created_at": doc.created_at,
                "completed_at": doc.completed_at,
            }
        )
    return results


@router.get("/documents/{document_id}/analysis")
def get_document_analysis(document_id: str, db: Session = Depends(get_db)):
    """
    Return analysis from the database if processing is completed.
    Otherwise report processing state.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status == "completed":
        try:
            entities = json.loads(doc.entities) if doc.entities else []
        except:
            entities = []

        return {
            "document_id": doc.id,
            "status": doc.status,
            "ocr_text": doc.extracted_text or "No text was extracted.",
            "entities": entities,
            "summary": doc.summary or "Summary not available.",
            "document_type": doc.document_type or "Unknown",
        }
    else:
        # Still processing or failed
        return {
            "document_id": doc.id,
            "status": doc.status,
            "ocr_text": "...",
            "entities": [],
            "summary": doc.status.capitalize() + "...",
            "document_type": "...",
        }


@router.post("/documents/{document_id}/query")
def query_document(document_id: str, request: QueryRequest):
    """
    Real RAG interface endpoint wrapper.
    It queries the context in FAISS and passes it to ChatGPT.
    """
    result = DocumentRAG.query_document(document_id, request.query)
    # The output format is already {"answer": str, "sources": list}
    return result
