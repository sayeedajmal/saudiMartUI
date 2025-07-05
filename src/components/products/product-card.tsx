
'use client';

import type { ApiProduct } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, MessageSquare } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSelectedProduct } from '@/lib/redux/slices/productSlice';
import { useRouter } from 'next/navigation';

type ProductCardProps = {
  product: ApiProduct;
};

export default function ProductCard({ product }: ProductCardProps) {
    const primaryImage = product.variants?.[0]?.images?.find(img => img.isPrimary) || product.variants?.[0]?.images?.[0];
    const dispatch = useDispatch();
    const router = useRouter();

    const handleNavigate = (path: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        dispatch(setSelectedProduct(product));
        router.push(path);
    };

  return (
    <Card 
        onClick={() => handleNavigate(`/products/${product.id}`)}
        className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full cursor-pointer"
    >
      <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={primaryImage?.imageUrl || 'https://placehold.co/600x400.png'}
              alt={primaryImage?.altText || product.name}
              layout="fill"
              objectFit="cover"
              data-ai-hint={product.category?.name.toLowerCase() || 'product'}
            />
          </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-lg mb-1 hover:text-primary transition-colors truncate" title={product.name}>
            {product.name}
          </CardTitle>
        <p className="text-sm text-muted-foreground mb-2">{product.category?.name || 'Uncategorized'}</p>
        <div className="flex items-center mb-2">
          <span className="text-xl font-semibold text-primary mr-2">${product.basePrice?.toFixed(2) || 'N/A'}</span>
          {!product.available && (
            <Badge variant="destructive">Unavailable</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-2">MOQ: {product.minimumOrderQuantity} units</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
        <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => handleNavigate(`/products/${product.id}?action=inquire`, e)}
        >
            <MessageSquare className="mr-2 h-4 w-4" />
            Inquire
        </Button>
        <Button 
            size="sm" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={(e) => handleNavigate(`/products/${product.id}?action=add-to-quote`, e)}
        >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Quote
        </Button>
      </CardFooter>
    </Card>
  );
}
