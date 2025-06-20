
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
import { BotMessageSquare, LayoutDashboard, ShoppingBag, BarChart3, Settings, MessageSquare, Package, Warehouse, Truck, Bell, Shapes, PlusCircle, Edit3, Trash2, Loader2, Boxes, FileText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreateCategoryForm } from "@/components/features/seller/create-category-form";
import { EditCategoryForm } from "@/components/features/seller/edit-category-form"; // Import new form
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Aligned with backend Category.java
export interface SellerCategory {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  parentCategory: { id: number; name: string; } | null; // Simplified for display
  childCategories: { id: number; name: string; }[]; // Simplified for display
  createdAt?: string; // Assuming createdAt is a string like "2024-07-29T10:00:00.000+00:00"
}


export default function SellerCategoryManagementPage() {
  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<SellerCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<SellerCategory | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchSellerCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Please log in to view categories."});
      setIsLoading(false);
      setCategories([]); // Clear categories if not authenticated
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/categories', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch categories');
      }
      
      const fetchedCategories: SellerCategory[] = responseData.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        isActive: cat.isActive,
        createdAt: cat.createdAt,
        parentCategory: cat.parentCategory ? { id: cat.parentCategory.id, name: cat.parentCategory.name } : null,
        childCategories: cat.childCategories ? cat.childCategories.map((child: any) => ({ id: child.id, name: child.name })) : [],
      }));
      setCategories(fetchedCategories);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching categories.");
      setCategories([]); // Clear categories on error
      toast({
        variant: "destructive",
        title: "Error fetching categories",
        description: err.message || "Could not load your categories.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    fetchSellerCategories();
  }, [fetchSellerCategories]);

  const handleEdit = (category: SellerCategory) => {
    setSelectedCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: SellerCategory) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete || !accessToken) {
      toast({ variant: "destructive", title: "Error", description: "Cannot delete category. Missing data or auth token."});
      setCategoryToDelete(null);
      return;
    }
    setIsDeleting(true); 
    try {
      const response = await fetch(`http://localhost:8080/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to delete category. Status: ${response.status}`);
      }

      toast({ title: "Category Deleted", description: responseData.message || `${categoryToDelete.name} has been deleted.` });
      fetchSellerCategories(); // Refresh list after delete
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error Deleting Category",
        description: err.message || "Could not delete the category.",
      });
    } finally {
      setCategoryToDelete(null);
      setIsDeleting(false);
    }
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
              <SidebarMenuButton href="/seller/dashboard/category-management" isActive tooltip="Category Management">
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
            <h1 className="font-headline text-2xl font-semibold">Category Management</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Product Categories</CardTitle>
                <CardDescription>Manage categories for your products. (Note: Currently displays all system categories)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchSellerCategories} variant="outline" disabled={isLoading || isDeleting}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading && !isDeleting ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading || isDeleting}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && categories.length === 0 && ( 
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading categories...</p>
                </div>
              )}
              {!isLoading && error && (
                <p className="text-destructive text-center py-8">{error}</p>
              )}
              {!isLoading && !error && categories.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No categories found. Add one to get started!</p>
              )}
              {!isLoading && !error && categories.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={category.description || ''}>{category.description || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {category.parentCategory ? category.parentCategory.name : 'N/A (Top-level)'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(category)} disabled={isDeleting}>
                            <Edit3 className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(category)} disabled={isDeleting}>
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

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><Shapes className="mr-2 h-5 w-5 text-primary" />Create New Category</DialogTitle>
            <DialogDescription>
              Add a new top-level product category.
            </DialogDescription>
          </DialogHeader>
          <CreateCategoryForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              fetchSellerCategories(); 
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
        setIsEditModalOpen(isOpen);
        if (!isOpen) setSelectedCategoryToEdit(null); // Clear selected on close
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary"/>Edit Category: {selectedCategoryToEdit?.name}</DialogTitle>
            <DialogDescription>
              Update the details for this category.
            </DialogDescription>
          </DialogHeader>
          {selectedCategoryToEdit && (
            <EditCategoryForm
              initialData={selectedCategoryToEdit}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setSelectedCategoryToEdit(null);
                fetchSellerCategories();
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedCategoryToEdit(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {categoryToDelete && (
        <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete &quot;{categoryToDelete.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCategoryToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                 {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Delete Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </SidebarProvider>
  );
}
    
