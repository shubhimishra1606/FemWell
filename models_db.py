from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__="users"
    id=Column(Integer, primary_key=True, index=True)
    email=Column(String, unique=True, index=True)
    hashed_password=Column(String)
    created_at=Column(DateTime, default=datetime.utcnow)
    predictions=relationship("PredictionHistory", back_populates="user")

class PredictionHistory(Base):
    __tablename__="prediction_history"
    id = Column(Integer, primary_key=True, index=True)         # primary key
    user_id = Column(Integer, ForeignKey("users.id"))  
    condition_type = Column(String)
    result = Column(String)
    confidence_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="predictions")