from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..models import models
from ..schemas import schemas
from ..services.auth import get_admin_user, get_current_user

router = APIRouter()

@router.get("/users", response_model=list[schemas.UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    return db.query(models.User).all()

@router.post("/users/{user_id}/subscription")
def update_subscription(
    user_id: int,
    status: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.subscription_status = status
    db.commit()
    return {"success": True, "status": user.subscription_status}

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.subscription_status == "active").count()
    total_draws = db.query(models.Draw).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_draws": total_draws,
        "total_charity_contributions": active_users * 10.0 # Example calc
    }

@router.post("/charities", response_model=schemas.CharityResponse)
def add_charity(
    charity_in: schemas.CharityBase,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    charity = models.Charity(**charity_in.dict())
    db.add(charity)
    db.commit()
    db.refresh(charity)
    return charity
