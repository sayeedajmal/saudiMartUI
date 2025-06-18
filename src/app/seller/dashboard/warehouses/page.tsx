
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
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, PlusCircle, Edit3, Trash2, Loader2, Boxes, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { WarehouseForm, type WarehouseFormValues } from '@/components/features/seller/warehouse-form';
import { Badge } from '@/components/ui/badge';

export interface SellerWarehouse extends WarehouseFormValues {
  id: string;
}

const DUMMY_WAREHOUSES: SellerWarehouse[] = [
  { id: "wh_seller_1", name: "Riyadh Central Depot", street_address_1: "123 Industrial Main St", street_address_2: "Unit 5", city: "Riyadh", state: "Riyadh Province", postal_code: "11564", country: "Saudi Arabia", company_name: "My Logistics Co", is_active: true },
  { id: "wh_seller_2", name: "Jeddah Port Warehouse", street_address_1: "456 Portside Ave", street_address_2: "", city: "Jeddah", state: "Makkah Province", postal_code: "21432", country: "Saudi Arabia", company_name: "", is_active: true },
  { id: "wh_seller_3", name: "Dammam Storage Unit (Old)", street_address_1: "789 Storage Rd", street_address_2: "Bay 10", city: "Dammam", state: "Eastern Province", postal_code: "31433", country: "Saudi Arabia", company_name: "Storage Solutions Ltd", is_active: false },
];

