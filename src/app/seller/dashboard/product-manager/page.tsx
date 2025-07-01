
'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package, PlusCircle, Edit3, Trash2, Loader2, Eye, ChevronDown, Image as ImageIcon, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { API_BASE_URL } from '@/lib/api';

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
}

interface ProductSpecification {
  id: string;
  specName: string;
  specValue: string;
  unit: string | null;
}

interface PriceTier {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number;
  isActive: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  variantName: string | null;
  basePrice: number | null;
  additionalPrice: number;
  available: boolean;
  images?: ProductImage[]; 
  priceTiers: PriceTier[];
}

export interface SellerProduct {
  id: string;
  name: string;
  sku: string;
  category: { id: string; name: string; } | null;
  basePrice: number | null;
  available: boolean;
  description: string | null;
  minimumOrderQuantity: number;
  weight: number | null;
  weightUnit: string | null;
  dimensions: string | null;
  createdAt: string;
  updatedAt: string | null;
  seller: { id: string; name: string; };
  specifications: ProductSpecification[];
  variants: ProductVariant[];
}

interface PaginationInfo {
    totalPages: number;
    totalElements: number;
    isFirst: boolean;
    isLast: boolean;
    pageNumber: number;
    pageSize: number;
}

export default function SellerProductManagerPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<SellerProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
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
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const { toast } = useToast();

  const handleToggleRow = (productId: string) => {
    setExpandedRowId(currentId => (currentId === productId ? null : productId));
  };

  const fetchSellerProducts = useCallback(async (page = 0) => {
    setIsLoading(true);
    setError(null);
    if (!accessToken || !currentUser?.id) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/seller/${currentUser.id}?page=${page}&size=10`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch products');
      }

      const productData = responseData.data;
      const sellerApiProducts: any[] = productData?.content || [];

      const fetchedProducts: SellerProduct[] = sellerApiProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category ? { id: p.category.id, name: p.category.name } : null,
        basePrice: p.basePrice,
        available: p.available,
        description: p.description,
        minimumOrderQuantity: p.minimumOrderQuantity,
        weight: p.weight,
        weightUnit: p.weightUnit,
        dimensions: p.dimensions,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        seller: p.seller,
        specifications: p.specifications?.map((spec: any) => ({
          id: spec.id,
          specName: spec.specName,
          specValue: spec.specValue,
          unit: spec.unit,
        })) || [],
        variants: p.variants?.map((variant: any) => ({
          id: variant.id,
          sku: variant.sku,
          variantName: variant.variantName,
          basePrice: variant.basePrice,
          additionalPrice: variant.additionalPrice,
          available: variant.available,
          images: variant.images?.map((img: any) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            altText: img.altText,
            isPrimary: img.isPrimary,
          })) || [],
          priceTiers: variant.priceTiers?.map((tier: any) => ({
            id: tier.id,
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity,
            pricePerUnit: tier.pricePerUnit,
            isActive: tier.isActive,
          })) || []
        })) || [],
      }));

      setProducts(fetchedProducts);
      setPaginationInfo({
        totalPages: productData?.totalPages || 1,
        totalElements: productData?.totalElements || 0,
        isFirst: productData?.first || true,
        isLast: productData?.last || true,
        pageNumber: productData?.number || 0,
        pageSize: productData?.size || 10,
      });
      setCurrentPage(productData?.number || 0);

      if (fetchedProducts.length === 0) {
        toast({ title: "No Products Found", description: "You haven't added any products yet." });
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

  const handleNextPage = () => {
    if (!paginationInfo.isLast) {
      fetchSellerProducts(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (!paginationInfo.isFirst) {
      fetchSellerProducts(currentPage - 1);
    }
  };


  const handleDeleteProduct = (e: React.MouseEvent, product: SellerProduct) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    if (!accessToken) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please login to delete products." });
      setProductToDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to delete product. Status: ${response.status}`);
      }

      toast({ title: "Product Deleted", description: responseData.message || `${productToDelete.name} has been deleted.` });
      fetchSellerProducts(currentPage);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error Deleting Product", description: err.message });
    } finally {
      setProductToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <>
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSellerProducts(currentPage)}
                disabled={isLoading}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                title="Refresh Products"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                asChild
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/seller/dashboard/product-manager/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                </Link>
              </Button>
            </div>


          </CardHeader>
          <CardContent>
            {isLoading && products.length === 0 && (
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
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const primaryImage = product.variants?.[0]?.images?.find(img => img.isPrimary) || product.variants?.[0]?.images?.[0];
                    return (
                      <Fragment key={product.id}>
                        <TableRow onClick={() => handleToggleRow(product.id)} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedRowId === product.id ? 'rotate-180' : ''}`} />
                          </TableCell>
                          <TableCell>
                            <a href={primaryImage?.imageUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              <Avatar className="h-12 w-12 rounded-md">
                                <AvatarImage src={primaryImage?.imageUrl} alt={primaryImage?.altText || product.name} className="object-cover" />
                                <AvatarFallback className="rounded-md"><ImageIcon className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                              </Avatar>
                            </a>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate" title={product.name}>{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>${typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : (product.basePrice || 'N/A')}</TableCell>
                          <TableCell>
                            <Badge variant={product.available ? "default" : "secondary"} className={product.available ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                              {product.available ? "Available" : "Unavailable"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="font-headline text-base mb-2">Product Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                          <p className="font-semibold text-foreground">Description:</p>
                                          <p className="text-muted-foreground col-span-2">{product.description || 'N/A'}</p>
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-2">
                                          <p className="font-semibold text-foreground">Category:</p><p className="text-muted-foreground">{product.category?.name || 'Uncategorized'}</p>
                                          <p className="font-semibold text-foreground">MOQ:</p><p className="text-muted-foreground">{product.minimumOrderQuantity} units</p>
                                          <p className="font-semibold text-foreground">Weight:</p><p className="text-muted-foreground">{product.weight ? `${product.weight} ${product.weightUnit || ''}`.trim() : 'N/A'}</p>
                                          <p className="font-semibold text-foreground">Dimensions:</p><p className="text-muted-foreground">{product.dimensions || 'N/A'}</p>
                                          <p className="font-semibold text-foreground">Date Added:</p><p className="text-muted-foreground">{new Date(product.createdAt).toLocaleString()}</p>
                                          <p className="font-semibold text-foreground">Last Updated:</p><p className="text-muted-foreground">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'Not yet updated'}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-headline text-base mb-2">Specifications</h4>
                                      {product.specifications.length > 0 ? (
                                        <div className="space-y-1 text-sm">
                                          {product.specifications.map(spec => (
                                            <div key={spec.id} className="grid grid-cols-2 gap-2">
                                              <p className="font-medium text-foreground">{spec.specName}:</p>
                                              <p className="text-muted-foreground">{spec.specValue} {spec.unit || ''}</p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (<p className="text-sm text-muted-foreground">No specifications provided.</p>)}
                                    </div>
                                  </div>
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="font-headline text-base mb-2">Variants</h4>
                                      {product.variants.length > 0 ? (
                                        <div className="space-y-4">
                                          {product.variants.map(v => (
                                            <Card key={v.id} className="p-3 bg-background/50">
                                              <p className="font-semibold">{v.variantName || 'Default Variant'}</p>
                                              <p className="text-sm text-muted-foreground">SKU: {v.sku}</p>
                                              <p className="text-sm text-muted-foreground">Base Price: ${v.basePrice?.toFixed(2) || product.basePrice?.toFixed(2) || 'N/A'}</p>
                                              {v.priceTiers.length > 0 && (
                                                <div className="mt-2">
                                                  <p className="text-xs font-semibold text-muted-foreground">PRICE TIERS</p>
                                                  <Table className="bg-background mt-1">
                                                    <TableHeader><TableRow><TableHead className="h-8">Min Qty</TableHead><TableHead className="h-8">Max Qty</TableHead><TableHead className="h-8">Price/Unit</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                      {v.priceTiers.map(t => (
                                                        <TableRow key={t.id}><TableCell>{t.minQuantity}</TableCell><TableCell>{t.maxQuantity || '...'}</TableCell><TableCell>${t.pricePerUnit.toFixed(2)}</TableCell></TableRow>
                                                      ))}
                                                    </TableBody>
                                                  </Table>
                                                </div>
                                              )}
                                            </Card>
                                          ))}
                                        </div>
                                      ) : (<p className="text-sm text-muted-foreground">No variants defined.</p>)}
                                    </div>
                                    <div>
                                      <h4 className="font-headline text-base mb-2">Images</h4>
                                      {product.variants.length > 0 && product.variants[0].images && product.variants[0].images.length > 0 ? (
                                        <ul className="text-sm space-y-1 list-disc list-inside">
                                          {product.variants[0].images.map(img => (
                                            <li key={img.id} className="text-muted-foreground" title={img.imageUrl}>
                                              <a href={img.imageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">{img.imageUrl}</a>
                                              {img.isPrimary && <Badge variant="outline" className="ml-2">Primary</Badge>}
                                              <Avatar className="h-16 w-16 rounded-md mt-2">
                                                <AvatarImage src={img.imageUrl} alt={img.altText || product.name} className="object-cover" />
                                                <AvatarFallback className="rounded-md">
                                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                </AvatarFallback>
                                              </Avatar>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (<p className="text-sm text-muted-foreground">No images added.</p>)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {products.length > 0 && (
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
          )}
        </Card>
      </main>

      {productToDelete && (
        <AlertDialog open={!!productToDelete} onOpenChange={(isOpen) => { if (!isOpen) setProductToDelete(null); }}>
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
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
