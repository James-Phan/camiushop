export interface ProductWithDetails {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  image: string;
  images: string[];
  categoryId: number;
  stock: number;
  featured: boolean;
  new: boolean;
  bestseller: boolean;
  createdAt: string;
  category?: Category;
  reviews?: Review[];
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  user?: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  variant: string | null;
  createdAt: string;
  product?: ProductWithDetails;
}

export interface CartItemWithProduct extends CartItem {
  product: ProductWithDetails;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  variant: string | null;
  product?: ProductWithDetails;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
  items?: OrderItem[];
}
