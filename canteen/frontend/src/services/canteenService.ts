// canteenService.ts — API client for the Express/MongoDB backend
import { MenuItem, CartItem } from "@/types/canteen";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const TAX_RATE = 0.05; // must match backend

// ── Menu ─────────────────────────────────────────────────────────────────────

export async function fetchMenu(category?: string): Promise<MenuItem[]> {
  const url = category
    ? `${API_URL}/menu?category=${encodeURIComponent(category)}`
    : `${API_URL}/menu`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch menu");
  const { data } = await res.json();
  return data as MenuItem[];
}

export async function fetchMenuItemById(id: string): Promise<MenuItem> {
  const res = await fetch(`${API_URL}/menu/${id}`);
  if (!res.ok) throw new Error("Menu item not found");
  const { data } = await res.json();
  return data as MenuItem;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface CheckoutPayload {
  items: { menuItemId: string; quantity: number }[];
  customerNote?: string;
}

export async function placeOrder(cart: CartItem[], customerNote = "") {
  const payload: CheckoutPayload = {
    items: cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity })),
    customerNote,
  };

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Checkout failed");
  return body.data;
}

export async function fetchOrders(statuses?: string[]) {
  const params = statuses ? `?status=${statuses.join(",")}` : "";
  const res = await fetch(`${API_URL}/orders${params}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  const { data } = await res.json();
  return data;
}

export async function fetchActiveOrders() {
  const res = await fetch(`${API_URL}/orders/active`);
  if (!res.ok) throw new Error("Failed to fetch active orders");
  const { data } = await res.json();
  return data;
}

export async function advanceOrderStatus(orderId: string, status: string) {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Status update failed");
  return body.data;
}

// ── Bill helpers (pure — no API needed) ──────────────────────────────────────

export function checkAvailability(item: MenuItem, quantity: number): boolean {
  return item.stock >= quantity;
}

export function calculateBill(items: { price: number; quantity: number }[]): {
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
} {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  return { subtotal, tax, total: subtotal + tax, taxRate: TAX_RATE };
}
