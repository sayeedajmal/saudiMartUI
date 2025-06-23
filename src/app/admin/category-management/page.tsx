
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
import { LayoutDashboard, Users, Shapes, PackageCheck, ClipboardList, BarChart3, Settings, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CreateCategoryForm } from '@/components/features/seller/create-category-form';
import { EditCategoryForm } from '@/components/features/seller/edit-category-form';

export interface AdminCategory {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt?: string;
  // These might not be available directly from API, so they are optional
  parentCategory?: { id: number; name: string } | null;
  childCategories?: any[];
}

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<AdminCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Please log in."});
      setIsLoading(false);
      setCategories([]);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/categories', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to fetch categories.");
      }
      setCategories(responseData.data || []);
    } catch (err: any) {
      setError(err.message);
      setCategories([]);
      toast({ variant: "destructive", title: "Error fetching categories", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category: AdminCategory) => {
    setSelectedCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: AdminCategory) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8080/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to delete category.");
      toast({ title: "Category Deleted", description: responseData.message });
      fetchCategories();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Deleting Category", description: err.message });
    } finally {
      setCategoryToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <RoleProtectedRoute expectedRole="ADMIN">
      <SidebarProvider>
        <Sidebar collapsible="icon" className="shadow-lg">
          <SidebarHeader className="p-4 justify-between items-center flex">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <h2 className="font-headline text-lg font-semibold text-sidebar-primary">SaudiMart Admin</h2>
            </Link>
          </SidebarHeader>
          <ScrollArea className="flex-1">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/dashboard" tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/user-management" tooltip="User Management">
                  <Users />
                  <span>User Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/category-management" isActive tooltip="Category Management">
                  <Shapes />
                  <span>Category Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/product-moderation" tooltip="Product Moderation">
                  <PackageCheck />
                  <span>Product Moderation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/enquiry-monitoring" tooltip="Enquiry Monitoring">
                  <ClipboardList />
                  <span>Enquiry Monitoring</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/reports" tooltip="Reports">
                  <BarChart3 />
                  <span>Reports</span>
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
                  <CardTitle className="font-headline">Manage Categories</CardTitle>
                  <CardDescription>Add, edit, or delete product categories and sub-categories.</CardDescription>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading categories...</p>
                  </div>
                ) : error ? (
                  <p className="text-destructive text-center py-8">{error}</p>
                ) : categories.length > 0 ? (
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="shadow-sm">
                        <CardHeader className="flex flex-row justify-between items-start">
                           <div>
                             <CardTitle className="font-headline text-lg">{category.name}</CardTitle>
                             <CardDescription className="max-w-prose">{category.description || 'No description'}</CardDescription>
                           </div>
                           <Badge variant={category.isActive ? "default" : "secondary"} className={category.isActive ? 'bg-green-500' : ''}>
                             {category.isActive ? "Active" : "Inactive"}
                           </Badge>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(category)}><Edit className="mr-2 h-3 w-3" />Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(category)}><Trash2 className="mr-2 h-3 w-3" />Delete</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No categories found. Add one to get started.</p>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* Modals and Dialogs */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><Shapes className="mr-2 h-5 w-5 text-primary" />Create New Category</DialogTitle>
            <DialogDescription>Add a new top-level product category.</DialogDescription>
          </DialogHeader>
          <CreateCategoryForm
            onSuccess={() => { setIsCreateModalOpen(false); fetchCategories(); }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => { setIsEditModalOpen(isOpen); if (!isOpen) setSelectedCategoryToEdit(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center"><Edit className="mr-2 h-5 w-5 text-primary"/>Edit Category: {selectedCategoryToEdit?.name}</DialogTitle>
            <DialogDescription>Update the details for this category.</DialogDescription>
          </DialogHeader>
          {selectedCategoryToEdit && (
            <EditCategoryForm
              initialData={selectedCategoryToEdit}
              onSuccess={() => { setIsEditModalOpen(false); setSelectedCategoryToEdit(null); fetchCategories(); }}
              onCancel={() => { setIsEditModalOpen(false); setSelectedCategoryToEdit(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {categoryToDelete && (
        <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete &quot;{categoryToDelete.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the category.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCategoryToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </RoleProtectedRoute>
  );
}
