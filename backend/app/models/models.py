"""
Database Models for Vamazon
=================================

These are SQLAlchemy ORM models that define our database tables.

COMPARISON WITH FLASK-SQLALCHEMY:
---------------------------------
Flask-SQLAlchemy:
    class Product(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(200), nullable=False)

SQLAlchemy (standalone):
    class Product(Base):
        __tablename__ = "products"
        id = Column(Integer, primary_key=True)
        name = Column(String(200), nullable=False)

KEY DIFFERENCES:
1. We define __tablename__ explicitly
2. We inherit from Base (not db.Model)
3. Import Column, Integer, etc. from sqlalchemy directly
"""

from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    """
    Product categories (e.g., Electronics, Books, Office Supplies)

    TABLE STRUCTURE:
    - id: Primary key
    - name: Category display name (e.g., "Office Supplies")
    - slug: URL-friendly name (e.g., "office_and_school_supplies")
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)

    # Relationship: One category has many products
    # In Flask-SQLAlchemy: products = db.relationship('Product', backref='category')
    products = relationship("Product", back_populates="category")


class User(Base):
    """
    User accounts for authentication

    TABLE STRUCTURE:
    - id: Primary key
    - email: Unique email for login
    - password_hash: bcrypt hashed password (NEVER store plain passwords!)
    - name: Display name
    - created_at: Account creation timestamp
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    name = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    cart = relationship("Cart", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user")


class Product(Base):
    """
    Products - the main items for sale

    TABLE STRUCTURE:
    - id: Primary key
    - asin: Amazon Standard Identification Number (from dataset)
    - name: Product title
    - description: Detailed product description
    - price: Product price (we'll generate random prices since dataset doesn't have them)
    - stock: Available inventory
    - image_url: Main product image URL
    - category_id: Foreign key to categories table
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    asin = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(500), nullable=False)
    description = Column(Text)  # From labels/tech_process in dataset
    price = Column(Numeric(10, 2), nullable=False)  # Selling price
    # Maximum Retail Price (original price)
    mrp = Column(Numeric(10, 2), nullable=True)
    rating = Column(Numeric(2, 1), default=4.0)  # Rating out of 5 (e.g., 4.3)
    review_count = Column(Integer, default=0)  # Number of reviews
    stock = Column(Integer, default=100)
    image_url = Column(String(500))
    features = Column(Text)  # Bullet points from feature-bullets
    specifications = Column(Text)  # From tech_data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Foreign key to categories
    category_id = Column(Integer, ForeignKey("categories.id"))

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")


class ProductImage(Base):
    """
    Additional product images for the carousel

    For the HuggingFace dataset, we only have one image per product,
    but this structure allows multiple images.
    """
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)

    # Relationship back to product
    product = relationship("Product", back_populates="images")


class Cart(Base):
    """
    Shopping cart - can be identified by session_id (guest) or user_id (logged in)

    Guest users: cart is tracked by session_id (stored in browser)
    Logged-in users: cart is linked to user_id
    On login, guest cart merges into user cart.
    """
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True,
                        nullable=True, index=True)  # For guests
    user_id = Column(Integer, ForeignKey("users.id"), unique=True,
                     nullable=True, index=True)  # For logged-in users
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    items = relationship("CartItem", back_populates="cart",
                         cascade="all, delete-orphan")
    user = relationship("User", back_populates="cart")


class CartItem(Base):
    """
    Individual items in a cart

    Links a product to a cart with a quantity
    """
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    """
    Completed orders - linked to authenticated users

    Contains shipping information and order status.
    Orders require a logged-in user (user_id is required).
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     nullable=False, index=True)  # Auth required

    # Customer info (from user profile, can be edited at checkout)
    customer_name = Column(String(200), nullable=False)
    email = Column(String(200))
    phone = Column(String(20))

    # Shipping address
    address_line1 = Column(String(300), nullable=False)
    address_line2 = Column(String(300))
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)

    # Order details
    total_amount = Column(Numeric(12, 2), nullable=False)
    # confirmed, processing, shipped, delivered
    status = Column(String(50), default="confirmed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    items = relationship("OrderItem", back_populates="order",
                         cascade="all, delete-orphan")
    user = relationship("User", back_populates="orders")


class OrderItem(Base):
    """
    Individual items in an order

    We store price at time of purchase (since product prices can change)
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(
        Numeric(10, 2), nullable=False)  # Price when ordered

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class WishlistItem(Base):
    """
    User wishlist items

    Users can save products they're interested in for later.
    Each user can have many wishlist items.
    """
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     nullable=False, index=True)
    product_id = Column(Integer, ForeignKey(
        "products.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")
