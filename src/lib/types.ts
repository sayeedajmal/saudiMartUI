// The new product structure based on the API response.

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
}

export interface ProductSpecification {
  id:string;
  specName: string;
  specValue: string;
  unit: string | null;
}

export interface PriceTier {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number;
  isActive: boolean;
  discountPercent?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  variantName: string | null;
  basePrice: number | null;
  additionalPrice: number;
  available: boolean;
  images: ProductImage[];
  priceTiers: PriceTier[];
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string | null;
  category: { id: string; name: string; } | null;
  basePrice: number | null;
  minimumOrderQuantity: number;
  weight: number | null;
  weightUnit: string | null;
  dimensions: string | null;
  sku: string;
  available: boolean;
  createdAt: string;
  updatedAt: string | null;
  seller: { id: string; name: string; };
  specifications: ProductSpecification[];
  variants: ProductVariant[];
}


export const DUMMY_PRODUCTS: ApiProduct[] = [
  {
    id: 'dprod_1',
    name: 'Industrial Grade Steel Beams',
    description: 'High-strength steel beams for construction. Available in various sizes.',
    category: { id: 'cat_construction', name: 'Construction' },
    basePrice: 150.00,
    minimumOrderQuantity: 10,
    weight: 250,
    weightUnit: 'kg',
    dimensions: '10m x 0.5m x 0.3m',
    sku: 'STEEL-BEAM-001',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    seller: { id: 'seller_1', name: 'Global Metals Inc.' },
    specifications: [
      { id: 'spec_1', specName: 'Material', specValue: 'Carbon Steel', unit: null },
      { id: 'spec_2', specName: 'Grade', specValue: 'A36', unit: null },
    ],
    variants: [
      {
        id: 'dvar_1',
        sku: 'STEEL-BEAM-001-VAR1',
        variantName: '10m Length',
        basePrice: 150.00,
        additionalPrice: 0,
        available: true,
        images: [
          { id: 'dimg_1', imageUrl: 'https://placehold.co/600x400.png', altText: 'Steel Beams', isPrimary: true },
        ],
        priceTiers: [
          { id: 'dpt_1', minQuantity: 10, maxQuantity: 49, pricePerUnit: 150.00, isActive: true },
          { id: 'dpt_2', minQuantity: 50, maxQuantity: null, pricePerUnit: 140.00, isActive: true },
        ],
      },
    ],
  },
  {
    id: 'dprod_2',
    name: 'Bulk Cotton Fabric Rolls',
    description: '100% organic cotton fabric rolls for textiles.',
    category: { id: 'cat_textiles', name: 'Textiles' },
    basePrice: 85.00,
    minimumOrderQuantity: 20,
    weight: 50,
    weightUnit: 'kg',
    dimensions: '1.5m width',
    sku: 'COTTON-ROLL-001',
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    seller: { id: 'seller_2', name: 'EcoTextiles Co.' },
    specifications: [
      { id: 'spec_3', specName: 'Material', specValue: 'Organic Cotton', unit: null },
      { id: 'spec_4', specName: 'Color', specValue: 'Natural White', unit: null },
    ],
    variants: [
      {
        id: 'dvar_2',
        sku: 'COTTON-ROLL-001-VAR1',
        variantName: 'Natural White',
        basePrice: 85.00,
        additionalPrice: 0,
        available: true,
        images: [
          { id: 'dimg_2', imageUrl: 'https://placehold.co/600x400.png', altText: 'Cotton Fabric Roll', isPrimary: true },
        ],
        priceTiers: [
          { id: 'dpt_3', minQuantity: 20, maxQuantity: 99, pricePerUnit: 85.00, isActive: true },
          { id: 'dpt_4', minQuantity: 100, maxQuantity: null, pricePerUnit: 78.50, isActive: true },
        ],
      },
    ],
  },
];
