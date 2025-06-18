
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
import { BotMessageSquare, LayoutDashboard, ShoppingBag, BarChart3, Settings, MessageSquare, Package, Warehouse, Truck, Bell, Shapes, PlusCircle, Edit3, Trash2, Loader2, Boxes, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreateCategoryForm } from "@/components/features/seller/create-category-form";
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export interface SimpleCategory {
  id: string;
  name: string;
}
export interface SellerCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  parentCategory: SimpleCategory | null;
  childCategories: SimpleCategory[];
}

const DUMMY_CATEGORIES: SellerCategory[] = [
  { id: 'cat_seller_1', name: 'My Custom Electronics', description: 'All kinds of custom electronic components sold by me.', isActive: true, parentCategory: null, childCategories: [] },
  { id: 'cat_seller_2', name: 'Handmade Textiles', description: 'Unique handmade textile products.', isActive: true, parentCategory: null, childCategories: [] },
  { id: 'cat_seller_3', name: 'Locally Sourced Spices', description: 'Fresh and aromatic spices sourced locally.', isActive: false, parentCategory: null, childCategories: [] },
];

export default function SellerCategoryManagementPage() {
  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      setError("Authentication token not found. Please log in.");
      setIsLoading(false);
      // For demo purposes, still load dummy data if not logged in
      // In a real app, you might want to prevent this or show a login prompt
      setCategories(DUMMY_CATEGORIES);
      return;
    }

    try {
      // TODO: Replace with actual API call when endpoint is known
      // For now, simulate API call with dummy data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      // const response = await fetch('http://localhost:8080/categories/seller/me', {
      //   headers: {
      //     'Authorization': `Bearer ${accessToken}`,
      //   },
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to fetch categories');
      // }
      // const data: SellerCategory[] = await response.json();
      // setCategories(data);
      setCategories(DUMMY_CATEGORIES); // Using dummy data for now
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching categories.");
      setCategories(DUMMY_CATEGORIES); // Fallback to dummy data on error for UI demo
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
    // TODO: Implement Edit Category Form/Modal
    toast({ title: "Edit Clicked (Not Implemented)", description: `Editing: ${category.name}` });
  };

  const handleDelete = (category: SellerCategory) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    // TODO: Implement actual API call for delete
    // For now, simulate delete
    toast({ title: "Category Deleted (Simulated)", description: `${categoryToDelete.name} has been deleted.` });
    setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
    setCategoryToDelete(null);
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
                <CardTitle className="font-headline">Your Product Categories</CardTitle>
                <CardDescription>Manage all categories you have created for your products.</CardDescription>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading categories...</p>
                </div>
              )}
              {!isLoading && error && (
                <p className="text-destructive text-center py-8">{error}</p>
              )}
              {!isLoading && !error && categories.length === 0 && (
                <p className="text-muted-foreground text-center py-8">You haven't created any categories yet. Add one to get started!</p>
              )}
              {!isLoading && !error && categories.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{category.description}</TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                            <Edit3 className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(category)}>
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
              Add a new top-level product category for your store.
            </DialogDescription>
          </DialogHeader>
          <CreateCategoryForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              fetchSellerCategories(); // Refresh the list
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Placeholder for Edit Modal - To be implemented */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Category: {selectedCategoryToEdit?.name}</DialogTitle>
            <DialogDescription>
              Update the details for this category. (Edit form not yet implemented)
            </DialogDescription>
          </DialogHeader>
          {/* <EditCategoryForm category={selectedCategoryToEdit} onSuccess={() => { setIsEditModalOpen(false); fetchSellerCategories(); }} onCancel={() => setIsEditModalOpen(false)} /> */}
          <p className="py-4 text-center text-muted-foreground">(Edit form will go here)</p>
           <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" disabled>Save Changes (NI)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {categoryToDelete && (
        <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete &quot;{categoryToDelete.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category.
                Associated products might need to be re-categorized.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Delete Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </SidebarProvider>
  );
}
