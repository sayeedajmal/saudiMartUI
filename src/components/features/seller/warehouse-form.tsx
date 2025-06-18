
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const warehouseFormSchema = z.object({
  name: z.string().min(3, { message: "Warehouse name must be at least 3 characters." }).max(100),
  company_name: z.string().max(100).optional().nullable(),
  street_address_1: z.string().min(3, "Street address is required.").max(255),
  street_address_2: z.string().max(255).optional().nullable(),
  city: z.string().min(2, "City is required.").max(100),
  state: z.string().min(2, "State/Province is required.").max(100),
  postal_code: z.string().min(3, "Postal code is required.").max(20),
  country: z.string().min(2, "Country is required.").max(100),
  is_active: z.boolean().default(true),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

interface WarehouseFormProps {
  initialData?: Partial<WarehouseFormValues>;
  onSubmit: (values: WarehouseFormValues) => void; // Simplified for simulation
  onCancel?: () => void;
}

export function WarehouseForm({ initialData, onSubmit, onCancel }: WarehouseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  // const { toast } = useToast(); // Toast is handled by parent page for simulation

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      company_name: initialData?.company_name || "",
      street_address_1: initialData?.street_address_1 || "",
      street_address_2: initialData?.street_address_2 || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postal_code: initialData?.postal_code || "",
      country: initialData?.country || "Saudi Arabia", // Default country
      is_active: initialData?.is_active === undefined ? true : initialData.is_active,
    },
  });

  const handleFormSubmit = async (values: WarehouseFormValues) => {
    setIsLoading(true);
    // In a real app, API call would be here. For now, just pass values up.
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
    onSubmit(values); 
    setIsLoading(false);
    // form.reset(); // Parent component handles closing and state
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Warehouse Name</FormLabel>
              <FormControl>
                <Input id="name" placeholder="e.g., Main Riyadh Warehouse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4"/>
        <h3 className="text-lg font-medium font-headline">Address Details</h3>
        
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="company_name">Company Name (at address, optional)</FormLabel>
              <FormControl>
                <Input id="company_name" placeholder="e.g., My Business Ltd." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street_address_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="street_address_1">Street Address 1</FormLabel>
              <FormControl>
                <Input id="street_address_1" placeholder="e.g., 123 King Fahd Rd" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street_address_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="street_address_2">Street Address 2 (Optional)</FormLabel>
              <FormControl>
                <Input id="street_address_2" placeholder="e.g., Building A, Unit 10" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="city">City</FormLabel>
                <FormControl>
                  <Input id="city" placeholder="e.g., Riyadh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="state">State / Province</FormLabel>
                <FormControl>
                  <Input id="state" placeholder="e.g., Riyadh Province" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="postal_code">Postal Code</FormLabel>
                <FormControl>
                  <Input id="postal_code" placeholder="e.g., 11564" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="country">Country</FormLabel>
                <FormControl>
                  <Input id="country" placeholder="e.g., Saudi Arabia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator className="my-4"/>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Warehouse</FormLabel>
                <FormDescription>
                  Is this warehouse currently operational?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Save Changes' : 'Create Warehouse'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
