
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ShieldCheck, MessageSquare, BarChart3, Settings2 } from "lucide-react";

const features = [
  { title: "Effortless Sourcing", description: "Find verified suppliers and quality products with ease.", icon: Zap, hint: "search efficiency" },
  { title: "Secure Transactions", description: "Safe and transparent payment and order processing.", icon: ShieldCheck, hint: "secure payment" },
  { title: "Direct Communication", description: "Connect directly with sellers for inquiries and quotes.", icon: MessageSquare, hint: "business chat" },
  { title: "AI-Powered Assistance", description: "Smart tools to help you manage your business.", icon: Settings2, hint: "ai assistant" },
];

export default function PlatformFeaturesSection() {
  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-4">
          Why Choose SaudiMart?
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          We provide a robust platform packed with features to streamline your B2B operations and drive growth.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
