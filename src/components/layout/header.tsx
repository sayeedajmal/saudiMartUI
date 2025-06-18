import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { ThemeToggleButton } from "./theme-toggle-button";
import logo from "../../assets/AppIconLogo.png"
export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src={logo} alt="SaudiMart Logo" className="h-8 w-8" />

          {/* <Package2 className="h-6 w-6 text-primary" /> */}
          <span className="font-headline font-bold text-xl">SaudiMart</span>
        </Link>
        <nav className="hidden flex-1 items-center space-x-6 md:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Products
          </Link>
          {/* Add more desktop nav links here as needed */}
          {/* <Link href="/buyer/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Buyer Dashboard
          </Link>
          <Link href="/seller/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Seller Dashboard
          </Link> */}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:flex-initial">
          <ThemeToggleButton />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Quote Cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
        <div className="ml-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-3/4 p-6">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Package2 className="h-6 w-6 text-primary" />
                  <span className="font-headline">SaudiMart</span>
                </Link>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-primary"
                >
                  Products
                </Link>
                <Link
                  href="/cart"
                  className="text-muted-foreground hover:text-primary flex items-center"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> Quote Cart
                </Link>
                {/* <Link href="/buyer/dashboard" className="text-muted-foreground hover:text-primary">Buyer Dashboard</Link> */}
                {/* <Link href="/seller/dashboard" className="text-muted-foreground hover:text-primary">Seller Dashboard</Link> */}
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <ThemeToggleButton />
                </div>
                <Link href="/auth/login" className="hover:text-primary">
                  Login
                </Link>
                <Link href="/auth/signup" className="hover:text-primary">
                  Sign Up
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
