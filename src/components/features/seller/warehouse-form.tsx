
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
import type { ApiAddress } from '@/app/seller/dashboard/addresses/page';

const warehouseFormSchema = z.object({
  name: z.string().min(3, { message: "Warehouse name must be at least 3 characters." }).max(100),
  addressId: z.string().min(1, { message: "An address must be selected for the warehouse." }),
  is_active: z.boolean().default(true),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

interface WarehouseFormProps {
  initialData?: Partial<WarehouseFormValues>;
  addresses: ApiAddress[];
  onSubmit: (values: WarehouseFormValues) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  isLoadingAddresses: boolean;
}

export function WarehouseForm({ initialData, addresses, onSubmit, onCancel, isSubmitting, isLoadingAddresses }: WarehouseFormProps) {
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      addressId: initialData?.addressId || "",
      is_active: initialData?.is_active === undefined ? true : initialData.is_active,
    },
  });

  const handleFormSubmit = async (values: WarehouseFormValues) => {
    onSubmit(values);
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
        
        <FormField
          control={form.control}
          name="addressId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to Address</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingAddresses || addresses.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingAddresses ? "Loading addresses..." : "Select an address"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.streetAddress1}, {address.city}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-address" disabled>No addresses found. Please add one first.</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Warehouses must be linked to a saved address. <a href="/seller/dashboard/addresses" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Manage addresses</a>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || isLoadingAddresses}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {initialData ? 'Saving...' : 'Creating...'}</>
            ) : (
              initialData ? 'Save Changes' : 'Create Warehouse'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
