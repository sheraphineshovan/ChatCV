from fastapi import UploadFile, HTTPException
import os

def sanitize_file(file: UploadFile) -> UploadFile:
    # Check file size (limit to 5MB for example)
    if hasattr(file, "size"):
        if file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds the limit of 5MB.")
    # If UploadFile doesn't have .size, you may need to read the file and check len(content)

    # Check file extension
    allowed_extensions = {'.pdf'}
    if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are allowed.")

    # Optionally scan for malware
    if not scan_file_for_malware(file):
        raise HTTPException(status_code=400, detail="Malware detected in file.")

    return file

def scan_file_for_malware(file: UploadFile) -> bool:
    # Placeholder for malware scanning logic
    # Integrate with a malware scanning service here
    return True  # Assume the file is safe for now

def secure_temp_file_path(filename: str) -> str:
    # Create a secure temporary file path
    temp_dir = "/tmp"  # Use a secure temporary directory
    return os.path.join(temp_dir, filename)