"""
Database Initialization Script
===============================

This script creates all tables defined in models.py
Run this once to initialize the database schema.
"""

from app.models.models import (
    Category, Product, ProductImage, User, Cart, CartItem,
    Order, OrderItem, WishlistItem
)
from app.database import engine, Base
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


def init_db():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")

    # List created tables
    print("\nTables created:")
    for table in Base.metadata.tables:
        print(f"  - {table}")


if __name__ == "__main__":
    init_db()
