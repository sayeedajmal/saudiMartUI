
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { getProductBySlug, type Product } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Send, AlertTriangle, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const product = getProductBySlug(slug);
  const { toast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(product?.moq || 1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product?.variants) {
      const initialVariants: Record<string, string> = {};
      product.variants.forEach(variant => {
        initialVariants[variant.type] = variant.options[0];
      });
      setSelectedVariants(initialVariants);
    }
    if (product) {
        setQuantity(product.moq);
    }
  }, [product]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'inquire') {
      // Placeholder for scrolling to inquiry form or opening a modal
      toast({ title: "Inquiry Mode", description: "Please fill out the inquiry form below (not yet implemented)." });
    } else if (action === 'add-to-quote') {
       // Placeholder: Add to quote cart logic
      toast({ title: "Added to Quote Cart (Placeholder)", description: `${product?.name} (Quantity: ${quantity}) added to quote cart.` });
    }
  }, [searchParams, product, quantity, toast]);


  if (!product) {
    return (
      <div className="container py-12 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="font-headline text-3xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground mt-2">
          Sorry, we couldn't find the product you were looking for.
        </p>
        <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantType]: value }));
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(product.moq, prev + amount));
  };
  
  const handleAddToCart = () => {
    console.log("Add to cart:", product.name, quantity, selectedVariants);
    toast({
      title: "Added to Quote Cart (Placeholder)",
      description: `${product.name} (Qty: ${quantity}) has been added to your quote cart.`,
    });
  };

  const handleSendInquiry = () => {
    console.log("Send inquiry:", product.name, quantity, selectedVariants);
     toast({
      title: "Inquiry Sent (Placeholder)",
      description: `Your inquiry for ${product.name} has been sent.`,
    });
  };


  const nextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href="/products" className="text-sm text-primary hover:underline flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Products
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg mb-4 border">
            <Image
              src={product.images[selectedImageIndex]}
              alt={`${product.name} - Image ${selectedImageIndex + 1}`}
              layout="fill"
              objectFit="contain" 
              data-ai-hint={product.dataAiHint || product.category.toLowerCase()}
            />
            {product.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((imgSrc, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  } hover:border-primary/50 transition-all`}
                >
                  <Image src={imgSrc} alt={`Thumbnail ${index + 1}`} layout="fill" objectFit="cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl lg:text-4xl">{product.name}</CardTitle>
            <div className="flex items-center mt-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              <span className="ml-2 text-sm text-muted-foreground">({product.rating.toFixed(1)} rating)</span>
              <Separator orientation="vertical" className="h-5 mx-3" />
              <span className="text-sm text-muted-foreground">Seller: {product.seller}</span>
            </div>
            <div className="mt-3">
              {product.availability === 'in-stock' && <Badge variant="default" className="bg-green-500 hover:bg-green-600">In Stock</Badge>}
              {product.availability === 'out-of-stock' && <Badge variant="destructive">Out of Stock</Badge>}
              {product.availability === 'pre-order' && <Badge variant="secondary">Pre-Order</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary mb-4">${product.price.toFixed(2)}</p>
            
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.variants.map((variant) => (
                  <div key={variant.type}>
                    <Label className="text-sm font-medium">{variant.type}</Label>
                    <Select
                      value={selectedVariants[variant.type]}
                      onValueChange={(value) => handleVariantChange(variant.type, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={`Select ${variant.type.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variant.options.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6">
              <Label htmlFor="quantity" className="text-sm font-medium">Quantity (MOQ: {product.moq})</Label>
              <div className="flex items-center mt-1">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= product.moq}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                          setQuantity(Math.max(product.moq, val));
                      } else if (e.target.value === '') {
                           setQuantity(product.moq); // Or some other default / allow empty temporarily
                      }
                  }}
                  onBlur={() => { if(quantity < product.moq) setQuantity(product.moq)}}
                  className="w-20 text-center mx-2"
                  min={product.moq}
                />
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
               {quantity < product.moq && <p className="text-xs text-destructive mt-1">Quantity cannot be less than MOQ ({product.moq}).</p>}
            </div>

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
                size="lg" 
                className="w-full sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90" 
                onClick={handleAddToCart}
                disabled={product.availability === 'out-of-stock'}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Quote Cart
            </Button>
            <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:flex-1"
                onClick={handleSendInquiry}
            >
              <Send className="mr-2 h-5 w-5" />
              Send Inquiry
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews (Placeholder)</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6 p-6 border rounded-lg shadow-sm">
          <h3 className="font-headline text-xl font-semibold mb-3">Product Description</h3>
          <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
        </TabsContent>
        <TabsContent value="specifications" className="mt-6 p-6 border rounded-lg shadow-sm">
          <h3 className="font-headline text-xl font-semibold mb-4">Product Specifications</h3>
          <div className="space-y-2">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{key}:</span>
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6 p-6 border rounded-lg shadow-sm">
          <h3 className="font-headline text-xl font-semibold mb-3">Customer Reviews</h3>
          <p className="text-muted-foreground">No reviews yet. (Review system not implemented)</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
