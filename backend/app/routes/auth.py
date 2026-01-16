"""
Auth Routes for FastAPI
========================

Handles user registration, login, and profile retrieval.
Uses JWT tokens for authentication.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.database import get_db
from app.models.models import User
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_auth,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()


# ===================
# Pydantic Schemas
# ===================

class UserRegister(BaseModel):
    """Schema for user registration"""
    email: str = Field(..., min_length=5, max_length=200)
    password: str = Field(..., min_length=6, max_length=100)
    name: str = Field(..., min_length=2, max_length=200)


class UserLogin(BaseModel):
    """Schema for user login"""
    email: str
    password: str


class Token(BaseModel):
    """Schema for auth token response"""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema for user response (excludes password)"""
    id: int
    email: str
    name: str
    
    class Config:
        from_attributes = True


class TokenWithUser(BaseModel):
    """Schema for login response with user info"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ===================
# Auth Routes
# ===================

@router.post("/register", response_model=TokenWithUser)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Flow:
    1. Check if email already exists
    2. Hash the password (NEVER store plain!)
    3. Create user in database
    4. Return JWT token + user info
    """
    # Check if email already taken
    existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user with hashed password
    user = User(
        email=user_data.email.lower(),
        password_hash=hash_password(user_data.password),
        name=user_data.name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=TokenWithUser)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    
    Flow:
    1. Find user by email
    2. Verify password against hash
    3. Return JWT token + user info
    """
    # Find user
    user = db.query(User).filter(User.email == user_data.email.lower()).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login/form", response_model=Token)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2-compatible login endpoint for Swagger UI.
    Uses form data instead of JSON.
    """
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(require_auth)):
    """
    Get current user profile.
    Requires authentication.
    """
    return user


@router.get("/check")
def check_auth(user: Optional[User] = Depends(get_current_user)):
    """
    Check if user is authenticated.
    Returns user info if logged in, null otherwise.
    """
    if user:
        return {
            "authenticated": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        }
    return {"authenticated": False, "user": None}
