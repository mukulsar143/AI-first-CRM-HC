from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..models import models
from ..schemas import schemas
from ..services.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=list[schemas.CharityResponse])
def get_charities(db: Session = Depends(get_db)):
    return db.query(models.Charity).all()

@router.post("/select", response_model=schemas.UserCharityResponse)
def select_charity(
    selection: schemas.UserCharityBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if charity exists
    charity = db.query(models.Charity).filter(models.Charity.id == selection.charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")

    # Update or create selection
    db_selection = db.query(models.UserCharity).filter(
        models.UserCharity.user_id == current_user.id
    ).first()

    if db_selection:
        db_selection.charity_id = selection.charity_id
        db_selection.percentage = selection.percentage
    else:
        db_selection = models.UserCharity(
            user_id=current_user.id,
            charity_id=selection.charity_id,
            percentage=selection.percentage
        )
        db.add(db_selection)
    
    db.commit()
    db.refresh(db_selection)
    return db_selection

@router.get("/me", response_model=schemas.UserCharityResponse)
def get_my_charity(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    selection = db.query(models.UserCharity).filter(
        models.UserCharity.user_id == current_user.id
    ).first()
    if not selection:
        raise HTTPException(status_code=404, detail="No charity selected")
    return selection
