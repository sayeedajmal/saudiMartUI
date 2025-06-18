
import HeroSection from "@/components/landing/hero-section";
import DynamicCategoryGrid from "@/components/landing/dynamic-category-grid";
import PlatformFeaturesSection from "@/components/landing/platform-features-section";
import BuyerSellerBenefitsSection from "@/components/landing/buyer-seller-benefits-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import { Separator } from "@/components/ui/separator";
import AdsBannerSection from "@/components/landing/ads-banner-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <Separator />
      <AdsBannerSection />
      <Separator />
      <DynamicCategoryGrid />
      <Separator />
      <PlatformFeaturesSection />
      <Separator />
      <BuyerSellerBenefitsSection />
      <Separator />
      <TestimonialsSection />
    </>
  );
}