export default function SellerWarehousesPage() {
  const [warehouses, setWarehouses] = useState<SellerWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWarehouseToEdit, setSelectedWarehouseToEdit] = useState<SellerWarehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<SellerWarehouse | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchWarehouses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken) {
      // setError("Authentication token not found. Please log in.");
      // setIsLoading(false);
      toast({ title: "Demo Mode", description: "Displaying sample warehouses. Login to see your actual warehouses." });
      setWarehouses(DUMMY_WAREHOUSES);
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call: GET /warehouses/seller/me (or similar)
      console.log("Simulating fetch for seller warehouses with token:", accessToken);
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      // const response = await fetch('http://localhost:8080/api/seller/warehouses', {
      //   headers: { 'Authorization': `Bearer ${accessToken}` },
      // });
      // if (!response.ok) throw new Error('Failed to fetch warehouses');
      // const data = await response.json();
      // setWarehouses(data);
      setWarehouses(DUMMY_WAREHOUSES); // Using dummy data
      toast({
        title: "Warehouses Loaded (Simulated)",
        description: "Displaying warehouses for the logged-in seller (simulated fetch).",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setWarehouses(DUMMY_WAREHOUSES); // Fallback for UI demo
      toast({ variant: "destructive", title: "Error Fetching Warehouses", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleAddSuccess = (newWarehouseData: WarehouseFormValues) => {
    // Simulate API call and then update local state
    console.log("Simulating Add Warehouse API call with data:", newWarehouseData);
    const newWarehouse: SellerWarehouse = { 
      id: `wh_new_${Date.now()}`, // Temporary ID
      ...newWarehouseData 
    };
    setWarehouses(prev => [newWarehouse, ...prev]);
    setIsAddModalOpen(false);
    toast({ title: "Warehouse Added (Simulated)", description: `${newWarehouse.name} has been successfully added.` });
  };

  const handleEditSuccess = (updatedWarehouseData: WarehouseFormValues) => {
    if (!selectedWarehouseToEdit) return;
    // Simulate API call and then update local state
    console.log("Simulating Edit Warehouse API call for ID:", selectedWarehouseToEdit.id, "with data:", updatedWarehouseData);
    setWarehouses(prev => prev.map(wh => wh.id === selectedWarehouseToEdit.id ? { ...wh, ...updatedWarehouseData } : wh));
    setIsEditModalOpen(false);
    setSelectedWarehouseToEdit(null);
    toast({ title: "Warehouse Updated (Simulated)", description: `${updatedWarehouseData.name} has been successfully updated.` });
  };
  
  const handleOpenEditModal = (warehouse: SellerWarehouse) => {
    setSelectedWarehouseToEdit(warehouse);
    setIsEditModalOpen(true);
  };

  const handleDeleteWarehouse = (warehouse: SellerWarehouse) => {
    setWarehouseToDelete(warehouse);
  };

  const confirmDeleteWarehouse = async () => {
    if (!warehouseToDelete) return;
    
    if(!accessToken) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please login to delete warehouses." });
      setWarehouseToDelete(null);
      return;
    }
    // TODO: Implement actual API call: DELETE /warehouses/{warehouseToDelete.id}
    console.log(`Simulating delete for warehouse ID: ${warehouseToDelete.id} with token: ${accessToken}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({ title: "Warehouse Deleted (Simulated)", description: `${warehouseToDelete.name} has been deleted.` });
    setWarehouses(prev => prev.filter(wh => wh.id !== warehouseToDelete.id));
    setWarehouseToDelete(null);
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
              <SidebarMenuButton href="/seller/dashboard/inventory" tooltip="Inventory Management">
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
              <SidebarMenuButton href="/seller/dashboard/warehouses" isActive tooltip="Manage Warehouses">
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
            <h1 className="font-headline text-2xl font-semibold">Manage Warehouses</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Your Warehouse Locations</CardTitle>
                <CardDescription>Add, edit, or remove your warehouse locations for inventory and shipping.</CardDescription>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Warehouse
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading warehouses...</p>
                </div>
              )}
              {!isLoading && error && (
                <p className="text-destructive text-center py-8">{error}</p>
              )}
              {!isLoading && !error && warehouses.length === 0 && (
                 <div className="text-center py-8">
                  <Warehouse className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground mb-2">No warehouses found.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't added any warehouses yet.
                  </p>
                  <Button variant="default" onClick={() => setIsAddModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">Add your first warehouse!</Button>
                </div>
              )}
              {!isLoading && !error && warehouses.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.name}</TableCell>
                        <TableCell>{warehouse.city}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={`${warehouse.street_address_1}, ${warehouse.postal_code}`}>{warehouse.street_address_1}, {warehouse.postal_code}</TableCell>
                        <TableCell>
                          <Badge variant={warehouse.is_active ? "default" : "secondary"} className={warehouse.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                            {warehouse.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(warehouse)}>
                            <Edit3 className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteWarehouse(warehouse)}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
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

      {/* Add Warehouse Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl"> {/* Wider dialog for address fields */}
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><Warehouse className="mr-2 h-5 w-5 text-primary" />Add New Warehouse</DialogTitle>
            <DialogDescription>
              Enter the details for your new warehouse location.
            </DialogDescription>
          </DialogHeader>
          <WarehouseForm 
            onSubmit={handleAddSuccess} 
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Warehouse Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
          setIsEditModalOpen(isOpen);
          if (!isOpen) setSelectedWarehouseToEdit(null);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><Warehouse className="mr-2 h-5 w-5 text-primary" />Edit Warehouse: {selectedWarehouseToEdit?.name}</DialogTitle>
            <DialogDescription>
              Update the details for this warehouse location.
            </DialogDescription>
          </DialogHeader>
          {selectedWarehouseToEdit && (
            <WarehouseForm 
              initialData={selectedWarehouseToEdit} 
              onSubmit={handleEditSuccess}
              onCancel={() => {
                  setIsEditModalOpen(false);
                  setSelectedWarehouseToEdit(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {warehouseToDelete && (
        <AlertDialog open={!!warehouseToDelete} onOpenChange={() => setWarehouseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete &quot;{warehouseToDelete.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the warehouse.
                This might affect products linked to this warehouse if inventory is managed here.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWarehouseToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteWarehouse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Delete Warehouse
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SidebarProvider>
  );
}
