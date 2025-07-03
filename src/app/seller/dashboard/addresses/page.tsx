
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MapPin, PlusCircle, Edit3, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AddressForm, type AddressFormValues } from '@/components/features/seller/address-form';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/lib/api';

export interface ApiAddress {
  id: string;
  addressType: 'BILLING' | 'SHIPPING' | 'WAREHOUSE';
  companyName: string | null;
  streetAddress1: string;
  streetAddress2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SellerAddressesPage() {
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAddressToEdit, setSelectedAddressToEdit] = useState<ApiAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<ApiAddress | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const { toast } = useToast();

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken || !currentUser?.id) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/addresses/user?userId=${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch addresses.');
      }

      setAddresses(responseData.data.content || []);
      if (!responseData.data || responseData.data.length === 0) {
        toast({ title: "No Addresses Found", description: "You haven't added any addresses yet." });
      }

    } catch (err: any) {
      setError(err.message);
      setAddresses([]);
      toast({ variant: "destructive", title: "Error Fetching Addresses", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, currentUser, toast]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAddSubmit = async (values: AddressFormValues) => {
    if (!accessToken || !currentUser) return;
    setIsMutating(true);
    try {
      const payload = { ...values, user: { id: currentUser.id } };
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to create address.");
      toast({ title: "Address Created!", description: responseData.message });
      setIsAddModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Creating Address", description: err.message });
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditSubmit = async (values: AddressFormValues) => {
    if (!accessToken || !currentUser || !selectedAddressToEdit) return;
    setIsMutating(true);
    try {
      const payload = { ...values, id: selectedAddressToEdit.id, user: { id: currentUser.id } };
      const response = await fetch(`${API_BASE_URL}/addresses/${selectedAddressToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to update address.");
      toast({ title: "Address Updated!", description: responseData.message });
      setIsEditModalOpen(false);
      setSelectedAddressToEdit(null);
      fetchAddresses();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Updating Address", description: err.message });
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDelete = async () => {
    if (!addressToDelete || !accessToken) return;
    setIsMutating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/addresses/${addressToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Failed to delete address.');
      toast({ title: "Address Deleted", description: responseData.message });
      setAddressToDelete(null);
      fetchAddresses();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Deleting Address", description: err.message });
    } finally {
      setIsMutating(false);
    }
  };

  const handleOpenEditModal = (address: ApiAddress) => {
    setSelectedAddressToEdit(address);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="font-headline text-2xl font-semibold">Manage Addresses</h1>
      </header>
      <main className="flex-1 p-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="font-headline">Your Address Book</CardTitle>
              <CardDescription>Manage addresses for shipping, billing, and warehouses.</CardDescription>
            </div>
            <div>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
              </Button>
              <Button onClick={fetchAddresses} className="bg-accent text-accent-foreground hover:bg-accent/90 ml-2">Refresh</Button>
            </div>

          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading addresses...</p>
              </div>
            ) : error ? (
              <p className="text-destructive text-center py-8">{error}</p>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground mb-2">No addresses found.</p>
                <Button variant="default" onClick={() => setIsAddModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">Add your first address</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City/State</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addresses.map((address) => (
                    <TableRow key={address.id}>
                      <TableCell><Badge variant="outline">{address.addressType}</Badge></TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={address.streetAddress1}>{address.streetAddress1}</TableCell>
                      <TableCell>{address.city}, {address.state}, {address.postalCode}</TableCell>
                      <TableCell>
                        {address.isDefault && <Badge>Yes</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(address)} disabled={isMutating}>
                          <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setAddressToDelete(address)} disabled={isMutating}>
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

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" />Add New Address</DialogTitle>
            <DialogDescription>Enter the details for the new address.</DialogDescription>
          </DialogHeader>
          <AddressForm
            isSubmitting={isMutating}
            onSubmit={handleAddSubmit}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" />Edit Address</DialogTitle>
            <DialogDescription>Update the details for this address.</DialogDescription>
          </DialogHeader>
          {selectedAddressToEdit && (
            <AddressForm
              isSubmitting={isMutating}
              initialData={selectedAddressToEdit}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {addressToDelete && (
        <AlertDialog open={!!addressToDelete} onOpenChange={() => setAddressToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This action will permanently delete the address: "{addressToDelete.streetAddress1}, {addressToDelete.city}". This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={isMutating}>
                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
