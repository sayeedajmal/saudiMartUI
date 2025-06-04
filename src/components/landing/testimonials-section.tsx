
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Al-Fahad",
    role: "Procurement Manager, ABC Corp",
    testimonial: "SaudiMart has revolutionized how we source materials. The platform is intuitive and connects us with reliable suppliers quickly.",
    avatarSrc: "https://placehold.co/100x100.png",
    avatarFallback: "AA",
    rating: 5,
    hint: "male portrait"
  },
  {
    name: "Fatima Al-Zahrani",
    role: "Owner, XYZ Manufacturing",
    testimonial: "As a seller, SaudiMart opened up new markets for us. The enquiry management tools are fantastic for our sales process.",
    avatarSrc: "https://placehold.co/100x100.png",
    avatarFallback: "FZ",
    rating: 5,
    hint: "female portrait"
  },
  {
    name: "Khalid Ibrahim",
    role: "CEO, KSA Logistics",
    testimonial: "The efficiency and transparency SaudiMart offers are unmatched. It's become an indispensable tool for our B2B operations.",
    avatarSrc: "https://placehold.co/100x100.png",
    avatarFallback: "KI",
    rating: 4,
    hint: "man business"
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="container">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-4">
          Trusted by Businesses Like Yours
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Hear what our satisfied buyers and sellers have to say about their experience with SaudiMart.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatarSrc} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                  <AvatarFallback>{testimonial.avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-headline font-semibold">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-sm text-foreground leading-relaxed">
                  "{testimonial.testimonial}"
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="flex items-center">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
