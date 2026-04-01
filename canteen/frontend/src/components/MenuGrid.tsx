import { useState, useMemo } from "react";
import { useCanteen } from "@/context/CanteenContext";
import { MenuItemCard } from "@/components/MenuItemCard";

const CATEGORIES = ["All", "Main Course", "Snacks", "Beverages", "Desserts"];

export function MenuGrid() {
  const { menu } = useCanteen();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(
    () => activeCategory === "All" ? menu : menu.filter((i) => i.category === activeCategory),
    [menu, activeCategory]
  );

  return (
    <div>
      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
