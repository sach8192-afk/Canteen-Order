import { motion } from "framer-motion";
import { Plus, AlertCircle } from "lucide-react";
import { MenuItem } from "@/types/canteen";
import { useCanteen } from "@/context/CanteenContext";
import { menuImages } from "@/assets/menuImages";
import { useToast } from "@/hooks/use-toast";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = useCanteen();
  const { toast } = useToast();
  const imageSrc = menuImages[item.name];
  const outOfStock = item.stock <= 0;

  const handleAdd = () => {
    const success = addToCart(item);
    if (success) {
      toast({ title: `${item.name} added to cart`, duration: 1500 });
    } else {
      toast({
        title: "Not enough stock",
        description: `Only ${item.stock} left in stock`,
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 bg-card"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageSrc}
          alt={item.name}
          loading="lazy"
          width={512}
          height={512}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="flex items-center gap-1 text-primary-foreground font-semibold text-sm">
              <AlertCircle className="w-4 h-4" /> Out of Stock
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {item.category}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-card-foreground truncate">{item.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
          </div>
          <span className="text-sm font-bold text-primary whitespace-nowrap">₹{item.price}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{item.stock} left</span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
