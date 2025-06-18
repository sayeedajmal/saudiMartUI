
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  moq: number;
  availability: 'in-stock' | 'out-of-stock' | 'pre-order';
  rating: number;
  imageUrl: string;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  variants?: {
    type: string;
    options: string[];
  }[];
  seller: string;
  dataAiHint?: string;
};

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'industrial-grade-widget-pro',
    name: 'Industrial Grade Widget Pro',
    category: 'Widgets',
    price: 150.00,
    moq: 10,
    availability: 'in-stock',
    rating: 4.5,
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/400x300.png', 'https://placehold.co/400x300.png'],
    description: 'The Industrial Grade Widget Pro is built for heavy-duty applications, offering unparalleled performance and durability. Suitable for all major industrial sectors.',
    specifications: { 'Material': 'Hardened Steel', 'Weight': '5kg', 'Dimensions': '10cm x 20cm x 5cm', 'Power Input': '220V AC' },
    variants: [
      { type: 'Color', options: ['Red', 'Blue', 'Black'] },
      { type: 'Size', options: ['Small', 'Medium', 'Large'] },
    ],
    seller: 'Reliable Industrial Co.',
    dataAiHint: 'industrial widget'
  },
  {
    id: '2',
    slug: 'eco-friendly-packaging-solution',
    name: 'Eco-Friendly Packaging Solution',
    category: 'Packaging',
    price: 25.50,
    moq: 100,
    availability: 'in-stock',
    rating: 4.8,
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/400x300.png'],
    description: 'Sustainable and durable packaging solutions for your business. Made from 100% recycled materials, fully biodegradable.',
    specifications: { 'Material': 'Recycled Cardboard', 'Strength': 'Medium Duty', 'Biodegradable': 'Yes' },
    seller: 'GreenPack Supplies',
    dataAiHint: 'eco packaging'
  },
  {
    id: '3',
    slug: 'advanced-circuit-board-model-x',
    name: 'Advanced Circuit Board Model X',
    category: 'Electronics',
    price: 75.00,
    moq: 50,
    availability: 'pre-order',
    rating: 4.2,
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/400x300.png', 'https://placehold.co/400x300.png'],
    description: 'State-of-the-art circuit board for high-performance electronics. Features the latest chipset and robust design.',
    specifications: { 'Processor': 'ARM Cortex A7', 'RAM': '2GB DDR4', 'Connectivity': 'Wi-Fi, Bluetooth 5.0' },
    variants: [
      { type: 'Version', options: ['v1.0', 'v1.1 (Beta)'] }
    ],
    seller: 'TechParts Global',
    dataAiHint: 'circuit board'
  },
  {
    id: '4',
    slug: 'bulk-organic-coffee-beans',
    name: 'Bulk Organic Coffee Beans',
    category: 'Food & Beverage',
    price: 120.00, // Price per KG or unit
    moq: 25, // Kilograms or units
    availability: 'in-stock',
    rating: 4.9,
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/400x300.png'],
    description: 'Premium quality organic Arabica coffee beans, sourced ethically. Perfect for roasters and cafes.',
    specifications: { 'Origin': 'Ethiopia Yirgacheffe', 'Roast Level': 'Medium', 'Certification': 'USDA Organic' },
    seller: 'Global Bean Importers',
    dataAiHint: 'coffee beans'
  },
  {
    id: '5',
    slug: 'heavy-duty-safety-gloves',
    name: 'Heavy-Duty Safety Gloves',
    category: 'Safety Equipment',
    price: 15.00,
    moq: 200,
    availability: 'out-of-stock',
    rating: 4.0,
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png'],
    description: 'Cut-resistant and chemical-resistant safety gloves for industrial use. Provides maximum protection.',
    specifications: { 'Material': 'Kevlar Blend', 'Size': 'Universal', 'Standards': 'EN388 Certified' },
    seller: 'SafetyFirst Ltd.',
    dataAiHint: 'safety gloves'
  },
  {
    id: '6',
    slug: 'precision-cnc-milled-part',
    name: 'Precision CNC Milled Part',
    category: 'Industrial Parts',
    price: 350.00,
    moq: 5,
    availability: 'in-stock',
    rating: 5.0,
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/400x300.png'],
    description: 'Custom precision CNC milled aluminum part. High tolerance and superior finish for demanding applications.',
    specifications: { 'Material': 'Aluminum 6061-T6', 'Tolerance': '+/- 0.01mm', 'Finish': 'Anodized Blue' },
    variants: [{ type: 'Finish', options: ['Anodized Blue', 'Natural Aluminum', 'Powder Coat Black']}],
    seller: 'PrecisionWorks Inc.',
    dataAiHint: 'cnc part'
  },
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return DUMMY_PRODUCTS.find(p => p.slug === slug);
};
