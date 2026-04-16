from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String(10), nullable=False, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=False)

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    admin_requests = relationship(
        "AdminRequest",
        foreign_keys="AdminRequest.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reviewed_requests = relationship(
        "AdminRequest",
        foreign_keys="AdminRequest.reviewed_by",
        back_populates="reviewer",
    )
