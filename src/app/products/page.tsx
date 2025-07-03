
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/product-card';
import type { ApiProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
}

interface PaginationInfo {
    totalPages: number;
    totalElements: number;
    isFirst: boolean;
    isLast: boolean;
    pageNumber: number;
    pageSize: number;
}

export default function ProductListingPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minMoq, setMinMoq] = useState('');
  const [availability, setAvailability] = useState({ inStock: false });
  const [sortBy, setSortBy] = useState('relevance');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    totalPages: 1, totalElements: 0, isFirst: true, isLast: true, pageNumber: 0, pageSize: 9,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories?isActive=true&size=100`); // Fetch a large number of categories
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data?.content || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const fetchProducts = useCallback(async (page = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('size', '9');

      if (searchTerm) params.append('name', searchTerm);
      if (selectedCategory !== 'All') params.append('categoryName', selectedCategory);
      if (priceRange[0] > 0) params.append('minPrice', String(priceRange[0]));
      if (priceRange[1] < 5000) params.append('maxPrice', String(priceRange[1]));
      if (availability.inStock) params.append('available', 'true');
      if (minMoq) params.append('moq', minMoq);
      if (sortBy !== 'relevance') params.append('sortBy', sortBy);

      console.log("HELLO FROM PARAM: ",params.toString())
      const response = await fetch(`${API_BASE_URL}/products/category?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.data?.content || []);
      setPaginationInfo({
        totalPages: data.data?.totalPages || 1,
        totalElements: data.data?.totalElements || 0,
        isFirst: data.data?.first || true,
        isLast: data.data?.last || true,
        pageNumber: data.data?.number || 0,
        pageSize: data.data?.size || 9,
      });
      setCurrentPage(data.data?.number || 0);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, priceRange, minMoq, availability, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  const handleFilterSubmit = () => {
      // Reset to first page on new filter. If already on page 0, fetch must be called manually.
      if (currentPage !== 0) {
        setCurrentPage(0);
      } else {
        fetchProducts(0);
      }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

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
              <Button onClick={handleFilterSubmit} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Product Grid and Controls */}
        <main className="md:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:max-w-xs">
               <Input type="search" placeholder="Search products..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilterSubmit()}/>
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
            {isLoading ? renderSkeletons() : products.length > 0 ? (
                products.map((product) => ( <ProductCard key={product.id} product={product} /> ))
            ) : (
                <div className="text-center py-12 col-span-full">
                    <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
                </div>
            )}
          </div>
          
          {!isLoading && products.length > 0 && paginationInfo.totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-4">
                <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={paginationInfo.isFirst}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
                <span className="text-sm text-muted-foreground">Page {paginationInfo.pageNumber + 1} of {paginationInfo.totalPages}</span>
                <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={paginationInfo.isLast}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
