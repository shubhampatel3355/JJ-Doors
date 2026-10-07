// Mock data and helper state for JJ Doors Admin Studio

export const INITIAL_CATEGORIES = [
  {
    id: "CAT-101",
    name: "Teak Wood Main Doors",
    slug: "teak-wood-main-doors",
    description: "Premium handcrafted solid CP teak wood doors with vastu-compliant architectural carvings.",
    productCount: 14,
    status: "Active",
    badgeColor: "gold",
    image: "/assets/img/about/1.png",
    createdAt: "2026-08-15",
    subCategories: [
      { id: "SUB-101-1", name: "Single Leaf Carved", description: "Standard single shutter ornate doors", status: "Active", productCount: 6 },
      { id: "SUB-101-2", name: "Double Grand Entrance", description: "Palatial double panel main doors", status: "Active", productCount: 8 }
    ]
  },
  {
    id: "CAT-102",
    name: "Teak Pooja Doors",
    slug: "teak-pooja-doors",
    description: "Traditional spiritual mandir doors with ornate CNC & brass inlay details.",
    productCount: 8,
    status: "Active",
    badgeColor: "warning",
    image: "/assets/img/portfolio/portfolio5_2.jpg",
    createdAt: "2026-08-16",
    subCategories: [
      { id: "SUB-102-1", name: "Brass Inlay Mandir", description: "Integrated bell cavities and bells", status: "Active", productCount: 5 },
      { id: "SUB-102-2", name: "CNC Jali Lattice", description: "Geometric and floral perforated jali", status: "Active", productCount: 3 }
    ]
  },
  {
    id: "CAT-103",
    name: "Veneer Architectural Doors",
    slug: "veneer-architectural-doors",
    description: "Natural exotic wood veneers with PU Italian polish finish for luxury villas and flats.",
    productCount: 19,
    status: "Active",
    badgeColor: "blue",
    image: "/assets/img/portfolio/portfolio5_3.jpg",
    createdAt: "2026-08-18",
    subCategories: [
      { id: "SUB-103-1", name: "Smoked Oak & Walnut", description: "Dark rustic luxury grain textures", status: "Active", productCount: 11 },
      { id: "SUB-103-2", name: "Fluted Metallic Inlay", description: "Modern grooves with brass profile", status: "Active", productCount: 8 }
    ]
  },
  {
    id: "CAT-104",
    name: "Laminated Designer Doors",
    slug: "laminated-designer-doors",
    description: "Heavy-duty 1mm high-pressure laminates with scratch and water resistance.",
    productCount: 22,
    status: "Active",
    badgeColor: "success",
    image: "/assets/img/portfolio/portfolio5_4.jpg",
    createdAt: "2026-08-20",
    subCategories: [
      { id: "SUB-104-1", name: "Textured Woodgrain", description: "Natural tactile feel laminates", status: "Active", productCount: 14 },
      { id: "SUB-104-2", name: "Super Matte Solid", description: "Velvet anti-fingerprint surface", status: "Active", productCount: 8 }
    ]
  },
  {
    id: "CAT-105",
    name: "Moulded Skin & Primer Doors",
    slug: "moulded-skin-primer-doors",
    description: "Cost-effective HDF panel moulded doors, ready to paint for modern apartments.",
    productCount: 16,
    status: "Active",
    badgeColor: "info",
    image: "/assets/img/portfolio/portfolio8_1.jpg",
    createdAt: "2026-08-22",
    subCategories: [
      { id: "SUB-105-1", name: "2-Panel & 4-Panel Skin", description: "Embossed traditional panels", status: "Active", productCount: 9 },
      { id: "SUB-105-2", name: "Ready-to-Paint Primer", description: "Triple primed smooth surface", status: "Active", productCount: 7 }
    ]
  },
  {
    id: "CAT-106",
    name: "WPC 100% Waterproof Doors",
    slug: "wpc-waterproof-doors",
    description: "Wood Polymer Composite doors with lifetime guarantee against moisture, rot, and termites.",
    productCount: 11,
    status: "Active",
    badgeColor: "success",
    image: "/assets/img/portfolio/portfolio8_4.jpg",
    createdAt: "2026-08-25",
    subCategories: [
      { id: "SUB-106-1", name: "Bathroom & Wet Zone", description: "Solid dense waterproof core", status: "Active", productCount: 6 },
      { id: "SUB-106-2", name: "Balcony & Utility", description: "UV weather resistant composite", status: "Active", productCount: 5 }
    ]
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "PRD-201",
    name: "Royal Heritage Teak Main Entrance Door",
    sku: "JJD-TEAK-001",
    categoryId: "CAT-101",
    categoryName: "Teak Wood Main Doors",
    subCategoryId: "SUB-101-2",
    subCategoryName: "Double Grand Entrance",
    price: 48500,
    badge: "Handcrafted Teak",
    tagline: "Grand Entrance & Vastu Compliant",
    status: "Published",
    stock: 18,
    image: "/assets/img/about/1.png",
    description: "Crafted from seasoned Burma and CP Teak wood. Features deep 3D multi-level carving, reinforced core, and double seal acoustics.",
    features: ["Solid 40mm Burma Teak", "Vastu Compliant Orientations", "Weather-shield Polish", "Multi-lock Ready"],
    createdAt: "2026-08-28"
  },
  {
    id: "PRD-202",
    name: "Divine Asthalakshmi Carved Pooja Door",
    sku: "JJD-POOJA-002",
    categoryId: "CAT-102",
    categoryName: "Teak Pooja Doors",
    subCategoryId: "SUB-102-1",
    subCategoryName: "Brass Inlay Mandir",
    price: 36000,
    badge: "Intricate Carving",
    tagline: "Spiritual & Traditional Sanctity",
    status: "Published",
    stock: 9,
    image: "/assets/img/portfolio/portfolio5_2.jpg",
    description: "Sacred aesthetic featuring 8 Lakshmi forms carved with micro-precision. Includes integrated brass bell slots and ventilation arches.",
    features: ["Pure Teak Wood", "Brass Inlay Options", "Authentic Vedic Carvings", "Acoustic Glazing"],
    createdAt: "2026-08-27"
  },
  {
    id: "PRD-203",
    name: "Italian Smoked Oak Veneer Door",
    sku: "JJD-VEN-003",
    categoryId: "CAT-103",
    categoryName: "Veneer Architectural Doors",
    subCategoryId: "SUB-103-1",
    subCategoryName: "Smoked Oak & Walnut",
    price: 24500,
    badge: "Natural Wood Finish",
    tagline: "Luxury Architectural Interiors",
    status: "Published",
    stock: 25,
    image: "/assets/img/portfolio/portfolio5_3.jpg",
    description: "Ultra-sleek contemporary flush door with natural Crown Cut Smoked Oak veneer and anti-warp tubular chipboard core.",
    features: ["Crown Cut Natural Veneer", "Italian High Gloss / Matte PU", "Concealed Hinge Ready", "Sound Isolation 32dB"],
    createdAt: "2026-08-26"
  },
  {
    id: "PRD-204",
    name: "Nordic Woodgrain Scratch-Guard Laminate Door",
    sku: "JJD-LAM-004",
    categoryId: "CAT-104",
    categoryName: "Laminated Designer Doors",
    subCategoryId: "SUB-104-1",
    subCategoryName: "Textured Woodgrain",
    price: 14800,
    badge: "Scratch Resistant",
    tagline: "Modern Durable Living",
    status: "Published",
    stock: 42,
    image: "/assets/img/portfolio/portfolio5_4.jpg",
    description: "Zero-maintenance 1.2mm textured matte laminate fused over treated solid timber frame. Impervious to scratches and domestic chemicals.",
    features: ["1.2mm HPL Sheet", "Zero Color Fade", "Moisture Resistant Core", "Easy Wipe Clean"],
    createdAt: "2026-08-25"
  },
  {
    id: "PRD-205",
    name: "Classic 4-Panel Moulded HDF Skin Door",
    sku: "JJD-SKIN-005",
    categoryId: "CAT-105",
    categoryName: "Moulded Skin & Primer Doors",
    subCategoryId: "SUB-105-1",
    subCategoryName: "2-Panel & 4-Panel Skin",
    price: 8900,
    badge: "Engineered Grain",
    tagline: "Elegant Textured Aesthetic",
    status: "Published",
    stock: 60,
    image: "/assets/img/portfolio/portfolio8_1.jpg",
    description: "High-density embossed fibre skin engineered with woodgrain grain texture. Lightweight yet sturdy for bedroom and corridor suites.",
    features: ["German HDF Skin", "Honey-comb Stability Core", "Kiln Dried Pine Internal Frame", "Eco-friendly Binder"],
    createdAt: "2026-08-24"
  },
  {
    id: "PRD-206",
    name: "Hydro-Shield 100% Waterproof WPC Door",
    sku: "JJD-WPC-006",
    categoryId: "CAT-106",
    categoryName: "WPC 100% Waterproof Doors",
    subCategoryId: "SUB-106-1",
    subCategoryName: "Bathroom & Wet Zone",
    price: 12500,
    badge: "100% Waterproof",
    tagline: "Zero Termite • Moisture Proof",
    status: "Published",
    stock: 35,
    image: "/assets/img/portfolio/portfolio8_4.jpg",
    description: "Engineered composite of wood fiber and virgin polymer. Ideal for bathrooms, balconies, wash areas, and wet environments.",
    features: ["Zero Swelling in Water", "100% Termite & Borer Proof", "Flame Retardant Class-1", "25-Year Warranty"],
    createdAt: "2026-08-23"
  }
];

export const ADMIN_STATS = {
  totalProducts: 90,
  totalCategories: 6,
  activeInquiries: 34,
  monthlyViews: "18.4K",
  productsGrowth: "+14.8%",
  categoriesGrowth: "+2 new",
  inquiriesGrowth: "+28.5%",
  viewsGrowth: "+32.1%"
};

export const RECENT_ACTIVITIES = [
  { id: 1, action: "Added new product", item: "Royal Heritage Teak Main Door", user: "Admin (Harshil)", time: "12 mins ago", type: "product" },
  { id: 2, action: "Created category", item: "WPC 100% Waterproof Doors", user: "Admin (Harshil)", time: "2 hours ago", type: "category" },
  { id: 3, action: "Updated stock count", item: "Nordic Woodgrain Laminate", user: "Inventory Mgr", time: "5 hours ago", type: "stock" },
  { id: 4, action: "Exported catalog PDF", item: "Full JJ Doors Catalog", user: "Admin (Harshil)", time: "1 day ago", type: "system" }
];
