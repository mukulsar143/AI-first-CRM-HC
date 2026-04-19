from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    subscription_status = Column(String, default="inactive") # active, inactive
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scores = relationship("Score", back_populates="user")
    charity_selection = relationship("UserCharity", back_populates="user", uselist=False)
    winnings = relationship("Winner", back_populates="user")

class Score(Base):
    __tablename__ = "scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    score = Column(Integer, nullable=False) # 1-45
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scores")

class Charity(Base):
    __tablename__ = "charities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    image_url = Column(String)

    user_selections = relationship("UserCharity", back_populates="charity")

class UserCharity(Base):
    __tablename__ = "user_charities"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    charity_id = Column(Integer, ForeignKey("charities.id"))
    percentage = Column(Integer, default=10) # Minimum 10%

    user = relationship("User", back_populates="charity_selection")
    charity = relationship("Charity", back_populates="user_selections")

class Draw(Base):
    __tablename__ = "draws"
    id = Column(Integer, primary_key=True, index=True)
    numbers = Column(JSON, nullable=False) # 5 random numbers
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="published") # simulated, published

    winners = relationship("Winner", back_populates="draw")

class Winner(Base):
    __tablename__ = "winners"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    draw_id = Column(Integer, ForeignKey("draws.id"))
    match_type = Column(Integer) # 3, 4, 5
    prize_amount = Column(Float)
    status = Column(String, default="pending") # pending, paid

    user = relationship("User", back_populates="winnings")
    draw = relationship("Draw", back_populates="winners")
