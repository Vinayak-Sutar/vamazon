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
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import routes (we'll add these as we build)
# from app.routes import products, cart, orders

# Create FastAPI app instance
# In Flask: app = Flask(__name__)
# In FastAPI: app = FastAPI()
app = FastAPI(
    title="Vamazon API",
    description="E-commerce API for Vamazon application",
    version="1.0.0"
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
