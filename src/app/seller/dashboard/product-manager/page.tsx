
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
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, PlusCircle, Edit3, Trash2, Loader2, Eye, Boxes, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Simplified Product type for listing. Adjust as needed based on actual API response.
export interface SellerProductListItem {
  product_id: string; // Assuming backend provides this
  name: string;
  sku: string;
  category_id: string; // We might need to fetch category name separately or have it nested
  category_name?: string; // Placeholder for display
  base_price: number | string; // Can be string from form, number from API
  available: boolean;
}

// DUMMY DATA - Replace with actual API call
const DUMMY_PRODUCTS_LIST: SellerProductListItem[] = [
  { product_id: 'prod_123', name: 'Premium Steel Pipes', sku: 'SPP-MQ-001', category_id: 'cat_seller_1', category_name: 'My Custom Electronics', base_price: 150.00, available: true },
  { product_id: 'prod_456', name: 'Organic Cotton Fabric', sku: 'OCF-Handmade-002', category_id: 'cat_seller_2', category_name: 'Handmade Textiles', base_price: 25.50, available: true },
  { product_id: 'prod_789', name: 'Gourmet Spice Mix', sku: 'GSM-Local-003', category_id: 'cat_seller_3', category_name: 'Locally Sourced Spices', base_price: 12.75, available: false },
];


export default function SellerProductManagerPage() {
  const [products, setProducts] = useState<SellerProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<SellerProductListItem | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchSellerProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken) {
      // setError("Authentication token not found. Please log in.");
      // setIsLoading(false);
      // Using dummy data if not logged in, for demo. Real app should prevent this.
      toast({ title: "Demo Mode", description: "Displaying sample products. Login to see your actual products." });
      setProducts(DUMMY_PRODUCTS_LIST);
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call: GET /products/seller/me (or similar)
      // For now, simulate API call with dummy data if token exists
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      // Example:
      // const response = await fetch('http://localhost:8080/products/seller/me', {
      //   headers: { 'Authorization': `Bearer ${accessToken}` },
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to fetch products');
      // }
      // const data: SellerProductListItem[] = await response.json(); // Adjust type based on actual API
      // setProducts(data);
      
      // Simulating fetched data for now
      setProducts(DUMMY_PRODUCTS_LIST.map(p => ({...p, name: `${p.name} (Fetched)`}))); 
      toast({
        title: "Products Loaded (Simulated)",
        description: "Displaying products for the logged-in seller (simulated fetch).",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching products.");
      setProducts(DUMMY_PRODUCTS_LIST); // Fallback to basic dummy data on error
      toast({
        variant: "destructive",
        title: "Error Fetching Products",
        description: err.message || "Could not load your products.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    fetchSellerProducts();
  }, [fetchSellerProducts]);

  const handleDeleteProduct = (product: SellerProductListItem) => {
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    if(!accessToken) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please login to delete products." });
      setProductToDelete(null);
      return;
    }
    // TODO: Implement actual API call: DELETE /products/{productToDelete.product_id}
    // For now, simulate delete and show toast
    console.log(`Simulating delete for product ID: ${productToDelete.product_id} with token: ${accessToken}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    toast({ title: "Product Deleted (Simulated)", description: `${productToDelete.name} has been deleted.` });
    setProducts(prev => prev.filter(p => p.product_id !== productToDelete.product_id));
    setProductToDelete(null);
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
                      <TableRow key={product.product_id}>
                        <TableCell className="font-medium max-w-xs truncate" title={product.name}>{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category_name || product.category_id}</TableCell>
                        <TableCell>${typeof product.base_price === 'number' ? product.base_price.toFixed(2) : product.base_price}</TableCell>
                        <TableCell>
                          <Badge variant={product.available ? "default" : "secondary"} className={product.available ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                            {product.available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <Button variant="outline" size="sm" asChild>
                            {/* Placeholder for viewing product on storefront - assumes a public product page structure */}
                            <Link href={`/products/${product.product_id}`} target="_blank" title="View on storefront (placeholder - needs correct slug or ID)">
                              <Eye className="mr-1 h-3 w-3" /> 
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            {/* TODO: Update href to actual edit page: /seller/dashboard/product-manager/edit/${product.product_id} */}
                            <Link href={`#edit-${product.product_id}`} title="Edit Product (Not Implemented)">
                              <Edit3 className="mr-1 h-3 w-3" /> Edit
                            </Link>
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product)} title="Delete Product">
                            <Trash2 className="mr-1 h-3 w-3" /> 
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

      {productToDelete && (
        <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete &quot;{productToDelete.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product listing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SidebarProvider>
  );
}
    
