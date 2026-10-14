import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

# Normalize DATABASE_URL for SQLAlchemy 2.0 driver compatibility
raw_db_url = (
    os.getenv("DATABASE_URL")
    or os.getenv("DATABASE_URI")
    or "sqlite:///./local_test.db"
)

if raw_db_url.startswith("postgres://"):
    DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+"):
    DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    DATABASE_URL = raw_db_url

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_document_by_id(doc_id: str):
    from ..models.document import Document

    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return None
        return {
            "id": doc.id,
            "filename": doc.filename,
            "file_path": doc.file_path,
            "status": doc.status,
            "extracted_text": doc.extracted_text,
            "summary": doc.summary,
        }
    finally:
        db.close()

