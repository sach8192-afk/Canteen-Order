import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Banknote, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { useCanteen } from "@/context/CanteenContext";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

type PaymentMethod = "card" | "cash" | "upi";

/**
 * CheckoutModal: Handles payment method selection and order processing
 * Simulates payment with a brief loading state
 */
export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { cartBill, checkout, cart } = useCanteen();
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      const order = checkout();
      setProcessing(false);
      if (order) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    }, 1500);
  };

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: "upi", label: "UPI", icon: <Smartphone className="w-5 h-5" /> },
    { id: "card", label: "Card", icon: <CreditCard className="w-5 h-5" /> },
    { id: "cash", label: "Cash", icon: <Banknote className="w-5 h-5" /> },
  ];

  if (!open) return null;

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
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-xl shadow-modal w-full max-w-md overflow-hidden"
        >
          {success ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <CheckCircle2 className="w-16 h-16 text-accent" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold text-card-foreground mt-4">
                Payment Successful!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Your order has been placed</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-display text-lg font-semibold text-card-foreground">Checkout</h2>
                <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Order summary */}
                <div className="space-y-1.5">
                  {cart.map((c) => (
                    <div key={c.menuItem.id} className="flex justify-between text-sm">
                      <span className="text-card-foreground">
                        {c.menuItem.name} × {c.quantity}
                      </span>
                      <span className="text-muted-foreground">₹{(c.menuItem.price * c.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-card-foreground">
                    <span>Total (incl. GST)</span>
                    <span>₹{cartBill.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <p className="text-sm font-medium text-card-foreground mb-2">Payment Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                          method === m.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {m.icon}
                        <span className="text-xs font-medium">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={processing || cart.length === 0}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    `Pay ₹${cartBill.total.toFixed(2)}`
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
