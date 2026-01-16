"""
Cart Routes for FastAPI
========================

Implements shopping cart functionality with session-based cart management.
No authentication required - carts are identified by session ID.

CART FLOW:
1. Frontend generates a unique session ID (stored in localStorage)
2. Cart operations use this session ID to identify the cart
3. Cart persists across browser sessions
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models.models import Cart, CartItem, Product
from app.schemas.schemas import (
    Cart as CartSchema,
    CartItemCreate,
    CartItemUpdate,
)

router = APIRouter()


def get_or_create_cart(db: Session, session_id: str) -> Cart:
    """Get existing cart or create a new one for the session."""
    cart = db.query(Cart).filter(Cart.session_id == session_id).first()
    
    if not cart:
        cart = Cart(session_id=session_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    return cart


@router.get("/{session_id}", response_model=CartSchema)
def get_cart(session_id: str, db: Session = Depends(get_db)):
    """
    Get cart for a session. Creates empty cart if none exists.
    """
    cart = get_or_create_cart(db, session_id)
    
    # Eager load items and their products
    cart = db.query(Cart).options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).filter(Cart.id == cart.id).first()
    
    return cart


@router.post("/{session_id}/items", response_model=CartSchema)
def add_to_cart(
    session_id: str,
    item: CartItemCreate,
    db: Session = Depends(get_db)
):
    """
    Add a product to the cart.
    If product already in cart, increases quantity.
    """
    cart = get_or_create_cart(db, session_id)
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if product already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item.product_id
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += item.quantity
    else:
        # Add new item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)
    
    db.commit()
    
    # Return updated cart
    cart = db.query(Cart).options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).filter(Cart.id == cart.id).first()
    
    return cart


@router.put("/{session_id}/items/{item_id}", response_model=CartSchema)
def update_cart_item(
    session_id: str,
    item_id: int,
    update: CartItemUpdate,
    db: Session = Depends(get_db)
):
    """Update quantity of a cart item."""
    cart = db.query(Cart).filter(Cart.session_id == session_id).first()
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if update.quantity <= 0:
        # Remove item if quantity is 0 or less
        db.delete(cart_item)
    else:
        cart_item.quantity = update.quantity
    
    db.commit()
    
    # Return updated cart
    cart = db.query(Cart).options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).filter(Cart.id == cart.id).first()
    
    return cart


@router.delete("/{session_id}/items/{item_id}", response_model=CartSchema)
def remove_from_cart(
    session_id: str,
    item_id: int,
    db: Session = Depends(get_db)
):
    """Remove an item from the cart."""
    cart = db.query(Cart).filter(Cart.session_id == session_id).first()
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    
    # Return updated cart
    cart = db.query(Cart).options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).filter(Cart.id == cart.id).first()
    
    return cart


@router.delete("/{session_id}", response_model=dict)
def clear_cart(session_id: str, db: Session = Depends(get_db)):
    """Clear all items from the cart."""
    cart = db.query(Cart).filter(Cart.session_id == session_id).first()
    
    if not cart:
        return {"message": "Cart already empty"}
    
    # Delete all items
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    
    return {"message": "Cart cleared"}
