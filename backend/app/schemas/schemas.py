"""
Pydantic Schemas for API Validation
====================================

WHAT ARE PYDANTIC SCHEMAS?
--------------------------
Pydantic schemas are like TypeScript interfaces - they define the shape of your data.
FastAPI uses them to:
1. Validate incoming request data
2. Serialize outgoing response data
3. Generate API documentation automatically

COMPARISON WITH FLASK:
----------------------
Flask (manual validation):
    @app.route('/products', methods=['POST'])
    def create_product():
        data = request.json
        if 'name' not in data:
            return {'error': 'name required'}, 400
        if not isinstance(data['price'], (int, float)):
            return {'error': 'price must be number'}, 400
        # ... more validation

FastAPI (automatic with Pydantic):
    @app.post('/products')
    def create_product(product: ProductCreate):
        # Validation happens automatically!
        # If data is invalid, FastAPI returns 422 error
        pass

TYPESCRIPT PARALLEL:
-------------------
Think of Pydantic schemas like TypeScript interfaces:
    
    // TypeScript
    interface Product {
        id: number;
        name: string;
        price: number;
    }
    
    # Pydantic
    class Product(BaseModel):
        id: int
        name: str
        price: float
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# ====================
# Category Schemas
# ====================

class CategoryBase(BaseModel):
    """Base category fields shared by all category schemas"""
    name: str
    slug: str


class CategoryCreate(CategoryBase):
    """Schema for creating a new category"""
    pass


class Category(CategoryBase):
    """
    Schema for category responses (includes id)

    Config:
        from_attributes = True allows Pydantic to read data from SQLAlchemy models
        (Previously called orm_mode = True in Pydantic v1)
    """
    id: int

    class Config:
        from_attributes = True


# ====================
# Product Image Schema
# ====================

class ProductImage(BaseModel):
    """Schema for product images"""
    id: int
    image_url: str
    is_primary: bool = False

    class Config:
        from_attributes = True


# ====================
# Product Schemas
# ====================

class ProductBase(BaseModel):
    """Base product fields"""
    name: str
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0)  # ge=0 means greater than or equal to 0
    mrp: Optional[Decimal] = Field(default=None, ge=0)  # Maximum Retail Price
    rating: Optional[Decimal] = Field(
        default=4.0, ge=0, le=5)  # Rating out of 5
    review_count: Optional[int] = Field(default=0, ge=0)  # Number of reviews
    stock: int = Field(default=100, ge=0)
    image_url: Optional[str] = None
    features: Optional[str] = None
    specifications: Optional[str] = None


class ProductCreate(ProductBase):
    """Schema for creating a product"""
    asin: str
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    """Schema for updating a product (all fields optional)"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    image_url: Optional[str] = None


class Product(ProductBase):
    """Schema for product responses"""
    id: int
    asin: str
    category_id: Optional[int] = None
    category: Optional[Category] = None
    images: List['ProductImage'] = []  # Multiple images for carousel
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProductList(BaseModel):
    """Schema for paginated product list"""
    products: List[Product]
    total: int
    page: int
    per_page: int


# ====================
# Cart Schemas
# ====================

class CartItemBase(BaseModel):
    """Base cart item fields"""
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemCreate(CartItemBase):
    """Schema for adding item to cart"""
    pass


class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity"""
    quantity: int = Field(..., ge=1)


class CartItem(CartItemBase):
    """Schema for cart item responses"""
    id: int
    product: Product  # Include full product details

    class Config:
        from_attributes = True


class Cart(BaseModel):
    """Schema for full cart with items"""
    id: int
    session_id: str
    items: List[CartItem] = []
    total_items: int = 0
    subtotal: Decimal = Decimal("0.00")

    class Config:
        from_attributes = True


# ====================
# Order Schemas
# ====================

class OrderItemCreate(BaseModel):
    """Schema for order item in order creation"""
    product_id: int
    quantity: int = Field(..., ge=1)


class OrderItemResponse(BaseModel):
    """Schema for order item in responses"""
    id: int
    product_id: int
    quantity: int
    price_at_purchase: Decimal
    product: Optional[Product] = None  # Include product to get name

    class Config:
        from_attributes = True


class ShippingAddress(BaseModel):
    """Schema for shipping address"""
    customer_name: str = Field(..., min_length=2, max_length=200)
    email: Optional[str] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    address_line1: str = Field(..., min_length=5, max_length=300)
    address_line2: Optional[str] = Field(default=None, max_length=300)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=5, max_length=20)


class OrderCreate(ShippingAddress):
    """Schema for creating an order"""
    session_id: str  # To get cart items


class Order(BaseModel):
    """Schema for order responses"""
    id: int
    order_number: str
    customer_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderConfirmation(BaseModel):
    """Schema for order confirmation response"""
    message: str
    order_number: str
    total_amount: Decimal
    estimated_delivery: str
