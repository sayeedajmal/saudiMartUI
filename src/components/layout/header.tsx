
'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShoppingCart, LogOut, UserCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import logo from "../../assets/AppIconLogo.png"
import { ThemeToggleButton } from './theme-toggle-button';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, logout, type MyProfile } from '@/lib/redux/slices/userSlice';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser) as MyProfile | null; // Cast to MyProfile or null
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image
            src={logo}
            alt="SaudiMart Logo"
            width={40}
            height={40}
            className="h-8 w-8 md:h-10 md:w-10"
          />
          <span className="hidden font-headline font-bold text-xl md:inline">
            SaudiMart
          </span>
        </Link>
        <nav className="hidden flex-1 items-center space-x-6 md:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Products
          </Link>
          {isAuthenticated && user?.role === 'BUYER' && (
             <Link href="/buyer/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Buyer Dashboard
             </Link>
          )}
          {isAuthenticated && user?.role === 'SELLER' && (
             <Link href="/seller/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Seller Dashboard
             </Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:flex-initial">
          <ThemeToggleButton />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Quote Cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9">
                    <AvatarImage src={user.profileImageUrl || `https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name || "User"} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  if (user.role === 'BUYER') router.push('/buyer/dashboard');
                  else if (user.role === 'SELLER') router.push('/seller/dashboard');
                  // else if (user.role === 'ADMIN') router.push('/admin/dashboard'); // Future
                  else router.push('/');
                }}>
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild className="hidden sm:inline-flex">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90 hidden sm:inline-flex"
                asChild
              >
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
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
                  <Image
                    src={logo}
                    alt="SaudiMart Logo"
                    width={28}
                    height={28}
                  />
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
                 {isAuthenticated && user?.role === 'BUYER' && (
                    <Link href="/buyer/dashboard" className="text-muted-foreground hover:text-primary">Buyer Dashboard</Link>
                  )}
                  {isAuthenticated && user?.role === 'SELLER' && (
                    <Link href="/seller/dashboard" className="text-muted-foreground hover:text-primary">Seller Dashboard</Link>
                  )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Theme</span>
                  <ThemeToggleButton />
                </div>
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full justify-center"
                    onClick={handleLogout}
                  >
                    <span><LogOut className="mr-2 h-4 w-4" />Log out</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full justify-center"
                    >
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button
                      size="sm"
                      asChild
                      className="w-full justify-center bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Link href="/auth/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
