
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
import type { ApiAddress } from '@/app/seller/dashboard/addresses/page';


export interface ApiWarehouse {
  id: string;
  name: string;
  isActive: boolean;
  address: {
    id: string;
    companyName: string | null;
    streetAddress1: string;
    streetAddress2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  };
  seller?: {
    id: string;
  };
}

export default function SellerWarehousesPage() {
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([]);
  const [sellerAddresses, setSellerAddresses] = useState<ApiAddress[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedWarehouseToEdit, setSelectedWarehouseToEdit] = useState<ApiWarehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<ApiWarehouse | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const { toast } = useToast();

  const fetchWarehouses = useCallback(async () => {
    setIsLoadingWarehouses(true);
    setError(null);
    if (!accessToken || !currentUser?.id) {
      setWarehouses([]);
      setIsLoadingWarehouses(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/seller?sellerId=${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Failed to fetch warehouses.');
      
      setWarehouses(responseData.data || []);
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Error Fetching Warehouses", description: err.message });
    } finally {
      setIsLoadingWarehouses(false);
    }
  }, [accessToken, currentUser, toast]);

  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    if (!accessToken || !currentUser?.id) {
        setSellerAddresses([]);
        setIsLoadingAddresses(false);
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/addresses/user?userId=${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.message || "Failed to fetch addresses.");
        setSellerAddresses(responseData.data || []);
    } catch (err: any) {
        toast({ variant: "destructive", title: "Could not load addresses", description: "Warehouses cannot be created or edited without addresses." });
        setSellerAddresses([]);
    } finally {
        setIsLoadingAddresses(false);
    }
  }, [accessToken, currentUser, toast]);

  useEffect(() => {
    fetchWarehouses();
    fetchAddresses();
  }, [fetchWarehouses, fetchAddresses]);

  const handleFormSubmit = async (values: WarehouseFormValues) => {
    if (!accessToken || !currentUser) return;
    setIsMutating(true);
    
    const isEdit = modalMode === 'edit' && selectedWarehouseToEdit;
    const url = isEdit ? `${API_BASE_URL}/warehouses/${selectedWarehouseToEdit.id}` : `${API_BASE_URL}/warehouses`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      id: isEdit ? selectedWarehouseToEdit.id : undefined,
      name: values.name,
      isActive: values.is_active,
      seller: { id: currentUser.id },
      address: { 
        id: values.addressId,
        user: { id: currentUser.id }
      }
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || `Failed to ${isEdit ? 'update' : 'create'} warehouse.`);

      toast({ title: `Warehouse ${isEdit ? 'Updated' : 'Created'}!`, description: responseData.message });
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err: any) {
      toast({ variant: "destructive", title: `Error ${isEdit ? 'Updating' : 'Creating'} Warehouse`, description: err.message });
    } finally {
      setIsMutating(false);
    }
  };
  
  const confirmDeleteWarehouse = async () => {
    if (!warehouseToDelete || !accessToken) return;
    
    setIsMutating(true);
    try {
        const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseToDelete.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({message: "Failed to delete warehouse."}));
            throw new Error(errorData.message);
        }
        toast({ title: "Warehouse Deleted", description: `${warehouseToDelete.name} was successfully deleted.` });
        fetchWarehouses();
    } catch (err: any) {
        toast({ variant: "destructive", title: "Error Deleting Warehouse", description: err.message });
    } finally {
        setWarehouseToDelete(null);
        setIsMutating(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedWarehouseToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (warehouse: ApiWarehouse) => {
    setModalMode('edit');
    setSelectedWarehouseToEdit(warehouse);
    setIsModalOpen(true);
  };

  const initialFormValues = modalMode === 'edit' && selectedWarehouseToEdit ? {
    name: selectedWarehouseToEdit.name,
    addressId: selectedWarehouseToEdit.address.id,
    is_active: selectedWarehouseToEdit.isActive
  } : undefined;

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
            <Button onClick={handleOpenAddModal} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoadingAddresses}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Warehouse
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingWarehouses ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading warehouses...</p>
              </div>
            ) : error ? (
              <p className="text-destructive text-center py-8">{error}</p>
            ) : warehouses.length === 0 ? (
               <div className="text-center py-8">
                <Warehouse className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground mb-2">No warehouses found.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't added any warehouses yet.
                </p>
                <Button variant="default" onClick={handleOpenAddModal} className="bg-accent text-accent-foreground hover:bg-accent/90">Add your first warehouse!</Button>
              </div>
            ) : (
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
                      <TableCell>{warehouse.address.city}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={`${warehouse.address.streetAddress1}, ${warehouse.address.postalCode}`}>{warehouse.address.streetAddress1}, {warehouse.address.postalCode}</TableCell>
                      <TableCell>
                        <Badge variant={warehouse.isActive ? "default" : "secondary"} className={warehouse.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {warehouse.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(warehouse)} disabled={isMutating}>
                          <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setWarehouseToDelete(warehouse)} disabled={isMutating}>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><Warehouse className="mr-2 h-5 w-5 text-primary" />{modalMode === 'add' ? 'Add New Warehouse' : `Edit Warehouse: ${selectedWarehouseToEdit?.name}`}</DialogTitle>
            <DialogDescription>
              {modalMode === 'add' ? 'Enter the details for your new warehouse location.' : 'Update the details for this warehouse location.'}
            </DialogDescription>
          </DialogHeader>
          <WarehouseForm 
            initialData={initialFormValues}
            addresses={sellerAddresses}
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={isMutating}
            isLoadingAddresses={isLoadingAddresses}
          />
        </DialogContent>
      </Dialog>
      
      {warehouseToDelete && (
        <AlertDialog open={!!warehouseToDelete} onOpenChange={() => setWarehouseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete &quot;{warehouseToDelete.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the warehouse.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWarehouseToDelete(null)} disabled={isMutating}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteWarehouse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isMutating}>
                 {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Delete Warehouse
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
