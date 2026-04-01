// CanteenContext.tsx — Global state wired to Express/MongoDB backend
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { MenuItem, CartItem, Order, OrderStatus } from "@/types/canteen";
import {
  fetchMenu,
  fetchActiveOrders,
  placeOrder,
  advanceOrderStatus,
  checkAvailability,
  calculateBill,
} from "@/services/canteenService";

interface CanteenContextType {
  // Menu
  menu: MenuItem[];
  menuLoading: boolean;
  menuError: string | null;
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartBill: { subtotal: number; tax: number; total: number; taxRate: number };
  // Orders
  orders: Order[];
  ordersLoading: boolean;
  checkout: () => Promise<Order | null>;
  currentReceipt: Order | null;
  setCurrentReceipt: (order: Order | null) => void;
  // Kitchen
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const CanteenContext = createContext<CanteenContextType | null>(null);

export function CanteenProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Order | null>(null);

  // ── Fetch menu on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setMenuLoading(true);
        setMenuError(null);
        const data = await fetchMenu();
        setMenu(data);
      } catch (err: any) {
        setMenuError(err.message ?? "Failed to load menu");
      } finally {
        setMenuLoading(false);
      }
    };
    loadMenu();
  }, []);

  // ── Fetch active orders on mount (kitchen queue) ──────────────────────────
  const refreshOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const data = await fetchActiveOrders();
      // Normalise timestamp from API string back to Date
      setOrders(
        data.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) }))
      );
    } catch {
      // silently ignore — kitchen page will show empty state
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrders();
    // Poll every 15 seconds so kitchen sees new orders without a refresh
    const interval = setInterval(refreshOrders, 15_000);
    return () => clearInterval(interval);
  }, [refreshOrders]);

  // ── Cart operations (purely local — no network) ───────────────────────────
  const addToCart = useCallback(
    (item: MenuItem) => {
      const menuItem = menu.find((m) => m.id === item.id);
      if (!menuItem) return false;

      const existing = cart.find((c) => c.menuItem.id === item.id);
      const currentQty = existing ? existing.quantity : 0;

      if (!checkAvailability(menuItem, currentQty + 1)) return false;

      setCart((prev) => {
        const idx = prev.findIndex((c) => c.menuItem.id === item.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
          return updated;
        }
        return [...prev, { menuItem: { ...menuItem }, quantity: 1 }];
      });
      return true;
    },
    [menu, cart]
  );

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) { removeFromCart(itemId); return; }
      const menuItem = menu.find((m) => m.id === itemId);
      if (!menuItem || !checkAvailability(menuItem, quantity)) return;
      setCart((prev) =>
        prev.map((c) => (c.menuItem.id === itemId ? { ...c, quantity } : c))
      );
    },
    [menu, removeFromCart]
  );

  const clearCart = useCallback(() => setCart([]), []);

  const cartBill = calculateBill(
    cart.map((c) => ({ price: c.menuItem.price, quantity: c.quantity }))
  );

  // ── Checkout — hits the backend ───────────────────────────────────────────
  const checkout = useCallback(async (): Promise<Order | null> => {
    if (cart.length === 0) return null;
    try {
      const raw = await placeOrder(cart);
      const order: Order = { ...raw, timestamp: new Date(raw.timestamp) };

      // Optimistically update local orders list & refresh menu stock from server
      setOrders((prev) => [order, ...prev]);
      setCurrentReceipt(order);
      setCart([]);

      // Re-fetch menu so stock counts are accurate
      fetchMenu().then(setMenu).catch(() => {});

      return order;
    } catch (err: any) {
      // Re-throw so CheckoutModal can surface the error to the user
      throw err;
    }
  }, [cart]);

  // ── Kitchen: update order status via API ──────────────────────────────────
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const updated = await advanceOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId
            ? { ...o, status: updated.status }
            : o
        )
      );
    },
    []
  );

  return (
    <CanteenContext.Provider
      value={{
        menu,
        menuLoading,
        menuError,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartBill,
        orders,
        ordersLoading,
        checkout,
        currentReceipt,
        setCurrentReceipt,
        updateOrderStatus,
        refreshOrders,
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
}

export function useCanteen() {
  const ctx = useContext(CanteenContext);
  if (!ctx) throw new Error("useCanteen must be used within CanteenProvider");
  return ctx;
}
