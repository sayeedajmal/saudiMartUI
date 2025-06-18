
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Facebook, Twitter, Linkedin, Instagram, Package2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <Separator />
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Package2 className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold">SaudiMart</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your B2B E-commerce Platform for connecting buyers and sellers in Saudi Arabia.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="/help-center" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
              <li><Link href="/seller-guide" className="text-muted-foreground hover:text-primary">Seller Guide</Link></li>
              <li><Link href="/buyer-guide" className="text-muted-foreground hover:text-primary">Buyer Guide</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold mb-3">Contact Info</h3>
            <address className="not-italic text-sm text-muted-foreground space-y-1">
              <p>123 Business Bay, Riyadh, Saudi Arabia</p>
              <p>Email: <a href="mailto:info@saudimart.com" className="hover:text-primary">info@saudimart.com</a></p>
              <p>Phone: <a href="tel:+966112345678" className="hover:text-primary">+966 11 234 5678</a></p>
            </address>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram size={20} /></Link>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SaudiMart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
