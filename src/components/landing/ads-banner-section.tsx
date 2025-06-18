
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function AdsBannerSection() {
  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container">
        <div className="relative aspect-[16/5] md:aspect-[16/4] w-full overflow-hidden rounded-lg shadow-lg group">
          <Image
            src="https://placehold.co/1200x300.png"
            alt="Advertisement Banner"
            layout="fill"
            objectFit="cover"
            data-ai-hint="promotional banner"
            className="transform transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
            <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold text-background mb-3">
              Special Offer!
            </h2>
            <p className="text-md md:text-lg text-background/90 mb-6 max-w-xl">
              Discover amazing deals and promotions from our top sellers. Limited time only!
            </p>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/products?promo=special-offer">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
