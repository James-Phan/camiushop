import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertReviewSchema, 
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  addressSchema
} from "@shared/schema";
import { z } from "zod";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
};

// Admin middleware
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).send("Forbidden");
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories", error });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Error fetching category", error });
    }
  });

  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating category", error });
    }
  });

  app.put("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating category", error });
    }
  });

  app.delete("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      if (!deleted) return res.status(404).json({ message: "Category not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting category", error });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured, new: isNew, bestseller } = req.query;
      
      let products;
      if (category) {
        products = await storage.getProductsByCategory(parseInt(category as string));
      } else if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else if (isNew === 'true') {
        products = await storage.getNewProducts();
      } else if (bestseller === 'true') {
        products = await storage.getBestsellerProducts();
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product", error });
    }
  });

  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating product", error });
    }
  });

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating product", error });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) return res.status(404).json({ message: "Product not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting product", error });
    }
  });

  // Reviews routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews", error });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating review", error });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user!.id);
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart items", error });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const { productId, quantity, variant } = insertCartItemSchema.omit({ userId: true }).parse(req.body);
      
      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      
      // Check if item already exists in cart
      const existingItem = await storage.getCartItemByProductAndUser(req.user!.id, productId);
      
      let cartItem;
      if (existingItem) {
        // Update quantity if item exists
        cartItem = await storage.updateCartItem(existingItem.id, { 
          quantity: existingItem.quantity + quantity,
          variant
        });
      } else {
        // Create new cart item
        cartItem = await storage.createCartItem({
          userId: req.user!.id,
          productId,
          quantity,
          variant
        });
      }
      
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Error adding item to cart", error });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify cart item belongs to user
      const cartItem = await storage.getCartItem(id);
      if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
      if (cartItem.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });
      
      const updatedData = insertCartItemSchema.partial().omit({ userId: true }).parse(req.body);
      const updatedCartItem = await storage.updateCartItem(id, updatedData);
      
      res.json(updatedCartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating cart item", error });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify cart item belongs to user
      const cartItem = await storage.getCartItem(id);
      if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
      if (cartItem.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });
      
      await storage.deleteCartItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing cart item", error });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      await storage.clearCart(req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart", error });
    }
  });

  // Orders routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrders(req.user!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders", error });
    }
  });

  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching all orders", error });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      // Allow admin or the order owner to view the order
      if (order.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const orderItems = await storage.getOrderItems(id);
      
      // Get products for each order item
      const itemsWithProducts = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching order", error });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const { shippingAddress, paymentMethod } = req.body;
      
      // Validate address
      addressSchema.parse(shippingAddress);
      
      // Get cart items
      const cartItems = await storage.getCartItems(req.user!.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let total = 0;
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) continue;
        
        const price = product.salePrice || product.price;
        total += price * item.quantity;
      }
      
      // Create order
      const order = await storage.createOrder({
        userId: req.user!.id,
        total,
        status: "pending",
        shippingAddress,
        paymentMethod
      });
      
      // Create order items
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) continue;
        
        const price = product.salePrice || product.price;
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price,
          variant: item.variant
        });
      }
      
      // Clear cart
      await storage.clearCart(req.user!.id);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating order", error });
    }
  });

  app.patch("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
