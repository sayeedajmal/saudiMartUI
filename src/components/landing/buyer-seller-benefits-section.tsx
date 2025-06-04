
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, Users, TrendingUp } from "lucide-react";

const buyerBenefits = [
  { text: "Access to a wide range of verified suppliers." },
  { text: "Competitive pricing and bulk order discounts." },
  { text: "Streamlined procurement and inquiry process." },
  { text: "Secure payment options and order tracking." },
];

const sellerBenefits = [
  { text: "Reach a larger pool of potential B2B buyers." },
  { text: "Showcase products with detailed listings." },
  { text: "Manage inquiries and quotes efficiently." },
  { text: "Tools for analytics and business growth." },
];

export default function BuyerSellerBenefitsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
          Benefits for Buyers & Sellers
        </h2>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="h-10 w-10 text-primary" />
                <CardTitle className="font-headline text-2xl">For Buyers</CardTitle>
              </div>
              <CardDescription>Unlock efficiency and find the best deals for your business needs.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {buyerBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
               <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-10 w-10 text-primary" />
                <CardTitle className="font-headline text-2xl">For Sellers</CardTitle>
              </div>
              <CardDescription>Expand your market reach and grow your B2B sales effortlessly.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {sellerBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
