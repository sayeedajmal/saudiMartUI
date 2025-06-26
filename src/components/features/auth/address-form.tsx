
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { API_BASE_URL } from '@/lib/api';

const addressSchema = z.object({
  companyName: z.string().optional().nullable(),
  streetAddress1: z.string().min(3, "Street address is required."),
  streetAddress2: z.string().optional().nullable(),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State/Province is required."),
  postalCode: z.string().min(3, "Postal code is required."),
  country: z.string().min(2, "Country is required."),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export interface AddressResponse {
    // Define based on what the API returns for an address
    id: number;
    // ... other fields
}

interface AddressFormProps {
  onSuccess: (data: AddressResponse) => void;
  addressType: 'SHIPPING' | 'BILLING' | 'WAREHOUSE';
  isDefault: boolean;
}

export function AddressForm({ onSuccess, addressType, isDefault }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const accessToken = useSelector(selectAccessToken);
  const user = useSelector(selectUser) as MyProfile | null;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      companyName: "",
      streetAddress1: "",
      streetAddress2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA", // Default value
    },
  });

  const handleFormSubmit = async (values: AddressFormValues) => {
    if (!accessToken || !user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "User session not found. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user: { id: user.id },
        addressType,
        isDefault,
        companyName: values.companyName || null,
        streetAddress1: values.streetAddress1,
        streetAddress2: values.streetAddress2 || null,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
      };

      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save address.");
      }

      // Call the onSuccess callback with the response data
      onSuccess(responseData.data);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Saving Address",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Company Name (Optional)</FormLabel>
                <FormControl><Input placeholder="Your Company Inc." {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl><Input placeholder="e.g., USA" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="streetAddress1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address 1</FormLabel>
              <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="streetAddress2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address 2 (Optional)</FormLabel>
              <FormControl><Input placeholder="Apt, Suite, Building" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
                <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl><Input placeholder="Anytown" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
                <FormItem>
                <FormLabel>State / Province</FormLabel>
                <FormControl><Input placeholder="Anystate" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl><Input placeholder="12345" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save and Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
