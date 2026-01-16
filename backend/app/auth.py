"""
Authentication Utilities
=========================

WHAT THIS MODULE DOES:
---------------------
1. Password hashing with bcrypt (NEVER store plain passwords!)
2. JWT token creation and verification
3. Dependency to get current user from token

SECURITY CONCEPTS:
-----------------
PASSWORD HASHING:
    - bcrypt is a one-way hash function
    - Even if database is leaked, passwords can't be recovered
    - Each hash includes a random "salt" for extra security
    
    Plain password → bcrypt → "$2b$12$abc..." (irreversible)

JWT TOKENS:
    - JSON Web Tokens are signed, not encrypted
    - Anyone can READ the payload, but can't FAKE the signature
    - Server signs with SECRET_KEY, later verifies signature
    
    Header.Payload.Signature
    {"sub": "user@email.com", "exp": 1234567890}
"""

from datetime import datetime, timedelta
from typing import Optional
import os

from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User

# ===================
# Configuration
# ===================

# SECRET_KEY - Used to sign JWT tokens
# In production, use a secure random string from environment variable
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production-to-random-string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


# ===================
# Password Hashing
# ===================

def hash_password(password: str) -> str:
    """
    Hash a plain password for storage using bcrypt.
    
    Example:
        hash_password("mypassword123")
        → "$2b$12$xyz..." (60 character hash)
    """
    # Encode password to bytes, generate salt, and hash
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Example:
        verify_password("mypassword123", "$2b$12$xyz...")  → True
        verify_password("wrongpassword", "$2b$12$xyz...")  → False
    """
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


# ===================
# JWT Token Handling
# ===================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Payload to encode (usually {"sub": user_id or email})
        expires_delta: How long until token expires
        
    Returns:
        Encoded JWT string
        
    Example:
        create_access_token({"sub": "user@example.com"})
        → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Sign the token with our secret key
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT token.
    
    Returns:
        Payload dict if valid, None if invalid/expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ===================
# FastAPI Dependencies
# ===================

# OAuth2PasswordBearer extracts token from Authorization header
# tokenUrl is the endpoint where tokens are obtained (for Swagger docs)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependency to get current logged-in user.
    
    Returns:
        User object if token is valid, None otherwise
        
    Usage in route:
        @router.get("/me")
        def get_me(user: User = Depends(get_current_user)):
            return user
    """
    if not token:
        return None
    
    payload = decode_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    # Get user from database
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user


async def require_auth(
    user: Optional[User] = Depends(get_current_user)
) -> User:
    """
    Dependency that REQUIRES authentication.
    Raises 401 if not authenticated.
    
    Usage in route:
        @router.get("/orders")
        def get_orders(user: User = Depends(require_auth)):
            # Only reaches here if authenticated
            return user.orders
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
