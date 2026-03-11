export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  image: string;
  description: string;
  available: boolean;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: number;
  items: OrderItem[];
  tableNumber: number | null;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid' | 'cancelled';
  type: 'dine-in' | 'takeaway';
  total: number;
  createdAt: Date;
  customerName?: string;
  paymentMethod?: string;
}

export interface Table {
  id: number;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: number;
}

export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
  isActive?: boolean;
}

export type Page = 'dashboard' | 'pos' | 'menu' | 'orders' | 'tables' | 'django-guide' | 'diagnostics' | 'users';
