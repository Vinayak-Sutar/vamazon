"""
FastAPI E-commerce Backend
==========================

This is the main entry point for our FastAPI application.

COMPARISON WITH FLASK:
----------------------
Flask:
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/hello')
    def hello():
        return {'message': 'Hello World'}

FastAPI:
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get('/hello')
    def hello():
        return {'message': 'Hello World'}

KEY DIFFERENCES:
1. FastAPI uses @app.get(), @app.post() instead of @app.route()
2. FastAPI auto-generates Swagger docs at /docs
3. FastAPI has built-in async support
4. FastAPI validates data automatically with Pydantic
"""

from app.routes import products, categories, cart, orders, auth, wishlist
from app.database import engine, SessionLocal, Base
from app.models.models import Category, Product, ProductImage
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

# Import routes (we'll add these as we build)
# from app.routes import products, cart, orders


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler - runs on startup and shutdown.
    Creates database tables and seeds data if empty.
    """
    print("🚀 Application starting up...")

    # Create all tables
    print("📦 Creating database tables...")
    Base.metadata.create_all(bind=engine)

    # Check if database needs seeding
    db = SessionLocal()
    try:
        existing_products = db.query(Product).count()
        if existing_products == 0:
            print("📂 Database is empty, seeding data...")
            seed_database(db)
        else:
            print(f"✅ Database already has {existing_products} products")
    finally:
        db.close()

    yield  # App runs here

    print("👋 Application shutting down...")


def seed_database(db):
    """Seed the database with initial data."""
    import random
    from decimal import Decimal
    from pathlib import Path
    import pandas as pd

    def clean_category_name(slug: str) -> str:
        return slug.replace("_", " ").title().replace(" And ", " & ")

    def generate_price_by_category(category: str) -> tuple:
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
        base_price = random.randint(min_price, max_price)
        if base_price > 1000:
            price = base_price - \
                random.choice([1, 1, 1, 0]) + random.choice([0, 99, 49, 0])
        else:
            price = base_price
        markup = random.uniform(1.15, 1.40)
        mrp = int(price * markup)
        return Decimal(str(price)), Decimal(str(mrp))

    def generate_rating() -> tuple:
        rating = round(random.uniform(3.5, 5.0), 1)
        if rating >= 4.5:
            reviews = random.randint(500, 5000)
        elif rating >= 4.0:
            reviews = random.randint(100, 2000)
        else:
            reviews = random.randint(20, 500)
        return rating, reviews

    def parse_feature_bullets(raw_bullets) -> str:
        try:
            import numpy as np
            if isinstance(raw_bullets, np.ndarray):
                bullets = raw_bullets.tolist()
                if isinstance(bullets, list):
                    return "\n".join(f"• {str(bullet).strip()}" for bullet in bullets if bullet)
            if isinstance(raw_bullets, list):
                return "\n".join(f"• {str(bullet).strip()}" for bullet in raw_bullets if bullet)
            if raw_bullets is not None and isinstance(raw_bullets, str):
                return raw_bullets
            return ""
        except:
            return ""

    try:
        # Read the parquet file
        parquet_path = Path(__file__).parent.parent / "dataset" / \
            "train-00000-of-00001-20688441520ba9b3.parquet"
        print(f"📂 Reading data from: {parquet_path}")

        df = pd.read_parquet(parquet_path)
        print(f"   Found {len(df)} products in dataset")

        # Create categories
        print("📁 Creating categories...")
        category_map = {}
        for slug in df['category'].unique():
            display_name = clean_category_name(slug)
            category = Category(name=display_name, slug=slug)
            db.add(category)
            db.flush()
            category_map[slug] = category
            print(f"   ✅ {display_name}")

        # Create products
        print("📦 Creating products...")
        for idx, row in df.iterrows():
            price, mrp = generate_price_by_category(row['category'])
            rating, reviews = generate_rating()
            stock = random.randint(10, 200)
            features = parse_feature_bullets(row.get('feature-bullets', ''))
            specifications = row.get('tech_process', '')
            description = row.get('labels', row.get('tech_process', ''))

            product = Product(
                asin=row['asin'],
                name=row['title'],
                description=description,
                price=price,
                mrp=mrp,
                rating=rating,
                review_count=reviews,
                stock=stock,
                image_url=row['img_url'],
                features=features,
                specifications=specifications,
                category_id=category_map[row['category']].id
            )
            db.add(product)
            db.flush()

            product_image = ProductImage(
                product_id=product.id,
                image_url=row['img_url'],
                is_primary=True
            )
            db.add(product_image)

        db.commit()
        print(
            f"✅ Seeding complete! {db.query(Product).count()} products added.")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise


# Create FastAPI app instance
# In Flask: app = Flask(__name__)
# In FastAPI: app = FastAPI()
app = FastAPI(
    title="Vamazon API",
    description="E-commerce API for Vamazon application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
# This allows our Next.js frontend to communicate with this backend
# In Flask, you'd use flask-cors
origins = [
    "http://localhost:3000",  # Next.js dev server
    "http://127.0.0.1:3000",
]

# Add production frontend URL from environment variable
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

# Also allow Render preview URLs
origins.append("https://vamazon-frontend.onrender.com")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Root endpoint - just for testing
@app.get("/")
def read_root():
    """
    Root endpoint to verify API is running.
    Visit http://localhost:8000/ to see this response.
    """
    return {
        "message": "Welcome to Vamazon API",
        "docs": "Visit /docs for Swagger documentation"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy"}


# Include routers for different API endpoints

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router,
                   prefix="/api/categories", tags=["Categories"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["Wishlist"])
