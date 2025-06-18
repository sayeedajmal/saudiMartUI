
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, Boxes, Edit, PlusCircle, Filter, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface InventoryItem {
  inventory_id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  reserved_quantity: number;
  reorder_level: number;
  last_updated: string;
}

const DUMMY_INVENTORY_ITEMS: InventoryItem[] = [
  { inventory_id: 'inv001', product_id: 'prod_123', product_name: 'Premium Steel Pipes', warehouse_id: 'wh_seller_1', warehouse_name: 'Riyadh Central Depot', quantity: 150, reserved_quantity: 10, reorder_level: 20, last_updated: '2024-07-28' },
  { inventory_id: 'inv002', product_id: 'prod_456', product_name: 'Organic Cotton Fabric', variant_id: 'var_cotton_blue', variant_name: 'Blue Color', warehouse_id: 'wh_seller_1', warehouse_name: 'Riyadh Central Depot', quantity: 500, reserved_quantity: 50, reorder_level: 100, last_updated: '2024-07-27' },
  { inventory_id: 'inv003', product_id: 'prod_123', product_name: 'Premium Steel Pipes', warehouse_id: 'wh_seller_2', warehouse_name: 'Jeddah Port Warehouse', quantity: 75, reserved_quantity: 5, reorder_level: 15, last_updated: '2024-07-28' },
  { inventory_id: 'inv004', product_id: 'prod_789', product_name: 'Gourmet Spice Mix', warehouse_id: 'wh_seller_1', warehouse_name: 'Riyadh Central Depot', quantity: 200, reserved_quantity: 0, reorder_level: 25, last_updated: '2024-07-26' },
];

const updateStockSchema = z.object({
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  reserved_quantity: z.coerce.number().min(0, "Reserved quantity cannot be negative."),
  reorder_level: z.coerce.number().min(0, "Reorder level cannot be negative."),
});
type UpdateStockFormValues = z.infer<typeof updateStockSchema>;


export default function SellerInventoryManagementPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [selectedItemToUpdate, setSelectedItemToUpdate] = useState<InventoryItem | null>(null);
  
  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const form = useForm<UpdateStockFormValues>({
    resolver: zodResolver(updateStockSchema),
    defaultValues: {
      quantity: 0,
      reserved_quantity: 0,
      reorder_level: 0,
    },
  });

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken) {
      setInventoryItems(DUMMY_INVENTORY_ITEMS); 
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      setInventoryItems(DUMMY_INVENTORY_ITEMS); 
      toast({
        title: "Inventory Loaded (Simulated)",
        description: "Displaying inventory (simulated fetch).",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setInventoryItems(DUMMY_INVENTORY_ITEMS); 
      toast({ variant: "destructive", title: "Error Fetching Inventory", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleOpenUpdateStockModal = (item: InventoryItem) => {
    setSelectedItemToUpdate(item);
    form.reset({
      quantity: item.quantity,
      reserved_quantity: item.reserved_quantity,
      reorder_level: item.reorder_level,
    });
    setIsUpdateStockModalOpen(true);
  };

  const handleUpdateStockSubmit = async (values: UpdateStockFormValues) => {
    if (!selectedItemToUpdate) return;
    setIsLoading(true); // You might want a separate loading state for the modal form

    console.log("Simulating update stock for:", selectedItemToUpdate.inventory_id, "with values:", values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));

    setInventoryItems(prevItems =>
      prevItems.map(item =>
        item.inventory_id === selectedItemToUpdate.inventory_id
          ? { ...item, ...values, last_updated: new Date().toISOString().split('T')[0] }
          : item
      )
    );
    toast({
      title: "Stock Updated (Simulated)",
      description: `Stock for ${selectedItemToUpdate.product_name} in ${selectedItemToUpdate.warehouse_name} has been updated.`,
    });
    setIsUpdateStockModalOpen(false);
    setSelectedItemToUpdate(null);
    setIsLoading(false);
  };


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="shadow-lg">
        <SidebarHeader className="p-4 justify-between items-center flex">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <h2 className="font-headline text-lg font-semibold text-sidebar-primary">SaudiMart</h2>
          </Link>
        </SidebarHeader>
        <ScrollArea className="flex-1">
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard" tooltip="Dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/product-manager" tooltip="Product Manager">
                <Package />
                <span>Product Manager</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/inventory" isActive tooltip="Inventory Management">
                <Boxes />
                <span>Inventory</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/orders" tooltip="Manage Orders">
                <ShoppingBag />
                <span>Manage Orders</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/enquiries" tooltip="Manage Enquiries">
                <MessageSquare />
                <span>Manage Enquiries</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/quotes" tooltip="Manage Quotes">
                <FileText />
                <span>Manage Quotes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/automated-enquiry-response" tooltip="AI Enquiry Response">
                <BotMessageSquare />
                <span>AI Enquiry Response</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/category-management" tooltip="Category Management">
                <Shapes />
                <span>Category Management</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/warehouses" tooltip="Manage Warehouses">
                <Warehouse />
                <span>Warehouses</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/shipping-settings" tooltip="Shipping Settings">
                <Truck />
                <span>Shipping Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/notifications" tooltip="Notifications">
                <Bell />
                <span>Notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Analytics">
                <BarChart3 />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        </ScrollArea>
      </Sidebar>
      <SidebarInset>
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
              <Button onClick={() => console.log("Add/Adjust stock batch (NI)")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Add/Adjust Stock (NI)
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading && inventoryItems.length === 0 && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading inventory...</p>
                </div>
              )}
              {!isLoading && error && (
                <p className="text-destructive text-center py-8">{error}</p>
              )}
              {!isLoading && !error && inventoryItems.length === 0 && (
                 <div className="text-center py-8">
                  <Boxes className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground mb-2">No inventory records found.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add products and warehouses, then manage their stock here.
                  </p>
                </div>
              )}
              {!isLoading && !error && inventoryItems.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Reserved</TableHead>
                      <TableHead className="text-right">Reorder Level</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item) => (
                      <TableRow key={item.inventory_id}>
                        <TableCell className="font-medium max-w-[200px] truncate" title={item.product_name}>{item.product_name}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={item.variant_name}>{item.variant_name || 'N/A'}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={item.warehouse_name}>{item.warehouse_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.reserved_quantity}</TableCell>
                        <TableCell className="text-right">{item.reorder_level}</TableCell>
                        <TableCell>{item.last_updated}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleOpenUpdateStockModal(item)}>
                            <Edit className="mr-1 h-3 w-3" /> Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <Dialog open={isUpdateStockModalOpen} onOpenChange={(isOpen) => {
        setIsUpdateStockModalOpen(isOpen);
        if (!isOpen) setSelectedItemToUpdate(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Update Stock</DialogTitle>
            {selectedItemToUpdate && (
              <DialogDescription>
                Product: {selectedItemToUpdate.product_name} {selectedItemToUpdate.variant_name ? `(${selectedItemToUpdate.variant_name})` : ''}
                <br />
                Warehouse: {selectedItemToUpdate.warehouse_name}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedItemToUpdate && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateStockSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reserved_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserved Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reorder_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsUpdateStockModalOpen(false)} disabled={form.formState.isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
