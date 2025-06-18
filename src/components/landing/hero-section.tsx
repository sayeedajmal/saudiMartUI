
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container grid md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Connect & Grow Your Business with <span className="text-primary">SaudiMart</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0">
            The premier B2B e-commerce platform in Saudi Arabia, empowering buyers and sellers to thrive in a dynamic marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link href="/auth/signup?role=buyer">Find Products</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup?role=seller">Become a Seller</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
          <Image
            src="/saudimart-hero-meeting.jpg"
            alt="Modern B2B professionals in a Saudi Arabian business meeting"
            layout="fill"
            objectFit="cover"
            data-ai-hint="business meeting saudi arabia"
            className="transform transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>
      </div>
    </section>
  );
}
