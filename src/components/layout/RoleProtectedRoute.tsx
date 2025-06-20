
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsAuthenticated, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: ReactNode;
  expectedRole: 'BUYER' | 'SELLER' | 'ADMIN' | string;
}

export default function RoleProtectedRoute({ children, expectedRole }: RoleProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser) as MyProfile | null;
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // This effect handles the logic after Redux state is potentially hydrated from localStorage
    
    // If isAuthenticated is definitively false (meaning no valid token was found after initial load)
    if (isAuthenticated === false && user === null) {
      router.replace('/auth/login');
      return; // Exit early
    }

    // If isAuthenticated is true, we expect a user object.
    if (isAuthenticated && user) {
      if (user.role !== expectedRole) {
        router.replace('/not-authorized');
      } else {
        setIsVerifying(false); // Role matches, verification complete
      }
    }
    // If isAuthenticated is true but user is null, it implies Redux state might still be rehydrating
    // or there's an inconsistent state. The isVerifying flag remains true, showing the loader.
    // The effect will re-run once user or isAuthenticated updates.
    
  }, [isAuthenticated, user, router, expectedRole]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}

