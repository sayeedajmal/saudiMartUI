
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/products/product-card';
import type { ApiProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Search, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
}

export default function ProductListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // State for all data
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State for UI
  const [displayedProducts, setDisplayedProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minMoq, setMinMoq] = useState('');
  const [availability, setAvailability] = useState({ inStock: false });
  const [sortBy, setSortBy] = useState('relevance');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories?isActive=true&size=100`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data?.content || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const fetchAllProductsForCategory = useCallback(async (category: string) => {
    setIsLoading(true);
    setError(null);
    let allFetchedProducts: ApiProduct[] = [];
    let currentPage = 0;
    let totalPages = 1;

    try {
      // Fetch all pages for the selected category
      do {
        const params = new URLSearchParams();
        params.append('page', String(currentPage));
        params.append('size', '50'); // Fetch in larger chunks
        if (category !== 'All') {
          params.append('categoryName', category);
        }

        const response = await fetch(`${API_BASE_URL}/products/category?${params.toString()}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch products');
        }
        
        const data = await response.json();
        const content = data.data?.content || [];
        allFetchedProducts = [...allFetchedProducts, ...content];
        totalPages = data.data?.totalPages || 1;
        currentPage++;
      } while (currentPage < totalPages);
      
      setAllProducts(allFetchedProducts);

    } catch (err: any) {
      setError(err.message);
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchAllProductsForCategory(selectedCategory);
  }, [selectedCategory, fetchAllProductsForCategory]);
  
  // New useEffect to update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    // Use router.replace to update the URL without adding to history
    router.replace(`${pathname}?${params.toString()}`);
  }, [selectedCategory, pathname, router]);


  // This effect handles all client-side filtering and sorting
  useEffect(() => {
    let productsToDisplay = [...allProducts];

    // Apply search term filter
    if (searchTerm) {
      productsToDisplay = productsToDisplay.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price range filter
    productsToDisplay = productsToDisplay.filter(p => {
        const price = p.basePrice || 0;
        return price >= priceRange[0] && (priceRange[1] >= 5000 ? true : price <= priceRange[1]);
    });

    // Apply MOQ filter
    if (minMoq) {
      const moq = parseInt(minMoq, 10);
      if (!isNaN(moq)) {
        productsToDisplay = productsToDisplay.filter(p => p.minimumOrderQuantity >= moq);
      }
    }

    // Apply availability filter
    if (availability.inStock) {
      productsToDisplay = productsToDisplay.filter(p => p.available);
    }

    // Apply sorting
    if (sortBy === 'price,asc') {
      productsToDisplay.sort((a, b) => (a.basePrice || 0) - (a.basePrice || 0));
    } else if (sortBy === 'price,desc') {
      productsToDisplay.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    }

    setDisplayedProducts(productsToDisplay);

  }, [allProducts, searchTerm, priceRange, minMoq, availability, sortBy]);

  const renderSkeletons = () => (
    [...Array(9)].map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden shadow-lg h-full">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 flex-grow space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
            </CardContent>
            <CardFooter className="p-4 flex gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    ))
  );

  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-center">Explore Our Products</h1>
        <p className="text-muted-foreground text-center mt-2">
          Find the best B2B deals for your business needs.
        </p>
      </header>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="md:col-span-1 space-y-6">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center">
                <Filter className="mr-2 h-5 w-5 text-primary" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price Range: ${priceRange[0]} - ${priceRange[1] === 5000 ? '5000+' : priceRange[1]}</Label>
                <Slider defaultValue={[0, 5000]} min={0} max={5000} step={100} value={priceRange} onValueChange={(value) => setPriceRange(value as [number, number])} className="mt-2"/>
              </div>
              <div>
                <Label htmlFor="moq-filter">Minimum Order Quantity (MOQ)</Label>
                <Input id="moq-filter" type="number" placeholder="e.g., 10" value={minMoq} onChange={(e) => setMinMoq(e.target.value)}/>
              </div>
              <div>
                <Label>Availability</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox id="in-stock" checked={availability.inStock} onCheckedChange={(checked) => setAvailability({ inStock: !!checked })}/>
                  <Label htmlFor="in-stock" className="font-normal">In Stock Only</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Product Grid and Controls */}
        <main className="md:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:max-w-xs">
               <Input 
                 type="search" 
                 placeholder="Search products..." 
                 className="pl-10" 
                 onChange={(e) => setSearchTerm(e.target.value)}
                />
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price,asc">Price: Low to High</SelectItem>
                  <SelectItem value="price,desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {error && <div className="text-center py-12 text-destructive"><p>{error}</p></div>}

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? renderSkeletons() : displayedProducts.length > 0 ? (
                displayedProducts.map((product) => ( <ProductCard key={product.id} product={product} /> ))
            ) : (
                <div className="text-center py-12 col-span-full">
                    <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
