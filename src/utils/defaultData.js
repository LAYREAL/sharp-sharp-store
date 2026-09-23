export const DEFAULT_STORE_SETTINGS = {
  storeName: "SHARP SHARP",
  tagline: "Quick MoMo & WhatsApp Shopping • Instant Delivery",
  whatsappNumber: "233241234567",
  momoNumber: "0241234567",
  momoName: "SHARP SHARP Official",
  momoNetwork: "MTN Mobile Money",
  currency: "GH₵",
  adminPin: "1234"
};

export const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    name: "Classic Chronograph Gold Watch",
    price: 450,
    category: "Watches",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "Stainless steel water-resistant luxury quartz watch with date display and premium leather strap.",
    stock: 8,
    isStockTracked: true,
    sizes: ["Standard", "40mm", "44mm"]
  },
  {
    id: "p2",
    name: "Urban Minimalist Leather Sneakers",
    price: 320,
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    description: "Breathable genuine leather white sneakers designed for all-day comfort and durability.",
    stock: 12,
    isStockTracked: true,
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"]
  },
  {
    id: "p3",
    name: "Wireless Active Noise Cancelling Headphones",
    price: 280,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    description: "Deep bass bluetooth wireless headphones featuring 30hr battery life and crisp mic.",
    stock: 5,
    isStockTracked: true,
    sizes: ["Black", "Silver", "Midnight Blue"]
  },
  {
    id: "p4",
    name: "Designer Polarized Sunglasses",
    price: 150,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
    description: "UV400 protection lightweight matte black frame with anti-glare lenses.",
    stock: 15,
    isStockTracked: true,
    sizes: ["One Size"]
  },
  {
    id: "p5",
    name: "Smart Fitness Tracker Band",
    price: 190,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80",
    description: "Real-time heart rate monitor, step counter, sleep tracking & OLED color touch screen.",
    stock: 3,
    isStockTracked: true,
    sizes: ["S/M", "L/XL"]
  },
  {
    id: "p6",
    name: "Crafted Leather Crossbody Bag",
    price: 260,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    description: "Handcrafted premium leather crossbody bag with multiple zip pockets and adjustable strap.",
    stock: 6,
    isStockTracked: true,
    sizes: ["Medium", "Large"]
  }
];

export const DEFAULT_ORDERS = [
  {
    id: "ORD-1001",
    customerName: "Kofi Mensah",
    customerPhone: "0244123456",
    customerAddress: "Airport Residential Area, Accra",
    items: [
      { id: "p1", name: "Classic Chronograph Gold Watch", size: "44mm", price: 450, quantity: 1 }
    ],
    totalAmount: 450,
    status: "Paid",
    date: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];
