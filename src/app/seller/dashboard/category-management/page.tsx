
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RefreshCw, Search, FilterIcon, XCircle, Shapes, PlusCircle, Edit3, Trash2, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateCategoryForm } from "@/components/features/seller/create-category-form";
import { EditCategoryForm } from "@/components/features/seller/edit-category-form";
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { API_BASE_URL } from '@/lib/api';

export interface SellerCategory {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt?: string;
}

interface PaginationInfo {
    totalPages: number;
    totalElements: number;
    isFirst: boolean;
    isLast: boolean;
    pageNumber: number;
    pageSize: number;
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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [currentPage, setCurrentPage] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    totalPages: 1,
    totalElements: 0,
    isFirst: true,
    isLast: true,
    pageNumber: 0,
    pageSize: 10,
  });


  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchSellerCategories = useCallback(async (page = 0, currentSearchTerm = searchTerm, currentStatusFilter = statusFilter) => {
    setIsLoading(true);
    setError(null);
    if (!accessToken) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Please log in to view categories."});
      setIsLoading(false);
      setCategories([]);
      return;
    }

    let url = `${API_BASE_URL}/categories`;
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', '10');

    if (currentSearchTerm.trim() !== '') {
      params.append('name', currentSearchTerm.trim());
    }
    if (currentStatusFilter !== 'all') {
      params.append('isActive', currentStatusFilter === 'active' ? 'true' : 'false');
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to fetch categories. Status: ${response.status}`);
      }
      
      const categoryData = responseData.data;
      const fetchedCategories: SellerCategory[] = categoryData?.content || [];
      setCategories(fetchedCategories);
      
      setPaginationInfo({
        totalPages: categoryData?.totalPages || 1,
        totalElements: categoryData?.totalElements || 0,
        isFirst: categoryData?.first || true,
        isLast: categoryData?.last || true,
        pageNumber: categoryData?.number || 0,
        pageSize: categoryData?.size || 10,
      });
      setCurrentPage(categoryData?.number || 0);

      if (fetchedCategories.length === 0 && (currentSearchTerm || currentStatusFilter !== 'all')) {
        toast({ title: "No Results", description: "No categories match your current filters." });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching categories.");
      setCategories([]);
      toast({
        variant: "destructive",
        title: "Error fetching categories",
        description: err.message || "Could not load your categories.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast, searchTerm, statusFilter]);

  useEffect(() => {
    fetchSellerCategories(currentPage);
  }, [accessToken]); 

  const handleFilterApply = () => {
    setCurrentPage(0);
    fetchSellerCategories(0, searchTerm, statusFilter);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(0);
    fetchSellerCategories(0, '', 'all'); 
  };
  
  const handleRefresh = () => {
      fetchSellerCategories(currentPage, searchTerm, statusFilter);
  };

  const handleNextPage = () => {
    if (!paginationInfo.isLast) {
      fetchSellerCategories(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (!paginationInfo.isFirst) {
      fetchSellerCategories(currentPage - 1);
    }
  };

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
      const response = await fetch(`${API_BASE_URL}/categories/${categoryToDelete.id}`, {
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
      fetchSellerCategories(currentPage);
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
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="font-headline text-2xl font-semibold">Category Management</h1>
      </header>
      <main className="flex-1 p-6">
        <Card className="shadow-md">
          <CardHeader className="block md:flex md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <CardTitle className="font-headline">Product Categories</CardTitle>
              <CardDescription>Manage categories for your products. (Note: Currently displays all system categories)</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <Button onClick={handleRefresh} variant="outline" disabled={isLoading || isDeleting} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading && !isDeleting && !categoryToDelete ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto" disabled={isLoading || isDeleting}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-2 md:col-span-6">
                  <label htmlFor="search-category" className="block text-sm font-medium text-foreground mb-1">Search by Name</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-category"
                      type="search"
                      placeholder="Search category name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label htmlFor="status-filter" className="block text-sm font-medium text-foreground mb-1">Filter by Status</label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
                    <SelectTrigger id="status-filter" className='w-full'>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <Button onClick={handleFilterApply} disabled={isLoading} className="flex-1">
                    <FilterIcon className="mr-2 h-4 w-2" /> Apply
                  </Button>
                  <Button onClick={handleClearFilters} variant="outline" disabled={isLoading} className='flex-1'>
                    <XCircle className="mr-2 h-4 w-2" /> Clear
                  </Button>
                </div>
              </div>
            </div>

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
              <p className="text-muted-foreground text-center py-8">No categories found. Add one to get started or adjust your filters!</p>
            )}
            {!isLoading && !error && categories.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Avatar className="h-12 w-12 rounded-md">
                          <AvatarImage src={category.imageUrl || undefined} alt={category.name} className="object-cover" />
                          <AvatarFallback className="rounded-md"><ImageIcon className="h-6 w-6 text-muted-foreground"/></AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={category.description || ''}>{category.description || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"} className={category.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
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
           <CardFooter className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page <strong>{paginationInfo.pageNumber + 1}</strong> of <strong>{paginationInfo.totalPages}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={paginationInfo.isFirst || isLoading}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={paginationInfo.isLast || isLoading}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
          </CardFooter>
        </Card>
      </main>

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
              fetchSellerCategories(0, searchTerm, statusFilter); 
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
        setIsEditModalOpen(isOpen);
        if (!isOpen) setSelectedCategoryToEdit(null);
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
                fetchSellerCategories(currentPage, searchTerm, statusFilter); 
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
    </>
  );
}
