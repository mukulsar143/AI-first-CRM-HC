from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..models import models
from ..schemas import schemas
from ..services.auth import get_admin_user, get_current_user
import random
from datetime import datetime

router = APIRouter()

@router.post("/run", response_model=schemas.DrawResponse)
def run_draw(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    # Generate 5 unique random numbers (1-45, matching common lottery/golf scores)
    numbers = random.sample(range(1, 46), 5)
    
    draw = models.Draw(
        numbers=numbers,
        status="published"
    )
    db.add(draw)
    db.commit()
    db.refresh(draw)

    # Winner detection logic
    all_users = db.query(models.User).filter(models.User.subscription_status == "active").all()
    
    for user in all_users:
        user_scores = [s.score for s in user.scores]
        if not user_scores:
            continue
            
        matches = len(set(numbers).intersection(set(user_scores)))
        
        if matches >= 3:
            prize_pool_share = {3: 0.25, 4: 0.35, 5: 0.40}
            # Simplified prize calculation based on active users
            base_prize = 100.0 # Placeholder logic for MVP
            prize = base_prize * prize_pool_share[matches]
            
            winner = models.Winner(
                user_id=user.id,
                draw_id=draw.id,
                match_type=matches,
                prize_amount=prize,
                status="pending"
            )
            db.add(winner)
    
    db.commit()
    return draw

@router.get("/latest", response_model=schemas.DrawResponse)
def get_latest_draw(db: Session = Depends(get_db)):
    draw = db.query(models.Draw).order_by(models.Draw.created_at.desc()).first()
    if not draw:
        raise HTTPException(status_code=404, detail="No draws found")
    return draw

@router.get("/my-winnings", response_model=list[dict])
def get_my_winnings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    winnings = db.query(models.Winner).filter(models.Winner.user_id == current_user.id).all()
    return [{
        "draw_id": w.draw_id,
        "match_type": w.match_type,
        "prize_amount": w.prize_amount,
        "status": w.status,
        "date": w.draw.created_at
    } for w in winnings]
