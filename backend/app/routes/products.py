"""
Product Routes for FastAPI
===========================

This file contains all API endpoints related to products.

COMPARISON WITH FLASK:
----------------------
Flask Blueprint:
    from flask import Blueprint
    products_bp = Blueprint('products', __name__)
    
    @products_bp.route('/products', methods=['GET'])
    def get_products():
        products = Product.query.all()
        return jsonify([p.to_dict() for p in products])

FastAPI Router:
    from fastapi import APIRouter
    router = APIRouter()
    
    @router.get('/products')
    def get_products(db: Session = Depends(get_db)):
        products = db.query(Product).all()
        return products  # Auto-serialized via Pydantic!

KEY DIFFERENCES:
1. FastAPI uses APIRouter instead of Blueprint
2. FastAPI uses dependency injection for database sessions
3. FastAPI auto-serializes responses using Pydantic schemas
4. FastAPI generates OpenAPI docs automatically
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, List
from decimal import Decimal

from app.database import get_db
from app.models.models import Product, Category
from app.schemas.schemas import Product as ProductSchema, ProductList, Category as CategorySchema

# Create router - similar to Flask Blueprint
router = APIRouter()


@router.get("/", response_model=ProductList)
def get_products(
    search: Optional[str] = Query(None, description="Search products by name"),
    category: Optional[str] = Query(None, description="Filter by category slug"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(12, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    Get all products with optional filtering.
    
    LEARNING: Query Parameters in FastAPI
    --------------------------------------
    FastAPI automatically:
    1. Validates query parameters (ge=0 means >= 0)
    2. Converts types (str to float)
    3. Documents them in Swagger UI
    
    Compare to Flask:
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        # Manual validation needed!
    """
    # Start building query
    query = db.query(Product).options(joinedload(Product.category))
    
    # Apply search filter
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
        )
    
    # Apply category filter
    if category:
        query = query.join(Category).filter(Category.slug == category)
    
    # Apply price filters
    if min_price is not None:
        query = query.filter(Product.price >= Decimal(str(min_price)))
    if max_price is not None:
        query = query.filter(Product.price <= Decimal(str(max_price)))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    
    return ProductList(
        products=products,
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/{product_id}", response_model=ProductSchema)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single product by ID.
    
    LEARNING: Path Parameters
    -------------------------
    In FastAPI, path parameters are automatically:
    1. Extracted from the URL
    2. Converted to the specified type (int)
    3. Documented in Swagger
    
    Compare to Flask:
        @app.route('/products/<int:product_id>')
        def get_product(product_id):
            product = Product.query.get_or_404(product_id)
    """
    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product


@router.get("/by-asin/{asin}", response_model=ProductSchema)
def get_product_by_asin(
    asin: str,
    db: Session = Depends(get_db)
):
    """Get a product by its Amazon Standard Identification Number (ASIN)."""
    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(Product.asin == asin).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product
