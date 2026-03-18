import os
import shutil
from fastapi import UploadFile


class StorageService:
    def __init__(self, storage_dir: str = "storage/documents"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

    async def upload(self, file: UploadFile, bucket: str = "documents") -> str:
        """
        Mock implementation of uploading a file to a storage bucket like S3.
        In this local setup, it saves files to a local directory representing the bucket.
        """
        bucket_dir = os.path.join(self.storage_dir, bucket)
        os.makedirs(bucket_dir, exist_ok=True)

        file_path = os.path.join(bucket_dir, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return file_path
