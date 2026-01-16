"""
Order Routes for FastAPI
=========================

Handles order creation and retrieval.
Orders are created from cart items with shipping address.
Requires authentication - user must be logged in to place orders.
"""

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
import uuid

from app.database import get_db
from app.models.models import Order, OrderItem, Cart, CartItem, Product, User
from app.schemas.schemas import Order as OrderSchema, OrderCreate
from app.auth import require_auth
from app.email_service import send_order_confirmation_email

router = APIRouter()


def generate_order_number() -> str:
    """Generate a unique order number like Amazon."""
    timestamp = datetime.now().strftime("%Y%m%d")
    unique_id = uuid.uuid4().hex[:8].upper()
    return f"ORD-{timestamp}-{unique_id}"


@router.post("/", response_model=OrderSchema)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)  # Requires login!
):
    """
    Create a new order from the cart.
    REQUIRES AUTHENTICATION.

    Flow:
    1. Get cart for the session
    2. Validate cart has items
    3. Create order with shipping info + user_id
    4. Create order items from cart items
    5. Clear the cart
    6. Return order
    """
    # Get cart
    cart = db.query(Cart).options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).filter(Cart.session_id == order_data.session_id).first()

    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate total
    total_amount = sum(
        float(item.product.price) * item.quantity
        for item in cart.items
    )

    # Create order with user_id from authenticated user
    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,  # Link to authenticated user
        customer_name=order_data.customer_name,
        email=order_data.email,
        phone=order_data.phone,
        address_line1=order_data.address_line1,
        address_line2=order_data.address_line2,
        city=order_data.city,
        state=order_data.state,
        pincode=order_data.pincode,
        total_amount=total_amount,
        status="confirmed"
    )
    db.add(order)
    db.flush()  # Get the order ID

    # Create order items
    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price_at_purchase=float(cart_item.product.price)
        )
        db.add(order_item)

    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    db.commit()
    db.refresh(order)

    # Load order items for response
    order = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order.id).first()

    # Send confirmation email
    try:
        order_items_for_email = [
            {
                "name": item.product.name,
                "quantity": item.quantity,
                "price": float(item.price_at_purchase) * item.quantity,
                "image_url": item.product.image_url
            }
            for item in order.items
        ]
        send_order_confirmation_email(
            to_email=order.email,
            customer_name=order.customer_name,
            order_number=order.order_number,
            order_items=order_items_for_email,
            total_amount=float(order.total_amount),
            shipping_address={
                "address_line1": order.address_line1,
                "address_line2": order.address_line2,
                "city": order.city,
                "state": order.state,
                "pincode": order.pincode
            }
        )
    except Exception as e:
        print(f"Email sending failed: {e}")  # Don't fail order if email fails

    return order


@router.get("/{order_number}", response_model=OrderSchema)
def get_order(order_number: str, db: Session = Depends(get_db)):
    """Get an order by its order number."""
    order = db.query(Order).options(
        joinedload(Order.items)
    ).filter(Order.order_number == order_number).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


class BuyNowCreate(BaseModel):
    """Schema for Buy Now order creation."""
    product_id: int
    quantity: int = 1
    customer_name: str = Field(..., min_length=2)
    email: str
    phone: str
    address_line1: str
    address_line2: str = ""
    city: str
    state: str
    pincode: str


@router.post("/buy-now", response_model=OrderSchema)
def create_buy_now_order(
    order_data: BuyNowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Create an order directly from a single product (Buy Now).
    Bypasses the cart for instant checkout.
    REQUIRES AUTHENTICATION.
    """
    # Get the product
    product = db.query(Product).filter(
        Product.id == order_data.product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock < order_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    # Calculate total
    total_amount = float(product.price) * order_data.quantity

    # Create order
    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        customer_name=order_data.customer_name,
        email=order_data.email,
        phone=order_data.phone,
        address_line1=order_data.address_line1,
        address_line2=order_data.address_line2,
        city=order_data.city,
        state=order_data.state,
        pincode=order_data.pincode,
        total_amount=total_amount,
        status="confirmed"
    )
    db.add(order)
    db.flush()

    # Create order item
    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        quantity=order_data.quantity,
        price_at_purchase=float(product.price)
    )
    db.add(order_item)

    # Update product stock
    product.stock -= order_data.quantity

    db.commit()
    db.refresh(order)

    # Load order with items
    order = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order.id).first()

    # Send confirmation email
    try:
        order_items_for_email = [
            {
                "name": product.name,
                "quantity": order_data.quantity,
                "price": float(product.price) * order_data.quantity,
                "image_url": product.image_url
            }
        ]
        send_order_confirmation_email(
            to_email=order.email,
            customer_name=order.customer_name,
            order_number=order.order_number,
            order_items=order_items_for_email,
            total_amount=float(order.total_amount),
            shipping_address={
                "address_line1": order.address_line1,
                "address_line2": order.address_line2,
                "city": order.city,
                "state": order.state,
                "pincode": order.pincode
            }
        )
    except Exception as e:
        print(f"Email sending failed: {e}")  # Don't fail order if email fails

    return order


@router.get("/", response_model=list[OrderSchema])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)
):
    """
    Get all orders for the logged-in user.
    Requires authentication.
    """
    orders = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

    return orders
