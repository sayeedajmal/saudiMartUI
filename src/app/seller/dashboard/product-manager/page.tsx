
'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
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
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, PlusCircle, Edit3, Trash2, Loader2, Eye, Boxes, FileText, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export interface SellerProduct {
  id: number;
  name: string;
  sku: string;
  category: { id: number; name: string; } | null;
  basePrice: number | null;
  available: boolean;
  description: string | null;
  isBulkOnly: boolean;
  minimumOrderQuantity: number;
  weight: number | null;
  weightUnit: string | null;
  dimensions: string | null;
  createdAt: string;
  updatedAt: string | null;
  seller: { id: string; name: string; };
}

export default function SellerProductManagerPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<SellerProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const { toast } = useToast();

  const handleToggleRow = (productId: number) => {
    setExpandedRowId(currentId => (currentId === productId ? null : productId));
  };


  const fetchSellerProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken || !currentUser?.id) {
      setProducts([]); 
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/products', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch products');
      }
      
      const allProducts: any[] = responseData.data || [];
      const sellerSpecificProducts = allProducts.filter(p => p.seller?.id?.toString() === currentUser.id);
      
      const fetchedProducts: SellerProduct[] = sellerSpecificProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category ? { id: p.category.id, name: p.category.name } : null,
        basePrice: p.basePrice,
        available: p.available,
        description: p.description,
        isBulkOnly: p.isBulkOnly,
        minimumOrderQuantity: p.minimumOrderQuantity,
        weight: p.weight,
        weightUnit: p.weightUnit,
        dimensions: p.dimensions,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        seller: p.seller,
      }));

      setProducts(fetchedProducts);
       if (fetchedProducts.length === 0) {
         toast({ title: "No Products Found", description: "You haven't added any products yet."});
       }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching products.");
      setProducts([]); 
      toast({
        variant: "destructive",
        title: "Error Fetching Products",
        description: err.message || "Could not load your products.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, currentUser, toast]);

  useEffect(() => {
    if (accessToken && currentUser) {
        fetchSellerProducts();
    } else if (!accessToken || !currentUser) {
        setProducts([]);
        setIsLoading(false);
    }
  }, [accessToken, currentUser, fetchSellerProducts]);

  const handleDeleteProduct = (e: React.MouseEvent, product: SellerProduct) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    if(!accessToken) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please login to delete products." });
      setProductToDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8080/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to delete product. Status: ${response.status}`);
      }
      
      toast({ title: "Product Deleted", description: responseData.message || `${productToDelete.name} has been deleted.` });
      fetchSellerProducts(); 
    } catch (err: any) {
       toast({ variant: "destructive", title: "Error Deleting Product", description: err.message });
    } finally {
      setProductToDelete(null);
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
              <SidebarMenuButton href="/seller/dashboard/product-manager" isActive tooltip="Product Manager">
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
            <h1 className="font-headline text-2xl font-semibold">Product Management</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Your Products</CardTitle>
                <CardDescription>View, add, edit, or delete your product listings.</CardDescription>
              </div>
              <Button
                asChild
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/seller/dashboard/product-manager/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading products...</p>
                </div>
              )}
              {!isLoading && error && (
                <p className="text-destructive text-center py-8">{error}</p>
              )}
              {!isLoading && !error && products.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground mb-2">No products found.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't added any products yet.
                  </p>
                  <Button variant="default" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                     <Link href="/seller/dashboard/product-manager/new">Add your first product!</Link>
                  </Button>
                </div>
              )}
              {!isLoading && !error && products.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <Fragment key={product.id}>
                        <TableRow onClick={() => handleToggleRow(product.id)} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedRowId === product.id ? 'rotate-180' : ''}`} />
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate" title={product.name}>{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.category?.name || 'N/A'}</TableCell>
                          <TableCell>${typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : (product.basePrice || 'N/A')}</TableCell>
                          <TableCell>
                            <Badge variant={product.available ? "default" : "secondary"} className={product.available ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                              {product.available ? "Available" : "Unavailable"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" asChild onClick={e => e.stopPropagation()}>
                                <Link href={`/products/${product.id}`} target="_blank" title="View on storefront">
                                <Eye className="mr-1 h-3 w-3" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild onClick={e => e.stopPropagation()}>
                                <Link href={`/seller/dashboard/product-manager/${product.id}`} title="Edit Product">
                                <Edit3 className="mr-1 h-3 w-3" /> Edit
                                </Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={(e) => handleDeleteProduct(e, product)} title="Delete Product" disabled={isDeleting}>
                                {isDeleting && productToDelete?.id === product.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Trash2 className="mr-1 h-3 w-3" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedRowId === product.id && (
                          <TableRow className="bg-muted hover:bg-muted">
                            <TableCell colSpan={7} className="p-0">
                                <div className="p-6">
                                  <h4 className="font-headline text-lg mb-4">Additional Details for: {product.name}</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                                    <div className="space-y-1 lg:col-span-2">
                                      <p className="font-semibold text-foreground">Description</p>
                                      <p className="text-muted-foreground">{product.description || 'No description provided.'}</p>
                                    </div>
                                     <div className="space-y-1">
                                      <p className="font-semibold text-foreground">Category</p>
                                      <p className="text-muted-foreground">{product.category?.name || 'Uncategorized'}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-semibold text-foreground">MOQ</p>
                                      <p className="text-muted-foreground">{product.minimumOrderQuantity} units</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-semibold text-foreground">Bulk Only</p>
                                      <p className="text-muted-foreground">{product.isBulkOnly ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-semibold text-foreground">Weight</p>
                                      <p className="text-muted-foreground">{product.weight ? `${product.weight} ${product.weightUnit || ''}`.trim() : 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-semibold text-foreground">Dimensions</p>
                                      <p className="text-muted-foreground">{product.dimensions || 'N/A'}</p>
                                    </div>
                                     <div className="space-y-1">
                                      <p className="font-semibold text-foreground">Date Added</p>
                                      <p className="text-muted-foreground">{new Date(product.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-semibold text-foreground">Last Updated</p>
                                      <p className="text-muted-foreground">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'Not yet updated'}</p>
                                    </div>
                                  </div>
                                </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      {productToDelete && (
        <AlertDialog open={!!productToDelete} onOpenChange={(isOpen) => { if(!isOpen) setProductToDelete(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete &quot;{productToDelete.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product listing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Yes, Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SidebarProvider>
  );
}
