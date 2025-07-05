'use client';

import { useParams, useRouter } from 'next/navigation';
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
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentProduct, clearSelectedProduct } from '@/lib/redux/slices/productSlice';
import { selectUser, selectAccessToken, type MyProfile } from '@/lib/redux/slices/userSlice';


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params.slug === 'string' ? params.slug : '';
  const { toast } = useToast();
  const dispatch = useDispatch();

  const productFromState = useSelector(selectCurrentProduct);
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const accessToken = useSelector(selectAccessToken);

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to fetch product.");
      }
      setProduct(responseData.data);
    } catch (err: any) {
      setError(err.message);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (productFromState && productFromState.id.toString() === productId) {
      setProduct(productFromState);
      setIsLoading(false);
    } else {
      if (productId) {
        fetchProduct(productId);
      }
    }
    
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [productId, productFromState, fetchProduct, dispatch]);


  useEffect(() => {
    if (product) {
       if (product.variants?.length > 0) {
        setSelectedVariant(product.variants[0]);
        setQuantity(product.minimumOrderQuantity || 1);
      }
       setSelectedImageIndex(0);
    }
  }, [product]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariant]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (amount: number) => {
    const moq = product?.minimumOrderQuantity || 1;
    setQuantity(prev => Math.max(moq, prev + amount));
  };

  const handleAddToCart = async () => {
    if (!currentUser || !accessToken) {
      toast({
        variant: 'destructive',
        title: 'Please Log In',
        description: 'You must be logged in as a buyer to request a quote.',
      });
      router.push('/auth/login?redirect=/products/' + productId);
      return;
    }

    if (currentUser.role !== 'BUYER') {
      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: 'Only buyers can add items to a quote cart.',
      });
      return;
    }

    if (!product || !selectedVariant) {
      toast({
        variant: 'destructive',
        title: 'Selection Missing',
        description: 'Please select a product variant before adding to the quote cart.',
      });
      return;
    }

    setIsSubmitting(true);

    const quotedPrice = selectedVariant.basePrice || product.basePrice || 0;
    const totalPrice = quantity * quotedPrice;
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);

    const payload = {
      quote: {
        buyer: { id: currentUser.id },
        seller: { id: product.seller.id },
        status: 'DRAFT',
        validUntil: validUntilDate.toISOString().split('T')[0],
        subtotal: totalPrice,
        taxAmount: 0.00,
        totalAmount: totalPrice,
        notes: `Quote initiated from product page for "${product.name}".`,
      },
      product: { id: product.id },
      variant: { id: selectedVariant.id },
      quantity: quantity,
      quotedPrice: quotedPrice,
      discountPercent: 0.00,
      totalPrice: totalPrice,
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/quoteitems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add item to quote.');
      }
      
      toast({
        title: 'Item Added to Quote!',
        description: `${product.name} (${quantity} units) has been added to your draft quote.`,
      });

    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSendInquiry = () => {
    console.log("Send inquiry:", product?.name, quantity, selectedVariant?.variantName);
    toast({
      title: "Inquiry Sent (Placeholder)",
      description: `Your inquiry for ${product?.name} has been sent.`,
    });
  };

  const imagesToShow = selectedVariant?.images || product?.variants?.[0]?.images || [];

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
                fill
                className="object-contain"
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
                  <Image src={img.imageUrl} alt={img.altText || `Thumbnail ${index + 1}`} fill className="object-cover" />
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

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 mb-6">
                <Label className="text-sm font-medium">Variant</Label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                      onClick={() => handleVariantChange(variant)}
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
            <Button size="lg" className="w-full sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart} disabled={!product.available || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Quote Cart
                </>
              )}
            </Button>
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
