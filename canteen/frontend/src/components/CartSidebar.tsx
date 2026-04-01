import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingCart, X } from "lucide-react";
import { useCanteen } from "@/context/CanteenContext";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSidebar({ open, onClose, onCheckout }: CartSidebarProps) {
  const { cart, removeFromCart, updateQuantity, cartBill } = useCanteen();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card z-50 flex flex-col shadow-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-card-foreground">Your Cart</h2>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {cart.reduce((s, c) => s + c.quantity, 0)}
                </span>
              </div>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.menuItem.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{item.menuItem.name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.menuItem.price} each</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-muted hover:bg-border transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-muted hover:bg-border transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-primary w-14 text-right">
                      ₹{item.menuItem.price * item.quantity}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="p-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bill summary */}
            {cart.length > 0 && (
              <div className="border-t border-border px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST ({(cartBill.taxRate * 100).toFixed(0)}%)</span>
                  <span>₹{cartBill.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-card-foreground pt-1 border-t border-border">
                  <span>Total</span>
                  <span>₹{cartBill.total.toFixed(2)}</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full mt-2 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
