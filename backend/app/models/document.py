from sqlalchemy import Column, String, DateTime, Integer, Text
from datetime import datetime
from ..core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    filename = Column(String)
    file_path = Column(String)
    file_size = Column(Integer)
    status = Column(String, default="uploaded")  # queued, processing, completed, failed
    created_at = Column(DateTime, default=datetime.now)
    completed_at = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=True)
    entities = Column(Text, nullable=True)  # Store JSON array string here
    extracted_text = Column(Text, nullable=True)  # Store the raw OCR/PDF extracted text
    document_type = Column(String, nullable=True)  # Auto-classification result
    anomalies = Column(Text, nullable=True)  # Store JSON array of warnings/anomalies
