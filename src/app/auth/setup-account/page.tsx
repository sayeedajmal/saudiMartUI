
'use client';

import { useSelector } from 'react-redux';
import { selectUser, type MyProfile, selectAccessToken } from '@/lib/redux/slices/userSlice';
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressForm, type AddressResponse } from '@/components/features/auth/address-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const warehouseSetupSchema = z.object({
  name: z.string().min(3, "Warehouse name is required."),
});
type WarehouseSetupFormValues = z.infer<typeof warehouseSetupSchema>;

export default function SetupAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useSelector(selectUser) as MyProfile | null;
  const accessToken = useSelector(selectAccessToken);
  
  const [currentStep, setCurrentStep] = useState<'address' | 'warehouse'>('address');
  const [createdAddress, setCreatedAddress] = useState<AddressResponse | null>(null);

  const form = useForm<WarehouseSetupFormValues>({
    resolver: zodResolver(warehouseSetupSchema),
    defaultValues: { name: "" },
  });

  const handleAddressSuccess = (addressData: AddressResponse) => {
    toast({
      title: "Address Saved!",
      description: "Your primary business address has been added. Now, let's set up your first warehouse.",
    });
    setCreatedAddress(addressData);
    setCurrentStep('warehouse');
  };

  const handleWarehouseSubmit = async (values: WarehouseSetupFormValues) => {
    if (!createdAddress || !user || !accessToken) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required information (user, address, or token) to create a warehouse.",
      });
      return;
    }

    form.formState.isSubmitting;
    try {
        const payload = {
            seller: { id: user.id },
            name: values.name,
            address: { id: createdAddress.id },
            isActive: true,
        };

        const response = await fetch(`${API_BASE_URL}/warehouses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || "Failed to create warehouse.");
        }

        toast({
            title: "Warehouse Created!",
            description: "Your account setup is complete. Redirecting to your dashboard.",
        });
        router.push('/seller/dashboard');

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Creating Warehouse",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        form.formState.isSubmitting;
    }
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
                  addressType="SHIPPING" 
                  isDefault={true}
                />
              </div>
            )}
            
            {currentStep === 'warehouse' && (
              <div>
                <h3 className="font-headline text-xl font-semibold mb-4 text-center">Step 2: Name Your First Warehouse</h3>
                <p className="text-sm text-center text-muted-foreground mb-6">This warehouse will be associated with the address you just entered.</p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleWarehouseSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warehouse Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Main Riyadh Warehouse" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="flex justify-end pt-4">
                            <Button type="submit" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                                ) : (
                                "Complete Setup & Go to Dashboard"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleProtectedRoute>
  );
}
