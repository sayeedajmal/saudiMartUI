
'use client';

import type { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, MessageSquare } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative h-48 w-full">
            <Image
              src={product.imageUrl}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint={product.dataAiHint || product.category.toLowerCase()}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.slug}`} className="block">
          <CardTitle className="font-headline text-lg mb-1 hover:text-primary transition-colors truncate" title={product.name}>
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
        <div className="flex items-center mb-2">
          <span className="text-xl font-semibold text-primary mr-2">${product.price.toFixed(2)}</span>
          {product.availability === 'out-of-stock' && (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
          {product.availability === 'pre-order' && (
            <Badge variant="secondary">Pre-Order</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-2">MOQ: {product.moq} units</p>
        <div className="flex items-center text-sm">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
                }`}
              />
            ))}
          <span className="ml-1 text-muted-foreground">({product.rating.toFixed(1)})</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
           <Link href={`/products/${product.slug}?action=inquire`}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Inquire
          </Link>
        </Button>
        <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" asChild>
          <Link href={`/products/${product.slug}?action=add-to-quote`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Quote
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
