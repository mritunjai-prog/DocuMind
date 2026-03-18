import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.document import Document
from app.services.storage import StorageService
from app.services.rag import DocumentRAG

router = APIRouter()
storage = StorageService()


async def virus_scan(file: UploadFile) -> bool:
    # A mock virus scan placeholder. Always returns True.
    return True


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

        # Queueing logic: Now using our real RAG processor!
        background_tasks.add_task(
            DocumentRAG.process_document_into_rag, doc_id, file_path
        )

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


@router.get("/documents/{document_id}/analysis")
def get_document_analysis(document_id: str):
    return DocumentRAG.analyze_document(document_id)


@router.post("/documents/{document_id}/query")
def query_document(document_id: str, request: QueryRequest):
    """
    Real RAG interface endpoint wrapper.
    It queries the context in FAISS and passes it to ChatGPT.
    """
    result = DocumentRAG.query_document(document_id, request.query)
    # The output format is already {"answer": str, "sources": list}
    return result

