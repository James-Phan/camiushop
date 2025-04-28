import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  User, InsertUser, users, 
  Product, InsertProduct, products,
  Category, InsertCategory, categories,
  Review, InsertReview, reviews,
  CartItem, InsertCartItem, cartItems,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private categoriesMap: Map<number, Category>;
  private productsMap: Map<number, Product>;
  private reviewsMap: Map<number, Review>;
  private cartItemsMap: Map<number, CartItem>;
  private ordersMap: Map<number, Order>;
  private orderItemsMap: Map<number, OrderItem>;

  userIdCounter: number;
  categoryIdCounter: number;
  productIdCounter: number;
  reviewIdCounter: number;
  cartItemIdCounter: number;
  orderIdCounter: number;
  orderItemIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.usersMap = new Map();
    this.categoriesMap = new Map();
    this.productsMap = new Map();
    this.reviewsMap = new Map();
    this.cartItemsMap = new Map();
    this.ordersMap = new Map();
    this.orderItemsMap = new Map();

    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.reviewIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Initialize with sample data for development
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.usersMap.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categoriesMap.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categoriesMap.get(id);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...categoryData, id };
    this.categoriesMap.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categoriesMap.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...categoryData };
    this.categoriesMap.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categoriesMap.delete(id);
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values());
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      (product) => product.featured
    );
  }

  async getNewProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      (product) => product.new
    );
  }

  async getBestsellerProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      (product) => product.bestseller
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const product: Product = { ...productData, id, createdAt: now };
    this.productsMap.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.productsMap.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...productData };
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.productsMap.delete(id);
  }

  // Reviews methods
  async getReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviewsMap.values()).filter(
      (review) => review.productId === productId
    );
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { ...reviewData, id, createdAt: now };
    this.reviewsMap.set(id, review);
    return review;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItemsMap.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItemsMap.get(id);
  }

  async getCartItemByProductAndUser(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItemsMap.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
  }

  async createCartItem(itemData: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const cartItem: CartItem = { ...itemData, id, createdAt: now };
    this.cartItemsMap.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, itemData: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const cartItem = this.cartItemsMap.get(id);
    if (!cartItem) return undefined;

    const updatedCartItem = { ...cartItem, ...itemData };
    this.cartItemsMap.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItemsMap.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const cartItems = await this.getCartItems(userId);
    cartItems.forEach(item => {
      this.cartItemsMap.delete(item.id);
    });
    return true;
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.ordersMap.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.ordersMap.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.ordersMap.get(id);
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { ...orderData, id, createdAt: now };
    this.ordersMap.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.ordersMap.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, status };
    this.ordersMap.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItemsMap.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(itemData: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const orderItem: OrderItem = { ...itemData, id };
    this.orderItemsMap.set(id, orderItem);
    return orderItem;
  }

  // Initialize sample data for development
  private async initSampleData() {
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

    // Create admin user
    await this.createUser({
      username: 'admin',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // password is "secret"
      email: 'admin@camiu.com',
      isAdmin: true
    });
  }
}

export const storage = new MemStorage();
