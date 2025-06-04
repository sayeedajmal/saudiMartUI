
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DUMMY_PRODUCTS, type Product } from '@/lib/types';
import { Minus, Plus, Trash2, AlertTriangle, Info, PackageCheck, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem extends Product {
  quantity: number;
  // Potentially add selectedVariants here if needed later
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with a few dummy items for demonstration
    const initialCartItems: CartItem[] = DUMMY_PRODUCTS.slice(0, 2).map((product, index) => ({
      ...product,
      quantity: product.moq + index, // Vary quantities, ensure some meet MOQ
    }));
    setCartItems(initialCartItems);
  }, []);

  const handleQuantityChange = (id: string, amount: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      ).filter(item => item.quantity > 0) // Remove if quantity becomes 0 or less
    );
  };

  const handleInputChange = (id: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };


  const handleRemoveItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    toast({
        title: "Item Removed",
        description: "The item has been removed from your quote cart.",
    });
  };

  const handleSubmitQuote = () => {
    console.log("Submitting quote for items:", cartItems);
    // Check if all items meet MOQ before submitting
    const itemsBelowMoq = cartItems.filter(item => item.quantity < item.moq);
    if (itemsBelowMoq.length > 0) {
        toast({
            variant: "destructive",
            title: "MOQ Alert",
            description: `Some items are below their MOQ. Please adjust quantities. (${itemsBelowMoq.map(i => i.name).join(', ')})`,
        });
        return;
    }
    toast({
      title: "Quote Request Submitted (Placeholder)",
      description: "Your quote request has been sent. Sellers will respond soon.",
    });
    // Potentially clear cart or redirect: setCartItems([]);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/products" className="text-sm text-primary hover:underline flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" /> Continue Shopping
        </Link>
      </div>
      <h1 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-center">My Quote Cart</h1>

      {cartItems.length === 0 ? (
        <Card className="shadow-lg text-center py-12">
            <CardHeader>
                <PackageCheck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="font-headline text-2xl">Your Quote Cart is Empty</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                    You haven't added any products to your quote cart yet. Browse our products to get started.
                </CardDescription>
            </CardContent>
            <CardFooter className="justify-center">
                 <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/products">Browse Products</Link>
                </Button>
            </CardFooter>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map(item => (
              <Card key={item.id} className="shadow-md overflow-hidden">
                <div className="flex p-4 gap-4">
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-md overflow-hidden border">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={item.dataAiHint || item.category.toLowerCase()}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.slug}`} className="hover:text-primary">
                        <h3 className="font-headline text-lg font-semibold">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className="text-sm font-medium text-primary mt-1">${item.price.toFixed(2)} / unit</p>
                       <p className="text-xs text-muted-foreground mt-0.5">MOQ: {item.moq}</p>
                    </div>
                     {item.quantity < item.moq && (
                      <Alert variant="destructive" className="mt-2 p-2 text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Quantity is below MOQ ({item.moq}).
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between space-y-2">
                     <div className="flex items-center">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val > 0) {
                                handleInputChange(item.id, val);
                            } else if (e.target.value === '') {
                                // Allow temporary empty state, re-validate on blur or keep as 1
                                handleInputChange(item.id, 1);
                            }
                        }}
                        onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (isNaN(val) || val < 1) {
                                handleInputChange(item.id, 1); // Reset to 1 if invalid on blur
                            }
                        }}
                        className="w-16 h-8 text-center mx-1"
                        min="1"
                      />
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-24"> {/* sticky top for summary */}
              <CardHeader>
                <CardTitle className="font-headline text-xl">Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items:</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Subtotal:</span>
                  <span className="font-semibold text-xl">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <Separator />
                <Alert className="bg-secondary/50">
                  <Info className="h-5 w-5" />
                  <AlertTitle className="font-semibold">Estimated Delivery</AlertTitle>
                  <AlertDescription className="text-xs">
                    Actual delivery dates will be provided by sellers in their quotes.
                  </AlertDescription>
                </Alert>
                 <Alert className="bg-secondary/50">
                  <Info className="h-5 w-5" />
                  <AlertTitle className="font-semibold">MOQ Notes</AlertTitle>
                  <AlertDescription className="text-xs">
                    Sellers may have Minimum Order Quantities (MOQs). Ensure your requested quantities meet these requirements for faster processing.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSubmitQuote}>
                  Submit Quote Request
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
