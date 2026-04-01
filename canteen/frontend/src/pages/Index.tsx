import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ChefHat, UtensilsCrossed, LogOut } from "lucide-react";
import { MenuGrid } from "@/components/MenuGrid";
import { CartSidebar } from "@/components/CartSidebar";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { useCanteen } from "@/context/CanteenContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { cart } = useCanteen();
  const { user, logout } = useAuth();

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Canteen</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/kitchen"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <ChefHat className="w-4 h-4" /> Kitchen
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-md hover:bg-muted transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm">
                  {user?.name || "User"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Today's Menu</h2>
          <p className="text-sm text-muted-foreground mt-1">Fresh & delicious — pick your favorites</p>
        </div>
        <MenuGrid />
      </main>

      {/* Cart sidebar */}
      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout modal */}
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Receipt modal */}
      <ReceiptModal />
    </div>
  );
};

export default Index;
