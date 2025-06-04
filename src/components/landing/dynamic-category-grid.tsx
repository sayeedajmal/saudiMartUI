
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  { name: "Electronics", slug: "electronics", imgSrc: "https://placehold.co/400x300.png", hint: "electronics components" },
  { name: "Construction Materials", slug: "construction", imgSrc: "https://placehold.co/400x300.png", hint: "building materials" },
  { name: "Industrial Supplies", slug: "industrial", imgSrc: "https://placehold.co/400x300.png", hint: "factory equipment" },
  { name: "Food & Beverage", slug: "food-beverage", imgSrc: "https://placehold.co/400x300.png", hint: "bulk food" },
];

export default function DynamicCategoryGrid() {
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
          {categories.map((category) => (
            <Card key={category.slug} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={category.imgSrc}
                    alt={category.name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={category.hint}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-xl mb-2">{category.name}</CardTitle>
                {/* Placeholder for product count or short description */}
                <p className="text-sm text-muted-foreground">Featured products available.</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/products?category=${category.slug}`}>
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
