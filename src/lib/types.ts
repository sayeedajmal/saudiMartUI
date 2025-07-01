
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
