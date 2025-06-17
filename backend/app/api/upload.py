from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.file_processing import process_uploaded_file
from app.utils.security import sanitize_file

router = APIRouter(prefix="/api")

@router.post("/upload/{session_id}")
async def upload_resume(session_id: str, file: UploadFile = File(...)):
    try:
        # Validate filename
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
            
        # Read file content
        file_content = await file.read()
        
        # Process the uploaded file
        documents = await process_uploaded_file(file_content, file.filename, session_id)
        
        return {
            "message": "File uploaded and processed successfully",
            "filename": file.filename,
            "file_size": len(file_content),
            "document_count": len(documents)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))