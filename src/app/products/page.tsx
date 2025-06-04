
'use client';

import { useState } from 'react';
import ProductCard from '@/components/products/product-card';
import { DUMMY_PRODUCTS, type Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, List, Grid, Star, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const categories = ['All', ...new Set(DUMMY_PRODUCTS.map(p => p.category))];
const ratings = [1, 2, 3, 4, 5];

export default function ProductListingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minMoq, setMinMoq] = useState('');
  const [availability, setAvailability] = useState({
    inStock: false,
    preOrder: false,
  });
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Default to grid

  // Placeholder for filtering logic
  const filteredProducts = DUMMY_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesMoq = minMoq === '' || product.moq >= parseInt(minMoq);
    const matchesAvailability =
        (!availability.inStock && !availability.preOrder) ||
        (availability.inStock && product.availability === 'in-stock') ||
        (availability.preOrder && product.availability === 'pre-order');
    const matchesRating = selectedRating === 0 || Math.floor(product.rating) >= selectedRating;
    return matchesSearch && matchesCategory && matchesPrice && matchesMoq && matchesAvailability && matchesRating;
  });

  // Placeholder for sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'popularity') return b.rating - a.rating; // Simple popularity by rating
    // Add more sorting logic for 'relevance' if needed
    return 0;
  });

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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center">
                <Filter className="mr-2 h-5 w-5 text-primary" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                <Slider
                  defaultValue={[0, 500]}
                  min={0}
                  max={1000} // Max price in your products or a reasonable upper limit
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="moq-filter">Minimum Order Quantity (MOQ)</Label>
                <Input
                  id="moq-filter"
                  type="number"
                  placeholder="e.g., 10"
                  value={minMoq}
                  onChange={(e) => setMinMoq(e.target.value)}
                />
              </div>

              <div>
                <Label>Availability</Label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="in-stock"
                      checked={availability.inStock}
                      onCheckedChange={(checked) => setAvailability(prev => ({ ...prev, inStock: !!checked }))}
                    />
                    <Label htmlFor="in-stock" className="font-normal">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pre-order"
                      checked={availability.preOrder}
                      onCheckedChange={(checked) => setAvailability(prev => ({ ...prev, preOrder: !!checked }))}
                    />
                    <Label htmlFor="pre-order" className="font-normal">Pre-Order</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Minimum Rating</Label>
                <div className="flex space-x-1 mt-1">
                  {ratings.map(rate => (
                    <Button
                      key={rate}
                      variant={selectedRating === rate ? "default" : "outline"}
                      size="icon"
                      onClick={() => setSelectedRating(prev => prev === rate ? 0 : rate)}
                      className="h-8 w-8 gap-1"
                    >
                      {rate} <Star className={`h-3 w-3 ${selectedRating >= rate ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/70' }`} />
                    </Button>
                  ))}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden sm:flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Separator orientation="vertical" className="h-6"/>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {sortedProducts.length > 0 ? (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}

          {/* Placeholder for Pagination */}
          <div className="mt-12 flex justify-center">
            <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">Load More</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
