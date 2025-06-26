
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Warehouse, PlusCircle, Edit3, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { WarehouseForm, type WarehouseFormValues } from '@/components/features/seller/warehouse-form';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/lib/api';

// This interface matches the nested structure from the API response
export interface ApiWarehouse {
  id: number;
  name: string;
  isActive: boolean;
  address: {
    id: number;
    companyName: string | null;
    streetAddress1: string;
    streetAddress2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  };
  seller: {
    id: string;
  };
}

// This interface is a flattened version, easier to work with in the frontend state and forms
export interface SellerWarehouse extends WarehouseFormValues {
  id: string; // Use string for potential UUIDs or DB IDs
}


export default function SellerWarehousesPage() {
  const [warehouses, setWarehouses] = useState<SellerWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWarehouseToEdit, setSelectedWarehouseToEdit] = useState<SellerWarehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<SellerWarehouse | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const { toast } = useToast();

  const fetchWarehouses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken || !currentUser?.id) {
      setWarehouses([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/seller?sellerId=${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch warehouses for this seller.');
      }
      
      const sellerApiWarehouses: ApiWarehouse[] = responseData.data || [];
      
      const flattenedWarehouses: SellerWarehouse[] = sellerApiWarehouses.map(w => ({
        id: String(w.id),
        name: w.name,
        company_name: w.address.companyName,
        street_address_1: w.address.streetAddress1,
        street_address_2: w.address.streetAddress2,
        city: w.address.city,
        state: w.address.state,
        postal_code: w.address.postalCode,
        country: w.address.country,
        is_active: w.isActive,
      }));

      setWarehouses(flattenedWarehouses);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching warehouses.");
      setWarehouses([]);
      toast({
        variant: "destructive",
        title: "Error Fetching Warehouses",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, currentUser, toast]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Simulation handlers for CUD operations
  const handleAddSuccess = async (newWarehouseData: WarehouseFormValues) => {
    // This would be a POST API call
    setIsAddModalOpen(false);
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    toast({ title: "Warehouse Added (Simulated)", description: "This is a simulated action. No data was sent to the server." });
    fetchWarehouses(); // Refetch the list to show the "updated" data from server
  };

  const handleEditSuccess = async (updatedWarehouseData: WarehouseFormValues) => {
    if (!selectedWarehouseToEdit) return;
    // This would be a PUT API call to /warehouses/{id}
    setIsEditModalOpen(false);
    setSelectedWarehouseToEdit(null);
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 500));
    toast({ title: "Warehouse Updated (Simulated)", description: "This is a simulated action. No data was sent to the server." });
    fetchWarehouses();
  };
  
  const confirmDeleteWarehouse = async () => {
    if (!warehouseToDelete) return;
    
    setIsDeleting(true);
    // This would be a DELETE API call to /warehouses/{id}
    await new Promise(res => setTimeout(res, 500));
    toast({ title: "Warehouse Deleted (Simulated)", description: `Simulated deletion of ${warehouseToDelete.name}.` });
    setWarehouseToDelete(null);
    setIsDeleting(false);
    fetchWarehouses();
  };

  // UI handlers
  const handleOpenEditModal = (warehouse: SellerWarehouse) => {
    setSelectedWarehouseToEdit(warehouse);
    setIsEditModalOpen(true);
  };

  const handleDeleteWarehouse = (warehouse: SellerWarehouse) => {
    setWarehouseToDelete(warehouse);
  };

  return (
    <>
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
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(warehouse)} disabled={isDeleting}>
                          <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteWarehouse(warehouse)} disabled={isDeleting}>
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl">
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
              <AlertDialogCancel onClick={() => setWarehouseToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteWarehouse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                 {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Delete Warehouse
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
