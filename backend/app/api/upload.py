from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.file_processing import process_uploaded_file
from app.utils.security import sanitize_file

router = APIRouter()

@router.post("/upload/")
async def upload_resume(file: UploadFile = File(...)):
    # Sanitize the uploaded file
    sanitized_file = sanitize_file(file)

    # Process the uploaded file and extract text
    try:
        result = await process_uploaded_file(sanitized_file)
        return {"filename": result["filename"], "file_size": result["file_size"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))