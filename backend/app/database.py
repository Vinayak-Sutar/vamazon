"""
Database Configuration for FastAPI
===================================

COMPARISON WITH FLASK-SQLALCHEMY:
---------------------------------
Flask-SQLAlchemy:
    from flask_sqlalchemy import SQLAlchemy
    db = SQLAlchemy(app)
    
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)

FastAPI + SQLAlchemy:
    - Uses raw SQLAlchemy (more control)
    - Requires manual session management
    - Uses Pydantic for validation (separate from ORM)

This file sets up:
1. Database engine (connection to PostgreSQL)
2. Session factory (creates database sessions)
3. Base class for all models
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL
# Format: postgresql://username:password@host:port/database_name
# For local development, we'll use environment variables with a default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/amazon_clone"
)

# Create SQLAlchemy engine
# Similar to: db.create_engine() in Flask-SQLAlchemy but explicit
engine = create_engine(DATABASE_URL)

# SessionLocal is a factory that creates new database sessions
# Each request gets its own session (important for FastAPI's async nature)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
# In Flask-SQLAlchemy: db.Model
# In SQLAlchemy: declarative_base()
Base = declarative_base()


def get_db():
    """
    Dependency that creates a new database session for each request.
    
    In Flask, you might use @app.before_request/@app.teardown_request
    In FastAPI, we use dependency injection:
    
    @app.get("/items")
    def get_items(db: Session = Depends(get_db)):
        # db is automatically created and closed
        pass
    """
    db = SessionLocal()
    try:
        yield db  # This is a generator - session is created
    finally:
        db.close()  # Session is always closed after request
