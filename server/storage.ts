import session from "express-session";
import connectPg from "connect-pg-simple";
import { 
  User, InsertUser, users, 
  Product, InsertProduct, products,
  Category, InsertCategory, categories,
  Review, InsertReview, reviews,
  CartItem, InsertCartItem, cartItems,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
// import { db, pool } from "./db"; // Temporarily disabled due to database connection issues
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";

// Memory store for session data
const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

// Password hashing function
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewProducts(): Promise<Product[]>;
  getBestsellerProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Reviews methods
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Cart methods
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByProductAndUser(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, item: Partial<InsertCartItem>): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order methods
  getOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order items methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  sessionStore: any;
  
  // In-memory data stores
  private users: User[] = [];
  private categories: Category[] = [];
  private products: Product[] = [];
  private reviews: Review[] = [];
  private cartItems: CartItem[] = [];
  private orders: Order[] = [];
  private orderItems: OrderItem[] = [];
  
  // Counters for generating IDs
  private userIdCounter = 1;
  private categoryIdCounter = 1;
  private productIdCounter = 1;
  private reviewIdCounter = 1;
  private cartItemIdCounter = 1;
  private orderIdCounter = 1;
  private orderItemIdCounter = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize sample data
    this.initSampleData().catch(error => {
      console.error("Failed to initialize sample data:", error);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      id: this.userIdCounter++,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      isAdmin: userData.isAdmin ?? false,
      createdAt: now
    };
    this.users.push(user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.find(category => category.id === id);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const now = new Date();
    const category: Category = {
      id: this.categoryIdCounter++,
      name: categoryData.name,
      description: categoryData.description,
      image: categoryData.image
    };
    this.categories.push(category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const index = this.categories.findIndex(category => category.id === id);
    if (index === -1) return undefined;
    
    this.categories[index] = {
      ...this.categories[index],
      ...categoryData
    };
    
    return this.categories[index];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const initialLength = this.categories.length;
    this.categories = this.categories.filter(category => category.id !== id);
    return initialLength > this.categories.length;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return this.products;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.products.filter(product => product.categoryId === categoryId);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.products.filter(product => product.featured);
  }

  async getNewProducts(): Promise<Product[]> {
    return this.products.filter(product => product.new);
  }

  async getBestsellerProducts(): Promise<Product[]> {
    return this.products.filter(product => product.bestseller);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.find(product => product.id === id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const now = new Date();
    const product: Product = {
      id: this.productIdCounter++,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      salePrice: productData.salePrice ?? null,
      image: productData.image,
      images: productData.images || null,
      categoryId: productData.categoryId,
      stock: productData.stock ?? 0,
      featured: productData.featured ?? false,
      new: productData.new ?? false,
      bestseller: productData.bestseller ?? false,
      createdAt: now
    };
    this.products.push(product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const index = this.products.findIndex(product => product.id === id);
    if (index === -1) return undefined;
    
    this.products[index] = {
      ...this.products[index],
      ...productData
    };
    
    return this.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter(product => product.id !== id);
    return initialLength > this.products.length;
  }

  // Reviews methods
  async getReviews(productId: number): Promise<Review[]> {
    return this.reviews.filter(review => review.productId === productId);
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const now = new Date();
    const review: Review = {
      id: this.reviewIdCounter++,
      ...reviewData,
      createdAt: now
    };
    this.reviews.push(review);
    return review;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return this.cartItems.filter(item => item.userId === userId);
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.find(item => item.id === id);
  }

  async getCartItemByProductAndUser(userId: number, productId: number): Promise<CartItem | undefined> {
    return this.cartItems.find(item => item.userId === userId && item.productId === productId);
  }

  async createCartItem(itemData: InsertCartItem): Promise<CartItem> {
    const now = new Date();
    const cartItem: CartItem = {
      id: this.cartItemIdCounter++,
      userId: itemData.userId,
      productId: itemData.productId,
      quantity: itemData.quantity ?? 1,
      variant: itemData.variant ?? null,
      createdAt: now
    };
    this.cartItems.push(cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, itemData: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const index = this.cartItems.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    this.cartItems[index] = {
      ...this.cartItems[index],
      ...itemData
    };
    
    return this.cartItems[index];
  }

  async deleteCartItem(id: number): Promise<boolean> {
    const initialLength = this.cartItems.length;
    this.cartItems = this.cartItems.filter(item => item.id !== id);
    return initialLength > this.cartItems.length;
  }

  async clearCart(userId: number): Promise<boolean> {
    const initialLength = this.cartItems.length;
    this.cartItems = this.cartItems.filter(item => item.userId !== userId);
    return initialLength > this.cartItems.length;
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return this.orders.filter(order => order.userId === userId);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orders;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.find(order => order.id === id);
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const now = new Date();
    const order: Order = {
      id: this.orderIdCounter++,
      userId: orderData.userId,
      total: orderData.total,
      status: orderData.status ?? "pending",
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      createdAt: now
    };
    this.orders.push(order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) return undefined;
    
    this.orders[index] = {
      ...this.orders[index],
      status
    };
    
    return this.orders[index];
  }

  // Order items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.orderItems.filter(item => item.orderId === orderId);
  }

  async createOrderItem(itemData: InsertOrderItem): Promise<OrderItem> {
    const orderItem: OrderItem = {
      id: this.orderItemIdCounter++,
      orderId: itemData.orderId,
      productId: itemData.productId,
      quantity: itemData.quantity,
      price: itemData.price,
      variant: itemData.variant ?? null
    };
    this.orderItems.push(orderItem);
    return orderItem;
  }

  // Initialize sample data for development
  private async initSampleData() {
    // Check if data already exists
    const existingCategories = await this.getCategories();
    if (existingCategories.length > 0) {
      console.log("Sample data already initialized, skipping.");
      return;
    }
    
    console.log("Initializing sample data...");
    
    // Create categories
    const categoriesData: InsertCategory[] = [
      { name: 'Skincare', description: 'Skincare products for all skin types', image: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?auto=format&fit=crop&w=400&h=400' },
      { name: 'Makeup', description: 'Makeup products for all occasions', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&h=400' },
      { name: 'Hair Care', description: 'Hair care products for all hair types', image: 'https://images.unsplash.com/photo-1599751449028-36357617369e?auto=format&fit=crop&w=400&h=400' },
      { name: 'Fragrances', description: 'Fragrances for all occasions', image: 'https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=400&h=400' }
    ];

    const categoryIds = [];
    for (const categoryData of categoriesData) {
      const category = await this.createCategory(categoryData);
      categoryIds.push(category.id);
    }

    // Create products
    const productsData: InsertProduct[] = [
      {
        name: 'Hydrating Facial Cream',
        description: 'A deeply hydrating face cream that nourishes and revitalizes dry skin. Enriched with hyaluronic acid and natural botanical extracts for long-lasting moisture and protection.',
        price: 39.99,
        salePrice: 29.99,
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&h=400',
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&h=800'],
        categoryId: 1,
        stock: 100,
        featured: true,
        new: true,
        bestseller: false
      },
      {
        name: 'Vitamin C Brightening Serum',
        description: 'A powerful serum enriched with Vitamin C to brighten and even skin tone. Helps reduce dark spots and hyperpigmentation for a radiant complexion.',
        price: 44.99,
        salePrice: 35.99,
        image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&h=400',
        images: ['https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&h=800'],
        categoryId: 1,
        stock: 80,
        featured: true,
        new: false,
        bestseller: false
      },
      {
        name: 'Longwear Matte Foundation',
        description: 'A long-lasting foundation with a matte finish. Provides full coverage that lasts all day without feeling heavy.',
        price: 24.99,
        salePrice: null,
        image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=400&h=400',
        images: ['https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=800&h=800'],
        categoryId: 2,
        stock: 120,
        featured: true,
        new: false,
        bestseller: false
      },
      {
        name: 'Creamy Matte Lipstick Set',
        description: 'A set of creamy matte lipsticks in various shades. Long-lasting and comfortable to wear.',
        price: 52.99,
        salePrice: 42.99,
        image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?auto=format&fit=crop&w=400&h=400',
        images: ['https://images.unsplash.com/photo-1571875257727-256c39da42af?auto=format&fit=crop&w=800&h=800'],
        categoryId: 2,
        stock: 60,
        featured: true,
        new: false,
        bestseller: true
      },
      {
        name: 'Floral Essence Perfume',
        description: 'A floral fragrance with notes of jasmine, rose, and vanilla. Long-lasting and perfect for everyday wear.',
        price: 68.99,
        salePrice: null,
        image: 'https://images.unsplash.com/photo-1615375834706-05eb4f78d58e?auto=format&fit=crop&w=400&h=400',
        images: ['https://images.unsplash.com/photo-1615375834706-05eb4f78d58e?auto=format&fit=crop&w=800&h=800'],
        categoryId: 4,
        stock: 40,
        featured: true,
        new: false,
        bestseller: false
      },
      {
        name: 'Hyaluronic Acid Sheet Mask Set',
        description: 'A set of sheet masks enriched with hyaluronic acid for deep hydration. Leaves skin feeling plump and refreshed.',
        price: 27.99,
        salePrice: 22.99,
        image: 'https://images.unsplash.com/photo-1631730359585-38a4935786ad?auto=format&fit=crop&w=400&h=400',
        images: ['https://images.unsplash.com/photo-1631730359585-38a4935786ad?auto=format&fit=crop&w=800&h=800'],
        categoryId: 1,
        stock: 90,
        featured: true,
        new: false,
        bestseller: true
      }
    ];

    for (const productData of productsData) {
      await this.createProduct(productData);
    }

    // Create admin user with a properly formatted password using our hashPassword function
    const adminPass = await hashPassword('admin123');
    await this.createUser({
      username: 'admin',
      password: adminPass,
      email: 'admin@camiu.com',
      isAdmin: true
    });
  }
}

export const storage = new MemStorage();
