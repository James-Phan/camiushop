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
import { db, pool } from "./db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const PostgresSessionStore = connectPg(session);
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

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
    
    // Initialize sample data if needed
    this.initSampleData().catch(error => {
      console.error("Failed to initialize sample data:", error);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }

  async getNewProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.new, true));
  }

  async getBestsellerProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.bestseller, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Reviews methods
  async getReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    const [cartItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return cartItem;
  }

  async getCartItemByProductAndUser(userId: number, productId: number): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    return cartItem;
  }

  async createCartItem(itemData: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db.insert(cartItems).values(itemData).returning();
    return cartItem;
  }

  async updateCartItem(id: number, itemData: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const [updatedCartItem] = await db
      .update(cartItems)
      .set(itemData)
      .where(eq(cartItems.id, id))
      .returning();
    return updatedCartItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return (result.rowCount ?? 0) > 0;
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Order items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(itemData: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(itemData).returning();
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

export const storage = new DatabaseStorage();
