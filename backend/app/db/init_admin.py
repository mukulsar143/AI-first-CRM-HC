from sqlalchemy.orm import Session

from ..models.models import User
from ..services.auth import get_password_hash


DEFAULT_ADMIN_EMAIL = "admin@test.com"
DEFAULT_ADMIN_PASSWORD = "admin123"


def create_default_admin(db: Session):
    existing_admin = db.query(User).filter(User.is_admin == True).first()
    if existing_admin:
        return existing_admin

    existing_user = db.query(User).filter(User.email == DEFAULT_ADMIN_EMAIL).first()
    if existing_user:
        existing_user.is_admin = True
        existing_user.subscription_status = "active"
        db.commit()
        db.refresh(existing_user)
        return existing_user

    admin_user = User(
        email=DEFAULT_ADMIN_EMAIL,
        hashed_password=get_password_hash(DEFAULT_ADMIN_PASSWORD),
        is_admin=True,
        subscription_status="active",
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user
