require("dotenv").config({ path: `${__dirname}/../.env` });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const MenuItem = require("../models/MenuItem");

const SEED_MENU = [
  { name: "Chicken Biryani",      price: 180, description: "Aromatic basmati rice with tender chicken pieces",   stock: 25, category: "Main Course", image_url: "/src/assets/biryani.jpg"  },
  { name: "Paneer Butter Masala", price: 150, description: "Creamy tomato gravy with soft paneer cubes",         stock: 20, category: "Main Course", image_url: "/src/assets/paneer.jpg"   },
  { name: "Masala Dosa",          price: 80,  description: "Crispy crepe filled with spiced potato",             stock: 30, category: "Snacks", image_url: "/src/assets/dosa.jpg"          },
  { name: "Veg Thali",            price: 120, description: "Complete meal with dal, sabzi, roti & rice",         stock: 15, category: "Main Course", image_url: "/src/assets/thali.jpg"    },
  { name: "Samosa (2 pcs)",       price: 40,  description: "Crispy pastry with spiced potato filling",           stock: 50, category: "Snacks", image_url: "/src/assets/samosa.jpg"        },
  { name: "Cold Coffee",          price: 60,  description: "Chilled coffee blended with milk and ice",           stock: 40, category: "Beverages", image_url: "/src/assets/cold-coffee.jpg"},
  { name: "Mango Lassi",          price: 50,  description: "Sweet yogurt drink with fresh mango pulp",          stock: 35, category: "Beverages", image_url: "/src/assets/lassi.jpg"       },
  { name: "Chole Bhature",        price: 100, description: "Spiced chickpeas with fluffy fried bread",           stock: 20, category: "Main Course", image_url: "/src/assets/chole.jpg"    },
  { name: "Gulab Jamun (2 pcs)",  price: 50,  description: "Soft milk dumplings soaked in sugar syrup",         stock: 30, category: "Desserts", image_url: "/src/assets/gulab-jamun.jpg"  },
  { name: "French Fries",         price: 70,  description: "Crispy golden fries with seasoning",                stock: 45, category: "Snacks", image_url: "/src/assets/fries.jpg"          },
  { name: "Butter Naan",          price: 30,  description: "Soft leavened bread with butter",                   stock: 60, category: "Snacks", image_url: "/src/assets/naan.jpg"           },
  { name: "Chai",                 price: 20,  description: "Traditional Indian spiced tea",                     stock: 100, category: "Beverages", image_url: "/src/assets/chai.jpg"  },
];

const seed = async () => {
  try {
    await connectDB();
    await MenuItem.deleteMany({});
    const inserted = await MenuItem.insertMany(SEED_MENU);
    console.log(`✅ Seeded ${inserted.length} menu items.`);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

seed();
