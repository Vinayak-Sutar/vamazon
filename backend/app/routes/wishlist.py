"""
Wishlist Routes for FastAPI
============================

Handles user wishlist functionality - add, remove, and list wishlist items.
Requires authentication - user must be logged in to manage wishlist.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from app.database import get_db
from app.models.models import WishlistItem, Product, User
from app.auth import require_auth

router = APIRouter()


class WishlistItemResponse(BaseModel):
    """Response schema for wishlist items"""
    id: int
    product_id: int
    product: dict  # Will include product details

    class Config:
        from_attributes = True


@router.get("/", response_model=list[WishlistItemResponse])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Get all wishlist items for the logged-in user.
    Includes full product details.
    """
    items = db.query(WishlistItem).options(
        joinedload(WishlistItem.product)
    ).filter(WishlistItem.user_id == current_user.id).all()
    
    # Transform to response format
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "product_id": item.product_id,
            "product": {
                "id": item.product.id,
                "name": item.product.name,
                "price": float(item.product.price),
                "image_url": item.product.image_url,
                "stock": item.product.stock,
            }
        })
    
    return result


@router.post("/add/{product_id}")
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Add a product to the user's wishlist.
    Returns the wishlist item or existing if already in wishlist.
    """
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in wishlist
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if existing:
        return {"message": "Already in wishlist", "id": existing.id}
    
    # Add to wishlist
    wishlist_item = WishlistItem(
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    
    return {"message": "Added to wishlist", "id": wishlist_item.id}


@router.delete("/remove/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Remove a product from the user's wishlist.
    """
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Removed from wishlist"}


@router.get("/check/{product_id}")
def check_in_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Check if a product is in the user's wishlist.
    """
    exists = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first() is not None
    
    return {"in_wishlist": exists}


@router.get("/ids")
def get_wishlist_product_ids(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Get just the product IDs in the user's wishlist.
    Useful for checking multiple products at once.
    """
    items = db.query(WishlistItem.product_id).filter(
        WishlistItem.user_id == current_user.id
    ).all()
    
    return {"product_ids": [item[0] for item in items]}
