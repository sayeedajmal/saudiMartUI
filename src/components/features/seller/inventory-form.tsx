
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
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SellerProduct, ProductVariant } from '@/app/seller/dashboard/product-manager/page';
import { ApiWarehouse } from '@/app/seller/dashboard/warehouses/page';
import { useState, useEffect } from 'react';

const inventoryFormSchema = z.object({
  productId: z.string().min(1, "A product must be selected."),
  variantId: z.string().min(1, "A product variant must be selected."),
  warehouseId: z.string().min(1, "A warehouse must be selected."),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  reservedQuantity: z.coerce.number().min(0, "Reserved quantity cannot be negative."),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  initialData?: Partial<InventoryFormValues>;
  products: SellerProduct[];
  warehouses: ApiWarehouse[];
  onSubmit: (values: InventoryFormValues) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  isLoadingDependencies: boolean;
  isEditMode?: boolean;
}

export function InventoryForm({
  initialData,
  products,
  warehouses,
  onSubmit,
  onCancel,
  isSubmitting,
  isLoadingDependencies,
  isEditMode = false,
}: InventoryFormProps) {
  const [availableVariants, setAvailableVariants] = useState<ProductVariant[]>([]);

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      productId: initialData?.productId || "",
      variantId: initialData?.variantId || "",
      warehouseId: initialData?.warehouseId || "",
      quantity: initialData?.quantity || 0,
      reservedQuantity: initialData?.reservedQuantity || 0,
    },
  });

  const selectedProductId = form.watch('productId');

  useEffect(() => {
    if (selectedProductId) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      setAvailableVariants(selectedProduct?.variants || []);
      
      const currentVariantId = form.getValues('variantId');
      if (currentVariantId && !selectedProduct?.variants.some(v => v.id === currentVariantId)) {
          form.setValue('variantId', '');
      }
    } else {
      setAvailableVariants([]);
    }
  }, [selectedProductId, products, form]);

  useEffect(() => {
      if (isEditMode && initialData?.productId) {
           const selectedProduct = products.find(p => p.id === initialData.productId);
           setAvailableVariants(selectedProduct?.variants || []);
      }
  }, [isEditMode, initialData, products]);


  const handleFormSubmit = (values: InventoryFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingDependencies || isEditMode}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger></FormControl>
                <SelectContent>
                  {products.map((product) => ( <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem> ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="variantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Variant</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProductId || isLoadingDependencies || isEditMode}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a variant" /></SelectTrigger></FormControl>
                <SelectContent>
                  {availableVariants.map((variant) => ( <SelectItem key={variant.id} value={variant.id}>{variant.variantName || variant.sku}</SelectItem> ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="warehouseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warehouse</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingDependencies || isEditMode}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a warehouse" /></SelectTrigger></FormControl>
                <SelectContent>
                  {warehouses.map((warehouse) => ( <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem> ))}
                </SelectContent>
              </Select>
               <FormDescription>In edit mode, product and warehouse cannot be changed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Available Quantity</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="reservedQuantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Reserved Quantity</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || isLoadingDependencies}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Inventory'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
