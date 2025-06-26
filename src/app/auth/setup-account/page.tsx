
'use client';

import { useSelector } from 'react-redux';
import { selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressForm, type AddressResponse } from '@/components/features/auth/address-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

// For now, let's assume the flow is: Address -> Dashboard
// We can add the Warehouse step later.

export default function SetupAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useSelector(selectUser) as MyProfile | null;
  
  // This could be expanded to handle multiple steps, e.g., 'address', 'warehouse'
  const [currentStep, setCurrentStep] = useState('address');

  const handleAddressSuccess = (addressData: AddressResponse) => {
    toast({
      title: "Address Saved!",
      description: "Your primary business address has been added.",
    });
    
    // In the future, this would transition to the next step:
    // setCurrentStep('warehouse');
    // For now, we redirect to the dashboard.
    router.push('/seller/dashboard');
  };

  return (
    <RoleProtectedRoute expectedRole="SELLER">
      <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-center">Set Up Your Seller Account</CardTitle>
            <CardDescription className="text-center">
              Just a few more details to get you started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 'address' && (
              <div>
                <h3 className="font-headline text-xl font-semibold mb-4 text-center">Step 1: Add Your Primary Business Address</h3>
                <AddressForm
                  onSuccess={handleAddressSuccess}
                  addressType="SHIPPING" // The first address for a seller should be a shipping address, which can be tied to a warehouse.
                  isDefault={true}
                />
              </div>
            )}
            {/* 
            {currentStep === 'warehouse' && (
              // Warehouse form would go here
            )}
            */}
          </CardContent>
        </Card>
      </div>
    </RoleProtectedRoute>
  );
}
