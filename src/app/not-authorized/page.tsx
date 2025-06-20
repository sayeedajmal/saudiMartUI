
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';

export default function NotAuthorizedPage() {
  const router = useRouter();
  const user = useSelector(selectUser) as MyProfile | null;

  const handleGoToDashboard = () => {
    if (user) {
      if (user.role === 'BUYER') {
        router.push('/buyer/dashboard');
      } else if (user.role === 'SELLER') {
        router.push('/seller/dashboard');
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } else {
      router.push('/'); // Fallback if user somehow null but trying to go to dashboard
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8 bg-secondary">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader className="pt-8">
          <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
          <CardTitle className="font-headline text-3xl">Access Denied</CardTitle>
          <CardDescription>
            You do not have the necessary permissions to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The page you are attempting to access is restricted based on your current role. Please contact support if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pb-8">
          <Button onClick={handleGoToDashboard} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
            Go to My Dashboard
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
