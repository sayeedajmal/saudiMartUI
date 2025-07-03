'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Edit, PlusCircle, Loader2, Boxes, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { API_BASE_URL } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SellerProduct } from '@/app/seller/dashboard/product-manager/page';
import { ApiWarehouse } from '@/app/seller/dashboard/warehouses/page';
import { InventoryForm, InventoryFormValues } from '@/components/features/seller/inventory-form';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


interface ApiInventoryItem {
  id: string;
  product: {
    id: string;
    name: string;
    variants: {
      id: string;
      images: { imageUrl: string; isPrimary: boolean; }[];
    }[]
  };
  variant: {
    id: string;
    variantName: string;
    images: { imageUrl: string; isPrimary: boolean; }[];
  };
  warehouse: {
    id: string;
    name: string;
  };
  quantity: number;
  reservedQuantity: number;
  createdAt: string;
  updatedAt: string | null;
}

interface InventoryItem {
  inventory_id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  variant_id?: string;
  variant_name?: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  reserved_quantity: number;
  last_updated: string;
}

const updateQuantitiesSchema = z.object({
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  reservedQuantity: z.coerce.number().min(0, "Reserved quantity cannot be negative."),
});
type UpdateQuantitiesFormValues = z.infer<typeof updateQuantitiesSchema>;

