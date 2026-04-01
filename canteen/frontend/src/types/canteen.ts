// Types for the canteen ordering system

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  stock: number;
  category: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  order_id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  timestamp: Date;
}

export type OrderStatus = "Placed" | "Preparing" | "Ready" | "Completed";

export interface BillSummary {
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
}
