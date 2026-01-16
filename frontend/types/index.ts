/**
 * TypeScript Type Definitions for Amazon Clone
 * =============================================
 * 
 * TYPESCRIPT BASICS FOR REACT/FLASK DEVELOPERS:
 * ----------------------------------------------
 * 
 * TypeScript adds types to JavaScript, similar to Python type hints:
 * 
 * Python:
 *     def add(a: int, b: int) -> int:
 *         return a + b
 * 
 * TypeScript:
 *     function add(a: number, b: number): number {
 *         return a + b;
 *     }
 * 
 * Interfaces define object shapes (like Python TypedDict or Pydantic models):
 * 
 * Python (Pydantic):
 *     class Product(BaseModel):
 *         id: int
 *         name: str
 *         price: float
 * 
 * TypeScript:
 *     interface Product {
 *         id: number;
 *         name: string;
 *         price: number;
 *     }
 */

// Category type - matches our backend Category schema
export interface Category {
    id: number;
    name: string;
    slug: string;
}

// Product Image type - for image carousel
export interface ProductImage {
    id: number;
    image_url: string;
    is_primary: boolean;
}

// Product type - matches our backend Product schema
export interface Product {
    id: number;
    asin: string;
    name: string;
    description: string | null;
    price: number; // Will be parsed from string/Decimal
    mrp: number | null; // Maximum Retail Price (original price)
    rating: number; // Rating out of 5
    review_count: number; // Number of reviews
    stock: number;
    image_url: string | null;
    features: string | null;
    specifications: string | null;
    category_id: number | null;
    category: Category | null;
    images: ProductImage[];  // Multiple images for carousel
    created_at: string | null;
}

// Paginated product list response
export interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    per_page: number;
}

// Cart Item type
export interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    product: Product;
}

// Cart type
export interface Cart {
    id: number;
    session_id: string;
    items: CartItem[];
    total_items: number;
    subtotal: number;
}

// Shipping address for checkout
export interface ShippingAddress {
    customer_name: string;
    email?: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
}

// Order item in response
export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price_at_purchase: number;
}

// Order type
export interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    email?: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
}
