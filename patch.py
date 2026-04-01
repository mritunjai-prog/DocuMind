import os

file_path = "backend/app/routes/upload.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_routes = """
from fastapi.responses import FileResponse
import os

@router.get("/documents/{document_id}/download")
def download_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not doc.file_path or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(path=doc.file_path, filename=doc.filename)

@router.delete("/documents/duplicates")
def remove_duplicates(user_id: str = "guest_user", db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == user_id).all()
    # Sort docs by created_at descending so newer docs come first
    docs_sorted = sorted(docs, key=lambda x: x.created_at, reverse=True) if docs else []
    seen = set()
    duplicates_deleted = 0
    for doc in docs_sorted:
        if doc.filename in seen:
            db.delete(doc)
            # Optional: remove file from disk
            try:
                if doc.file_path and os.path.exists(doc.file_path):
                    os.remove(doc.file_path)
            except BaseException:
                pass
            duplicates_deleted += 1
        else:
            seen.add(doc.filename)
    db.commit()
    return {"message": f"Deleted {duplicates_deleted} duplicate files from account."}
"""

if '@router.get("/documents/{document_id}/download")' not in content:
    with open(file_path, "a", encoding="utf-8") as f:
        f.write("\n" + new_routes)
    print("Added backend routes successfully.")
else:
    print("Routes already exist.")
