import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Receipt as ReceiptIcon } from "lucide-react";
import { useCanteen } from "@/context/CanteenContext";

/**
 * ReceiptModal: Displays and allows printing of the order receipt
 */
export function ReceiptModal() {
  const { currentReceipt, setCurrentReceipt } = useCanteen();

  const handlePrint = () => {
    window.print();
  };

  if (!currentReceipt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-xl shadow-modal w-full max-w-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-card-foreground">Receipt</h2>
            </div>
            <button onClick={() => setCurrentReceipt(null)} className="p-1 rounded-md hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-3" id="receipt-content">
            <div className="text-center mb-4">
              <h3 className="font-display text-xl font-bold text-card-foreground">🍽️ Canteen</h3>
              <p className="text-xs text-muted-foreground mt-1">Order #{currentReceipt.order_id}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(currentReceipt.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-dashed border-border pt-3 space-y-1.5">
              {currentReceipt.items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between text-sm">
                  <span className="text-card-foreground">
                    {item.menuItem.name} × {item.quantity}
                  </span>
                  <span className="text-muted-foreground">₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-border pt-2 space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{currentReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>GST (5%)</span>
                <span>₹{currentReceipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-card-foreground pt-1 border-t border-border">
                <span>Total</span>
                <span>₹{currentReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-2">Thank you for your order!</p>
          </div>

          <div className="px-5 pb-4 flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={() => setCurrentReceipt(null)}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
