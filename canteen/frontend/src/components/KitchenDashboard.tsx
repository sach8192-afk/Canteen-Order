import { motion } from "framer-motion";
import { Clock, ChefHat, CheckCircle2, ArrowRight } from "lucide-react";
import { useCanteen } from "@/context/CanteenContext";
import { OrderStatus } from "@/types/canteen";

const statusConfig: Record<OrderStatus, { color: string; icon: React.ReactNode; bg: string }> = {
  Placed: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    icon: <Clock className="w-4 h-4" />,
  },
  Preparing: {
    color: "text-warning-foreground",
    bg: "bg-warning",
    icon: <ChefHat className="w-4 h-4" />,
  },
  Ready: {
    color: "text-accent-foreground",
    bg: "bg-accent",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  Completed: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  Placed: "Preparing",
  Preparing: "Ready",
  Ready: "Completed",
};

/**
 * KitchenDashboard: Displays active orders with status management for kitchen staff
 */
export function KitchenDashboard() {
  const { orders, updateOrderStatus } = useCanteen();
  const activeOrders = orders.filter((o) => o.status !== "Completed");

  if (activeOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <ChefHat className="w-16 h-16 mb-3 opacity-20" />
        <p className="text-sm">No active orders</p>
        <p className="text-xs mt-1">Orders will appear here when placed</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {activeOrders.map((order) => {
        const cfg = statusConfig[order.status];
        const next = nextStatus[order.status];
        return (
          <motion.div
            key={order.order_id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-4 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted-foreground">{order.order_id}</span>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.icon} {order.status}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              {order.items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between text-sm">
                  <span className="text-card-foreground">{item.menuItem.name}</span>
                  <span className="text-muted-foreground">×{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {new Date(order.timestamp).toLocaleTimeString()}
              </span>
              {next && (
                <button
                  onClick={() => updateOrderStatus(order.order_id, next)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Mark {next} <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
