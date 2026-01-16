"""
Database Seeder for Amazon Clone
=================================

This script:
1. Reads product data from HuggingFace parquet file
2. Generates missing fields (price, rating, stock, etc.)
3. Seeds the PostgreSQL database with complete product data

LEARNING: How SQLAlchemy seeding works
--------------------------------------
In Flask, you might use db.create_all() and then add objects:
    db.create_all()
    product = Product(name='Test')
    db.session.add(product)
    db.session.commit()

In FastAPI + SQLAlchemy, we use the engine and session directly:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    product = Product(name='Test')
    db.add(product)
    db.commit()
"""

import random
import pandas as pd
import ast
from decimal import Decimal
from pathlib import Path

# Add parent directory to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent))

from app.database import engine, SessionLocal, Base
from app.models.models import Category, Product, ProductImage


def parse_feature_bullets(raw_bullets) -> str:
    """
    Convert feature bullets from dataset format to clean text.
    
    Dataset format: numpy array of strings
    Output: "• feature1\n• feature2\n..."
    """
    try:
        import numpy as np
        
        # Handle numpy arrays
        if isinstance(raw_bullets, np.ndarray):
            bullets = raw_bullets.tolist()
            if isinstance(bullets, list):
                return "\n".join(f"• {str(bullet).strip()}" for bullet in bullets if bullet)
        
        # Handle lists directly
        if isinstance(raw_bullets, list):
            return "\n".join(f"• {str(bullet).strip()}" for bullet in raw_bullets if bullet)
        
        # Handle string representation
        if raw_bullets is not None and isinstance(raw_bullets, str):
            return raw_bullets
            
        return ""
    except Exception as e:
        print(f"   Warning: Could not parse feature bullets: {e}")
        return ""


def parse_tech_data(raw_tech) -> str:
    """
    Convert tech data from dataset format to readable specifications.
    
    Dataset format: numpy array of arrays
    Output: "Key: Value\nKey2: Value2\n..."
    """
    try:
        import numpy as np
        
        if isinstance(raw_tech, np.ndarray):
            specs = []
            for item in raw_tech:
                if isinstance(item, np.ndarray) and len(item) >= 2:
                    key = str(item[0]).strip()
                    value = str(item[1]).strip()
                    specs.append(f"{key}: {value}")
            return "\n".join(specs)
        
        return str(raw_tech) if raw_tech is not None else ""
    except Exception as e:
        print(f"   Warning: Could not parse tech data: {e}")
        return ""


def generate_price_by_category(category: str) -> tuple[Decimal, Decimal]:
    """
    Generate realistic price and MRP based on product category.
    
    Returns: (price, mrp)
    - MRP is always higher than price (to show discount)
    """
    # Price ranges by category (in INR)
    price_ranges = {
        "laptop_computer": (35000, 85000),
        "tablets": (15000, 45000),
        "smartwatches": (3000, 25000),
        "smart_home_products": (1500, 8000),
        "computer_monitor_stands": (800, 3500),
        "computer_accessories": (500, 5000),
        "computer_data_storage": (2000, 15000),
        "office_and_school_supplies": (200, 2000),
        "office_electronics": (1000, 10000),
        "projector_mounts": (500, 3000),
    }
    
    min_price, max_price = price_ranges.get(category, (500, 5000))
    
    # Generate a realistic price (not round numbers for authenticity)
    base_price = random.randint(min_price, max_price)
    # Add some cents for realism (e.g., 1299 instead of 1300)
    if base_price > 1000:
        price = base_price - random.choice([1, 1, 1, 0]) + random.choice([0, 99, 49, 0])
    else:
        price = base_price
    
    # MRP is 15-40% higher than selling price
    markup = random.uniform(1.15, 1.40)
    mrp = int(price * markup)
    
    return Decimal(str(price)), Decimal(str(mrp))


def generate_rating() -> tuple[float, int]:
    """
    Generate realistic rating and review count.
    
    Returns: (rating, reviews_count)
    - Higher rated products tend to have more reviews
    """
    # Most products have ratings between 3.5 and 5.0
    rating = round(random.uniform(3.5, 5.0), 1)
    
    # Reviews count varies based on rating
    if rating >= 4.5:
        reviews = random.randint(500, 5000)
    elif rating >= 4.0:
        reviews = random.randint(100, 2000)
    else:
        reviews = random.randint(20, 500)
    
    return rating, reviews


def clean_category_name(slug: str) -> str:
    """
    Convert category slug to display name.
    
    "office_and_school_supplies" -> "Office & School Supplies"
    """
    return slug.replace("_", " ").title().replace(" And ", " & ")


def seed_database():
    """
    Main function to seed the database with products.
    """
    print("🚀 Starting database seeding...")
    
    # Create all tables
    print("📦 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Create a new session
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"⚠️  Database already has {existing_products} products. Skipping seed.")
            print("   To re-seed, delete existing data first.")
            return
        
        # Read the parquet file
        parquet_path = Path(__file__).parent.parent / "dataset" / "train-00000-of-00001-20688441520ba9b3.parquet"
        print(f"📂 Reading data from: {parquet_path}")
        
        df = pd.read_parquet(parquet_path)
        print(f"   Found {len(df)} products in dataset")
        
        # First, create categories
        print("\n📁 Creating categories...")
        category_map = {}  # slug -> Category object
        
        for slug in df['category'].unique():
            display_name = clean_category_name(slug)
            category = Category(name=display_name, slug=slug)
            db.add(category)
            db.flush()  # Get the ID without committing
            category_map[slug] = category
            print(f"   ✅ {display_name}")
        
        # Now create products
        print("\n📦 Creating products...")
        
        for idx, row in df.iterrows():
            # Generate missing fields
            price, mrp = generate_price_by_category(row['category'])
            rating, reviews = generate_rating()
            stock = random.randint(10, 200)
            
            # Parse features and specs
            features = parse_feature_bullets(row.get('feature-bullets', ''))
            
            # Use tech_process for specifications (it's already formatted)
            specifications = row.get('tech_process', '')
            
            # Use labels for description (cleaned feature bullets)
            description = row.get('labels', row.get('tech_process', ''))
            
            # Create product
            product = Product(
                asin=row['asin'],
                name=row['title'],
                description=description,
                price=price,
                stock=stock,
                image_url=row['img_url'],
                features=features,
                specifications=specifications,
                category_id=category_map[row['category']].id
            )
            db.add(product)
            db.flush()  # Get the product ID
            
            # Create primary image
            product_image = ProductImage(
                product_id=product.id,
                image_url=row['img_url'],
                is_primary=True
            )
            db.add(product_image)
            
            print(f"   ✅ {row['title'][:50]}... (₹{price})")
        
        # Commit all changes
        db.commit()
        
        # Summary
        total_categories = db.query(Category).count()
        total_products = db.query(Product).count()
        
        print("\n" + "="*60)
        print("✅ DATABASE SEEDING COMPLETE!")
        print("="*60)
        print(f"   📁 Categories: {total_categories}")
        print(f"   📦 Products: {total_products}")
        print("\n   You can now run the FastAPI server:")
        print("   cd backend && uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
