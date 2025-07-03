
'use client';

import { useParams } from 'next/navigation';
import type { ApiProduct, ProductVariant } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Send, AlertTriangle, ChevronLeft, ChevronRight, Minus, Plus, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = typeof params.slug === 'string' ? params.slug : '';
  const { toast } = useToast();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError("Product ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to fetch product.");
      }
      setProduct(responseData.data);
      if (responseData.data?.variants?.length > 0) {
        setSelectedVariant(responseData.data.variants[0]);
        setQuantity(responseData.data.minimumOrderQuantity || 1);
      }
    } catch (err: any) {
      setError(err.message);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    // When selected variant changes, reset image index
    setSelectedImageIndex(0);
  }, [selectedVariant]);

  const handleVariantChange = (variantId: string) => {
    const newVariant = product?.variants.find(v => v.id === variantId);
    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };

  const handleQuantityChange = (amount: number) => {
    const moq = product?.minimumOrderQuantity || 1;
    setQuantity(prev => Math.max(moq, prev + amount));
  };

  const handleAddToCart = () => {
    console.log("Add to cart:", product?.name, quantity, selectedVariant?.variantName);
    toast({
      title: "Added to Quote Cart (Placeholder)",
      description: `${product?.name} (Qty: ${quantity}) has been added to your quote cart.`,
    });
  };

  const handleSendInquiry = () => {
    console.log("Send inquiry:", product?.name, quantity, selectedVariant?.variantName);
    toast({
      title: "Inquiry Sent (Placeholder)",
      description: `Your inquiry for ${product?.name} has been sent.`,
    });
  };

  const imagesToShow = selectedVariant?.images || [];

  const nextImage = () => setSelectedImageIndex(prev => (prev + 1) % imagesToShow.length);
  const prevImage = () => setSelectedImageIndex(prev => (prev - 1 + imagesToShow.length) % imagesToShow.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-12 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="font-headline text-3xl font-bold">{error ? "Error Loading Product" : "Product Not Found"}</h1>
        <p className="text-muted-foreground mt-2">
          {error || "Sorry, we couldn't find the product you were looking for."}
        </p>
        <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href={`/products${product?.category?.name ? `?category=${encodeURIComponent(product.category.name)}` : ''}`}>Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href={`/products${product?.category?.name ? `?category=${encodeURIComponent(product.category.name)}` : ''}`} className="text-sm text-primary hover:underline flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Products
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg mb-4 border">
            {imagesToShow.length > 0 ? (
              <Image
                key={imagesToShow[selectedImageIndex]?.id}
                src={imagesToShow[selectedImageIndex]?.imageUrl}
                alt={imagesToShow[selectedImageIndex]?.altText || `${product.name} - Image ${selectedImageIndex + 1}`}
                layout="fill"
                objectFit="contain"
                data-ai-hint={product.category?.name.toLowerCase() || 'product'}
              />
            ) : <div className="bg-muted h-full w-full flex items-center justify-center">No Image</div>}

            {imagesToShow.length > 1 && (
              <>
                <Button variant="outline" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80" onClick={prevImage}> <ChevronLeft className="h-6 w-6" /> </Button>
                <Button variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80" onClick={nextImage}> <ChevronRight className="h-6 w-6" /> </Button>
              </>
            )}
          </div>
          {imagesToShow.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {imagesToShow.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 ${selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    } hover:border-primary/50 transition-all`}
                >
                  <Image src={img.imageUrl} alt={img.altText || `Thumbnail ${index + 1}`} layout="fill" objectFit="cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl lg:text-4xl">{product.name}</CardTitle>
            <div className="flex items-center mt-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Seller: {product.seller?.name || 'N/A'}</span>
            </div>
            <div className="mt-3">
              {!product.available && <Badge variant="destructive">Unavailable</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary mb-4">${selectedVariant?.basePrice?.toFixed(2) || product.basePrice?.toFixed(2) || 'N/A'}</p>

            <p className="text-muted-foreground whitespace-pre-line text-sm mb-6">{product.description}</p>
            <Separator className="mb-6" />

            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2 mb-6">
                <Label className="text-sm font-medium">Variant</Label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                      onClick={() => handleVariantChange(variant.id)}
                    >
                      {variant.variantName || variant.sku}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <Label htmlFor="quantity" className="text-sm font-medium">Quantity (MOQ: {product.minimumOrderQuantity})</Label>
              <div className="flex items-center mt-1">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= product.minimumOrderQuantity}> <Minus className="h-4 w-4" /> </Button>
                <Input id="quantity" type="number" value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setQuantity(Math.max(product.minimumOrderQuantity || 1, val));
                  }}
                  onBlur={() => { if (quantity < (product.minimumOrderQuantity || 1)) setQuantity(product.minimumOrderQuantity || 1) }}
                  className="w-20 text-center mx-2" min={product.minimumOrderQuantity}
                />
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}> <Plus className="h-4 w-4" /> </Button>
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="w-full sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart} disabled={!product.available}> <ShoppingCart className="mr-2 h-5 w-5" /> Add to Quote Cart </Button>
            <Button variant="outline" size="lg" className="w-full sm:flex-1" onClick={handleSendInquiry}> <Send className="mr-2 h-5 w-5" /> Send Inquiry </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Product Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            {product.specifications && product.specifications.length > 0 ? (
              <div className="space-y-2">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="flex justify-between text-sm py-2 border-b last:border-b-0">
                    <span className="font-medium text-foreground">{spec.specName}:</span>
                    <span className="text-muted-foreground text-right">{spec.specValue} {spec.unit || ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specifications provided for this product.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
