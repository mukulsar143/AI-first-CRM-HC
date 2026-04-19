from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import List, Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    subscription_status: str
    is_admin: bool
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ScoreBase(BaseModel):
    score: int = Field(..., ge=1, le=45)
    date: date

class ScoreCreate(ScoreBase):
    pass

class ScoreResponse(ScoreBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class CharityBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CharityResponse(CharityBase):
    id: int

    class Config:
        orm_mode = True

class UserCharityBase(BaseModel):
    charity_id: int
    percentage: int = Field(default=10, ge=10)

class UserCharityResponse(UserCharityBase):
    id: int
    user_id: int

class DrawResponse(BaseModel):
    id: int
    numbers: List[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SuccessResponse(BaseModel):
    success: bool = True
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