export default function SellerInventoryManagementPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItemToUpdate, setSelectedItemToUpdate] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const { toast } = useToast();

  const form = useForm<UpdateQuantitiesFormValues>({
    resolver: zodResolver(updateQuantitiesSchema),
    defaultValues: { quantity: 0, reservedQuantity: 0 },
  });

  const fetchDependencies = useCallback(async () => {
    if (!currentUser?.id || !accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const inventoryRes = await fetch(`${API_BASE_URL}/inventory/sellerinventory/${currentUser.id}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
      const inventoryData = await inventoryRes.json();
      if (!inventoryRes.ok) {
        let errorMsg = inventoryData.message || 'Failed to fetch inventory';
        if (typeof inventoryData === 'string') {
          errorMsg = `Server returned an error: ${inventoryData.substring(0, 100)}...`;
        }
        throw new Error(errorMsg);
      }

      const apiInventory: ApiInventoryItem[] = inventoryData.data || [];
      const flattenedInventory: InventoryItem[] = apiInventory.map(item => {
        const primaryImage = item.variant?.images?.find(img => img.isPrimary) || item.variant?.images?.[0];
        return {
          inventory_id: String(item.id),
          product_id: String(item.product.id),
          product_name: item.product.name,
          product_image_url: primaryImage?.imageUrl,
          variant_id: item.variant ? String(item.variant.id) : undefined,
          variant_name: item.variant ? item.variant.variantName : undefined,
          warehouse_id: String(item.warehouse.id),
          warehouse_name: item.warehouse.name,
          quantity: item.quantity,
          reserved_quantity: item.reservedQuantity,
          last_updated: new Date(item.updatedAt || item.createdAt).toLocaleDateString(),
        }
      });
      setInventoryItems(flattenedInventory);

      // For the "Add Inventory" form, we still need the full lists of products and warehouses.
      const [productsRes, warehousesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products/seller/${currentUser.id}`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(`${API_BASE_URL}/warehouses/seller?sellerId=${currentUser.id}`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
      ]);
      
      const productsData = await productsRes.json();
      if (!productsRes.ok) throw new Error(productsData.message || 'Failed to fetch products for form');
      setProducts(productsData.data.content || []);

      const warehousesData = await warehousesRes.json();
      if (!warehousesRes.ok) throw new Error(warehousesData.message || 'Failed to fetch warehouses for form');
      setWarehouses(warehousesData.data.content || []);

    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Error Fetching Data", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, currentUser, toast]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const handleOpenUpdateModal = (item: InventoryItem) => {
    setSelectedItemToUpdate(item);
    form.reset({
      quantity: item.quantity,
      reservedQuantity: item.reserved_quantity,
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateQuantitiesSubmit = async (values: UpdateQuantitiesFormValues) => {
    if (!selectedItemToUpdate || !accessToken) return;
    setIsMutating(true);
    try {
      const payload = { ...values, id: selectedItemToUpdate.inventory_id };
      const response = await fetch(`${API_BASE_URL}/inventory/${selectedItemToUpdate.inventory_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to update inventory.");

      toast({ title: "Stock Updated!", description: `Stock for ${selectedItemToUpdate.product_name} has been updated.` });
      setIsUpdateModalOpen(false);
      fetchDependencies();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    } finally {
      setIsMutating(false);
    }
  };

  const handleAddInventorySubmit = async (values: InventoryFormValues) => {
    if (!accessToken) return;
    setIsMutating(true);
    try {
      const payload = {
        product: { id: values.productId },
        variant: { id: values.variantId },
        warehouse: { id: values.warehouseId },
        quantity: values.quantity,
        reservedQuantity: values.reservedQuantity
      };

      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to create inventory entry.");
      toast({ title: "Inventory Created!", description: "New stock record has been added." });
      setIsAddModalOpen(false);
      fetchDependencies();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Creation Failed", description: err.message });
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !accessToken) return;
    setIsMutating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${itemToDelete.inventory_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete item." }));
        throw new Error(errorData.message);
      }
      toast({ title: "Inventory Deleted", description: "The stock record was successfully deleted." });
      fetchDependencies();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Deleting Item", description: err.message });
    } finally {
      setItemToDelete(null);
      setIsMutating(false);
    }
  };

  const isLoadingDependencies = !products.length || !warehouses.length;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="font-headline text-2xl font-semibold">Inventory Management</h1>
      </header>
      <main className="flex-1 p-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="font-headline">Product Stock Levels</CardTitle>
              <CardDescription>View and manage stock quantities for your products across warehouses.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchDependencies} disabled={isLoading} className='bg-accent text-accent-foreground hover:bg-accent/90'>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || isLoadingDependencies}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Inventory
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && inventoryItems.length === 0 ? (
              <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Loading inventory...</p></div>
            ) : error ? (
              <p className="text-destructive text-center py-8">{error}</p>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-8"><Boxes className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p className="text-xl font-semibold text-muted-foreground mb-2">No inventory records found.</p><p className="text-sm text-muted-foreground mb-4">Add products and warehouses, then manage their stock here.</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product</TableHead><TableHead>Variant</TableHead><TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Quantity</TableHead><TableHead className="text-right">Reserved</TableHead>
                    <TableHead>Last Updated</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.inventory_id}>
                      <TableCell>
                        <a href={item.product_image_url || '#'} target="_blank" rel="noopener noreferrer" onClick={(e) => !item.product_image_url && e.preventDefault()}>
                          <Avatar className="h-12 w-12 rounded-md">
                            <AvatarImage src={item.product_image_url} alt={item.product_name} className="object-cover" />
                            <AvatarFallback className="rounded-md bg-muted">
                              <Boxes className="h-6 w-6 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                        </a>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate" title={item.product_name}>{item.product_name}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={item.variant_name}>{item.variant_name || 'N/A'}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={item.warehouse_name}>{item.warehouse_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{item.reserved_quantity}</TableCell>
                      <TableCell>{item.last_updated}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenUpdateModal(item)} disabled={isMutating}><Edit className="mr-1 h-3 w-3" /> Update</Button>
                        <Button variant="destructive" size="sm" onClick={() => setItemToDelete(item)} disabled={isMutating}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Update Stock Quantities</DialogTitle>
            {selectedItemToUpdate && (<DialogDescription>Product: {selectedItemToUpdate.product_name} {selectedItemToUpdate.variant_name ? `(${selectedItemToUpdate.variant_name})` : ''}<br />Warehouse: {selectedItemToUpdate.warehouse_name}</DialogDescription>)}
          </DialogHeader>
          {selectedItemToUpdate && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateQuantitiesSubmit)} className="space-y-4 py-2">
                <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Available Quantity</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="reservedQuantity" render={({ field }) => (<FormItem><FormLabel>Reserved Quantity</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)} disabled={isMutating}>Cancel</Button>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isMutating}>{isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle className="font-headline flex items-center"><Boxes className="mr-2 h-5 w-5 text-primary" />Add New Inventory Record</DialogTitle><DialogDescription>Select a product, variant, and warehouse to add a new stock record.</DialogDescription></DialogHeader>
          <InventoryForm onSubmit={handleAddInventorySubmit} onCancel={() => setIsAddModalOpen(false)} isSubmitting={isMutating} products={products} warehouses={warehouses} isLoadingDependencies={isLoading} />
        </DialogContent>
      </Dialog>

      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the inventory record for "{itemToDelete.product_name}" in warehouse "{itemToDelete.warehouse_name}". This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={isMutating}>{isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Yes, Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
