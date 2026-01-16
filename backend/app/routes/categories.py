"""
Category Routes for FastAPI
============================

Simple CRUD endpoints for product categories.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Category
from app.schemas.schemas import Category as CategorySchema

router = APIRouter()


@router.get("/", response_model=List[CategorySchema])
def get_categories(db: Session = Depends(get_db)):
    """
    Get all product categories.
    
    Returns a list of categories with their names and slugs.
    Used for the category filter dropdown on the frontend.
    """
    categories = db.query(Category).all()
    return categories


@router.get("/{category_slug}", response_model=CategorySchema)
def get_category(category_slug: str, db: Session = Depends(get_db)):
    """Get a single category by its slug."""
    category = db.query(Category).filter(Category.slug == category_slug).first()
    if not category:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Category not found")
    return category
