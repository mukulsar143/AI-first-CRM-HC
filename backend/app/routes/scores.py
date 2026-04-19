from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db.session import get_db
from ..models import models
from ..schemas import schemas
from ..services.auth import get_current_user
from datetime import date

router = APIRouter()

@router.post("/", response_model=schemas.ScoreResponse)
def create_score(
    score_in: schemas.ScoreCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check for duplicate date
    existing_score = db.query(models.Score).filter(
        models.Score.user_id == current_user.id,
        models.Score.date == score_in.date
    ).first()
    
    if existing_score:
        raise HTTPException(status_code=400, detail="Score already exists for this date")

    # Add new score
    new_score = models.Score(
        user_id=current_user.id,
        score=score_in.score,
        date=score_in.date
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)

    # Maintain rolling 5 logic
    user_scores = db.query(models.Score).filter(
        models.Score.user_id == current_user.id
    ).order_by(desc(models.Score.date)).all()

    if len(user_scores) > 5:
        # Delete oldest scores beyond the latest 5
        to_delete = user_scores[5:]
        for s in to_delete:
            db.delete(s)
        db.commit()
        db.refresh(new_score)

    return new_score

@router.get("/", response_model=list[schemas.ScoreResponse])
def get_scores(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Score).filter(
        models.Score.user_id == current_user.id
    ).order_by(desc(models.Score.date)).all()

@router.delete("/{score_id}")
def delete_score(
    score_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    score = db.query(models.Score).filter(
        models.Score.id == score_id,
        models.Score.user_id == current_user.id
    ).first()
    
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
        
    db.delete(score)
    db.commit()
    return {"success": True}
