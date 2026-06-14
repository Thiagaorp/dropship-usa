export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  sku: string | null;
  weight: number | null;
  supplier: string;
  supplierUrl: string | null;
  supplierId: string | null;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentIntentId: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  discountCode: string | null;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: ShippingAddress;
  notes: string | null;
  supplierOrdered: boolean;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  title: string;
  image: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}
