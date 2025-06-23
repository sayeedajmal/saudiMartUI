import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { API_BASE_URL } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  imageUrl: string;
  description: string | null;
}

// Helper function to create a URL-friendly slug from a category name
const createSlug = (name: string) => {
  return name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

async function getActiveCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories?isActive=true`, {
            cache: 'no-store', // Fetches fresh data on each request
        });
        if (!response.ok) {
            console.error("Failed to fetch categories:", response.statusText);
            return [];
        }
        const responseData = await response.json();
        return responseData.data || [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export default async function DynamicCategoryGrid() {
  const allCategories: Category[] = await getActiveCategories();
  // We'll only display the first 4 categories on the landing page for a clean look
  const categoriesToDisplay = allCategories.slice(0, 4);

  // If there are no categories to display, we can hide the entire section
  if (categoriesToDisplay.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-4">
          Explore Popular Categories
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Discover a wide range of products across various industries to meet your business needs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesToDisplay.map((category) => (
            <Card key={category.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={category.imageUrl || "https://placehold.co/400x300.png"}
                    alt={category.name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="product category"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-xl mb-2">{category.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2" title={category.description || ''}>
                  {category.description || 'Featured products available.'}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/products?category=${createSlug(category.name)}`}>
                    View Products <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/products">
              Explore All Categories
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
