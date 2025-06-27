
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
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const addressFormSchema = z.object({
  addressType: z.enum(['SHIPPING', 'BILLING', 'WAREHOUSE']),
  company_name: z.string().max(100).optional().nullable(),
  street_address_1: z.string().min(3, "Street address is required.").max(255),
  street_address_2: z.string().max(255).optional().nullable(),
  city: z.string().min(2, "City is required.").max(100),
  state: z.string().min(2, "State/Province is required.").max(100),
  postal_code: z.string().min(3, "Postal code is required.").max(20),
  country: z.string().min(2, "Country is required.").max(100),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  initialData?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export function AddressForm({ initialData, onSubmit, onCancel, isSubmitting }: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      addressType: initialData?.addressType || 'SHIPPING',
      company_name: initialData?.company_name || "",
      street_address_1: initialData?.street_address_1 || "",
      street_address_2: initialData?.street_address_2 || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postal_code: initialData?.postal_code || "",
      country: initialData?.country || "Saudi Arabia",
      isDefault: initialData?.isDefault || false, // Ensure isDefault is always a boolean
    },
  });

  const handleFormSubmit = async (values: AddressFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="addressType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SHIPPING">Shipping</SelectItem>
                    <SelectItem value="BILLING">Billing</SelectItem>
                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., My Business Ltd." {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />
        
        <FormField
          control={form.control}
          name="street_address_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address 1</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 King Fahd Rd" {...field} />
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
              <FormLabel>Street Address 2 (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Building A, Unit 10" {...field} value={field.value ?? ''} />
              </FormControl>
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
                <FormControl><Input placeholder="e.g., Riyadh" {...field} /></FormControl>
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
                <FormControl><Input placeholder="e.g., Riyadh Province" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl><Input placeholder="e.g., 11564" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl><Input placeholder="e.g., Saudi Arabia" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Default Address</FormLabel>
                <FormDescription>
                  Make this the default address for its type (e.g., default shipping).
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              'Save Address'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
