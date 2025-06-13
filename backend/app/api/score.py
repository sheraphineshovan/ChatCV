from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from app.services.scoring import calculate_role_fit_score

router = APIRouter()

class ScoreRequest(BaseModel):
    resume_text: str
    role_criteria: Dict[str, str]

@router.post("/score/")
async def score_resume(score_request: ScoreRequest):
    try:
        score = calculate_role_fit_score(score_request.resume_text, score_request.role_criteria)
        return {"score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))