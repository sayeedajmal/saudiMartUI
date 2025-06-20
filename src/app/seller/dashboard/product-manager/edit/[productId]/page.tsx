
'use client';

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
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, ChevronLeft, Info, ImagePlus, ListPlus, Tags, DollarSign, PlusCircle, Trash2, Boxes, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useSelector } from 'react-redux';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { useParams, useRouter } from 'next/navigation';

interface FetchedCategory {
  id: number;
  name: string;
  isActive: boolean;
}

// Schemas for sub-entities - these should align with what your backend expects for a Product
const productVariantSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(), // Optional for new variants during edit
  sku: z.string().min(1, "Variant SKU is required").max(50),
  variantName: z.string().optional().nullable(), // Matched to backend's 'variantName'
  additionalPrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number({invalid_type_error: "Additional price must be a number"}).optional()
  ),
  available: z.boolean().default(true),
});

const productImageSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL for the image." }),
  altText: z.string().optional().nullable(),
  displayOrder: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseInt(String(val), 10)),
    z.number({invalid_type_error: "Display order must be a number"}).int().optional()
  ),
  isPrimary: z.boolean().default(false),
});

const productSpecificationSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  specName: z.string().min(1, "Specification name is required"),
  specValue: z.string().min(1, "Specification value is required"),
  unit: z.string().optional().nullable(),
  displayOrder: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseInt(String(val), 10)),
    z.number({invalid_type_error: "Display order must be a number"}).int().optional()
  ),
});

const priceTierSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  minQuantity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseInt(String(val), 10)),
    z.number({invalid_type_error: "Min quantity must be a number", required_error: "Min quantity is required"}).int().min(1, "Min quantity must be at least 1")
  ),
  maxQuantity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseInt(String(val), 10)),
    z.number({invalid_type_error: "Max quantity must be a number"}).int().optional().nullable()
  ),
  pricePerUnit: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number({invalid_type_error: "Price must be a number", required_error: "Price per unit is required"}).positive("Price must be positive")
  ),
  isActive: z.boolean().default(true),
});


const productSchema = z.object({
  id: z.number().optional(), // Product ID for updates
  name: z.string().min(3, "Product name must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000).optional().nullable(),
  category: z.object({ id: z.number() }).nullable(), // Sending category as an object with id
  basePrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number({invalid_type_error: "Base price must be a number"}).positive({ message: "Base price must be a positive number" }).optional()
  ),
  isBulkOnly: z.boolean().default(false),
  minimumOrderQuantity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 1 : parseInt(String(val), 10)),
    z.number({invalid_type_error: "MOQ must be a number"}).int().min(1, "MOQ must be at least 1").default(1)
  ),
  weight: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.number({invalid_type_error: "Weight must be a number"}).optional()
  ),
  weightUnit: z.string().max(10).optional().nullable(),
  dimensions: z.string().max(50).optional().nullable(),
  sku: z.string().min(1, "SKU is required").max(50),
  available: z.boolean().default(true),
  seller: z.object({ id: z.string() }).optional(), // Seller info might be needed by backend
  // Sub-entities, matching backend structure as closely as possible
  productVariants: z.array(productVariantSchema).optional(),
  productImages: z.array(productImageSchema).optional(),
  productSpecifications: z.array(productSpecificationSchema).optional(),
  priceTiers: z.array(priceTierSchema).optional(),
  // createdAt and updatedAt are usually handled by the backend
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const accessToken = useSelector(selectAccessToken);
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const [categories, setCategories] = useState<FetchedCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const productId = typeof params.productId === 'string' ? params.productId : null;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: null,
      basePrice: undefined,
      isBulkOnly: false,
      minimumOrderQuantity: 1,
      weight: undefined,
      weightUnit: "",
      dimensions: "",
      sku: "",
      available: true,
      productVariants: [],
      productImages: [],
      productSpecifications: [],
      priceTiers: [],
    },
  });

  const fetchCategories = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingCategories(true);
    try {
      const response = await fetch('http://localhost:8080/categories?isActive=true', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to fetch categories");
      setCategories(responseData.data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error fetching categories", description: error.message });
    } finally {
      setIsLoadingCategories(false);
    }
  }, [accessToken, toast]);

  const fetchProductData = useCallback(async () => {
    if (!productId || !accessToken) {
      setIsLoadingData(false);
      if (!productId) toast({ variant: "destructive", title: "Error", description: "Product ID is missing."});
      if (!accessToken) toast({ variant: "destructive", title: "Auth Error", description: "Please log in."});
      return;
    }
    setIsLoadingData(true);
    try {
      const response = await fetch(`http://localhost:8080/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to fetch product data");
      
      const productData = responseData.data;
      // Map backend data to form values
      form.reset({
        id: productData.id,
        name: productData.name || "",
        description: productData.description || "",
        category: productData.category ? { id: productData.category.id } : null,
        basePrice: productData.basePrice !== null ? productData.basePrice : undefined,
        isBulkOnly: productData.isBulkOnly || false,
        minimumOrderQuantity: productData.minimumOrderQuantity || 1,
        weight: productData.weight !== null ? productData.weight : undefined,
        weightUnit: productData.weightUnit || "",
        dimensions: productData.dimensions || "",
        sku: productData.sku || "",
        available: productData.available === undefined ? true : productData.available,
        seller: productData.seller ? { id: String(productData.seller.id) } : currentUser ? { id: currentUser.id } : undefined,
        // Map sub-entities (ensure field names match Zod schema)
        productVariants: productData.productVariants?.map((v: any) => ({ ...v, additionalPrice: v.additionalPrice ?? undefined })) || [],
        productImages: productData.productImages?.map((img: any) => ({ ...img, displayOrder: img.displayOrder ?? undefined })) || [],
        productSpecifications: productData.productSpecifications?.map((spec: any) => ({ ...spec, displayOrder: spec.displayOrder ?? undefined })) || [],
        priceTiers: productData.priceTiers?.map((tier: any) => ({ ...tier, maxQuantity: tier.maxQuantity ?? undefined })) || [],
      });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error fetching product data", description: error.message });
      router.push('/seller/dashboard/product-manager'); // Redirect if product not found or error
    } finally {
      setIsLoadingData(false);
    }
  }, [productId, accessToken, toast, form, router, currentUser]);

  useEffect(() => {
    if (accessToken) {
      fetchCategories();
      fetchProductData();
    }
  }, [accessToken, fetchCategories, fetchProductData]);

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control: form.control, name: "productVariants" });
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control: form.control, name: "productImages" });
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control: form.control, name: "productSpecifications" });
  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({ control: form.control, name: "priceTiers" });

 const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    if (!productId || !currentUser?.id || !accessToken) {
      toast({ variant: "destructive", title: "Error", description: "Missing product ID, user information, or authentication." });
      setIsSubmitting(false);
      return;
    }

    // Prepare payload for PUT /products/{id}
    // This should match the structure your backend Products entity expects for update
    const productUpdatePayload = {
      ...values, // Includes all form fields, including sub-entity arrays
      id: parseInt(productId, 10), // Ensure productId is a number if backend expects Long
      seller: { id: currentUser.id }, // Ensure seller ID is in the expected format (string or number)
      category: values.category ? { id: Number(values.category.id) } : null,
      // Convert empty strings from optional number inputs to undefined or null if backend expects that
      basePrice: values.basePrice === undefined || values.basePrice === null ? null : Number(values.basePrice),
      weight: values.weight === undefined || values.weight === null ? null : Number(values.weight),
      minimumOrderQuantity: values.minimumOrderQuantity === undefined ? null : Number(values.minimumOrderQuantity),
      // Ensure sub-entity arrays are structured correctly for the backend
      productVariants: values.productVariants?.map(v => ({...v, id: v.id ? Number(v.id) : undefined, additionalPrice: v.additionalPrice ?? null })),
      productImages: values.productImages?.map(img => ({...img, id: img.id ? Number(img.id) : undefined, displayOrder: img.displayOrder ?? null })),
      productSpecifications: values.productSpecifications?.map(s => ({...s, id: s.id ? Number(s.id) : undefined, displayOrder: s.displayOrder ?? null })),
      priceTiers: values.priceTiers?.map(t => ({...t, id: t.id ? Number(t.id) : undefined, maxQuantity: t.maxQuantity ?? null })),
    };
    
    try {
      const response = await fetch(`http://localhost:8080/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(productUpdatePayload),
      });

      const responseData = await response.json();
      if (!response.ok || (responseData.statusCode && responseData.statusCode >= 400)) {
         const serverMessage = responseData.message || (responseData.errors && responseData.errors.map((e: any) => e.defaultMessage || e.message).join(', ')) || `Failed to update product. Status: ${response.status}`;
        throw new Error(serverMessage);
      }
      
      toast({ title: "Product Updated!", description: responseData.message || `Product "${values.name}" has been successfully updated.` });
      // router.push('/seller/dashboard/product-manager'); // Optionally redirect
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Updating Product", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingData || (accessToken && categories.length === 0 && isLoadingCategories)) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Loading product data...</p>
        </div>
    );
  }


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
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard" tooltip="Dashboard"><LayoutDashboard /><span>Dashboard</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/product-manager" isActive tooltip="Product Manager"><Package /><span>Product Manager</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/inventory" tooltip="Inventory Management"><Boxes /><span>Inventory</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/orders" tooltip="Manage Orders"><ShoppingBag /><span>Manage Orders</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/enquiries" tooltip="Manage Enquiries"><MessageSquare /><span>Manage Enquiries</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/quotes" tooltip="Manage Quotes"><FileText /><span>Manage Quotes</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/automated-enquiry-response" tooltip="AI Enquiry Response"><BotMessageSquare /><span>AI Enquiry Response</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/category-management" tooltip="Category Management"><Shapes /><span>Category Management</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/warehouses" tooltip="Manage Warehouses"><Warehouse /><span>Warehouses</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/shipping-settings" tooltip="Shipping Settings"><Truck /><span>Shipping Settings</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/notifications" tooltip="Notifications"><Bell /><span>Notifications</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="#" tooltip="Analytics"><BarChart3 /><span>Analytics</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="#" tooltip="Settings"><Settings /><span>Settings</span></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        </ScrollArea>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <Link href="/seller/dashboard/product-manager">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Product Manager</span>
                </Link>
              </Button>
              <h1 className="font-headline text-2xl font-semibold">Edit Product</h1>
            </div>
        </header>
        <main className="flex-1 p-6">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline">Basic Product Information</CardTitle>
                  <CardDescription>Update the core details for your product.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Premium Quality Steel Pipes" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Product Description</FormLabel><FormControl><Textarea placeholder="Detailed description of your product..." className="min-h-[120px]" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="sku" render={({ field }) => (<FormItem><FormLabel>SKU (Main Product)</FormLabel><FormControl><Input placeholder="e.g., SPP-MQ-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="category.id" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value ?? '')} disabled={isLoadingCategories}>
                          <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {categories.map((cat) => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader><CardTitle className="font-headline">Pricing & Quantity</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (per unit)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name="minimumOrderQuantity" render={({ field }) => (<FormItem><FormLabel>Minimum Order Quantity (MOQ)</FormLabel><FormControl><Input type="number" placeholder="1" {...field} value={field.value ?? 1} onChange={e => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value,10))} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name="isBulkOnly" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2"><div className="space-y-0.5"><FormLabel>Bulk Orders Only</FormLabel><FormDescription>Is this product sold only in bulk quantities?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                </CardContent>
              </Card>
              
              <Card className="shadow-md">
                <CardHeader><CardTitle className="font-headline">Physical Details (Optional)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight</FormLabel><FormControl><Input type="number" step="any" placeholder="e.g., 5.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="weightUnit" render={({ field }) => (<FormItem><FormLabel>Weight Unit</FormLabel><FormControl><Input placeholder="e.g., kg, g, lb" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="dimensions" render={({ field }) => (<FormItem><FormLabel>Dimensions (LxWxH unit)</FormLabel><FormControl><Input placeholder="e.g., 10x20x5 cm" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader><CardTitle className="font-headline">Inventory & Availability</CardTitle></CardHeader>
                <CardContent>
                    <FormField control={form.control} name="available" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Product Available</FormLabel><FormDescription>Is this product currently available for ordering?</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                </CardContent>
              </Card>
              
              <Separator />
              <Alert variant="default" className="bg-primary/10 border-primary/30">
                  <Info className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-primary font-semibold">Advanced Details</AlertTitle>
                  <AlertDescription className="text-primary/80">
                    The sections below (Variants, Images, Specifications, Price Tiers) display existing data. Full add/edit/delete functionality for these within this edit form will be implemented in a future update. For now, these details are sent back with the main product update.
                  </AlertDescription>
              </Alert>
              
              {/* Placeholder sections for sub-entities - data will be passed through on save */}
              <Card className="shadow-md opacity-70 pointer-events-none">
                <CardHeader><CardTitle className="font-headline flex items-center"><ListPlus className="mr-2 h-5 w-5 text-primary"/>Product Variants</CardTitle><CardDescription>Define different versions of your product. (Full editing in future update)</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {variantFields.map((item, index) => (<Card key={item.id} className="p-4 border shadow-sm"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2"><FormField control={form.control} name={`productVariants.${index}.sku`} render={({ field }) => (<FormItem><FormLabel>Variant SKU</FormLabel><FormControl><Input placeholder="Variant SKU" {...field} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`productVariants.${index}.variantName`} render={({ field }) => (<FormItem><FormLabel>Variant Name</FormLabel><FormControl><Input placeholder="e.g., Red, Small" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`productVariants.${index}.additionalPrice`} render={({ field }) => (<FormItem><FormLabel>Additional Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /></div><FormField control={form.control} name={`productVariants.${index}.available`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-2 mt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled/></FormControl><FormLabel className="mb-0 font-normal">Available</FormLabel></FormItem>)} /></Card>))}
                </CardContent>
              </Card>

              <Card className="shadow-md opacity-70 pointer-events-none">
                <CardHeader><CardTitle className="font-headline flex items-center"><ImagePlus className="mr-2 h-5 w-5 text-primary"/>Product Images</CardTitle><CardDescription>Manage image URLs for your product. (Full editing in future update)</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                   {imageFields.map((item, index) => (<Card key={item.id} className="p-4 border shadow-sm"><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2"><FormField control={form.control} name={`productImages.${index}.imageUrl`} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`productImages.${index}.altText`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="Descriptive alt text" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`productImages.${index}.displayOrder`} render={({ field }) => (<FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /></div><FormField control={form.control} name={`productImages.${index}.isPrimary`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-2 mt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled/></FormControl><FormLabel className="mb-0 font-normal">Primary Image</FormLabel></FormItem>)} /></Card>))}
                </CardContent>
              </Card>

              <Card className="shadow-md opacity-70 pointer-events-none">
                <CardHeader><CardTitle className="font-headline flex items-center"><Tags className="mr-2 h-5 w-5 text-primary"/>Product Specifications</CardTitle><CardDescription>Manage key-value pairs for product specifications. (Full editing in future update)</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {specFields.map((item, index) => (<Card key={item.id} className="p-4 border shadow-sm"><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2"><FormField control={form.control} name={`productSpecifications.${index}.specName`} render={({ field }) => (<FormItem><FormLabel>Spec Name</FormLabel><FormControl><Input placeholder="e.g., Material" {...field} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`productSpecifications.${index}.specValue`} render={({ field }) => (<FormItem><FormLabel>Spec Value</FormLabel><FormControl><Input placeholder="e.g., Steel" {...field} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`productSpecifications.${index}.unit`} render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><FormControl><Input placeholder="e.g., cm, kg" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`productSpecifications.${index}.displayOrder`} render={({ field }) => (<FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /></div></Card>))}
                </CardContent>
              </Card>

              <Card className="shadow-md opacity-70 pointer-events-none">
                <CardHeader><CardTitle className="font-headline flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary"/>Price Tiers</CardTitle><CardDescription>Set up volume-based pricing. (Full editing in future update)</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {tierFields.map((item, index) => (<Card key={item.id} className="p-4 border shadow-sm"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2"><FormField control={form.control} name={`priceTiers.${index}.minQuantity`} render={({ field }) => (<FormItem><FormLabel>Min Quantity</FormLabel><FormControl><Input type="number" placeholder="1" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`priceTiers.${index}.maxQuantity`} render={({ field }) => (<FormItem><FormLabel>Max Quantity</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /><FormField control={form.control} name={`priceTiers.${index}.pricePerUnit`} render={({ field }) => (<FormItem><FormLabel>Price Per Unit</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} disabled/></FormControl></FormItem>)} /></div><FormField control={form.control} name={`priceTiers.${index}.isActive`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-2 mt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled/></FormControl><FormLabel className="mb-0 font-normal">Active</FormLabel></FormItem>)} /></Card>))}
                </CardContent>
              </Card>

              <Separator />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/seller/dashboard/product-manager')} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[150px]" disabled={isSubmitting || isLoadingData}>
                  {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ("Save Changes")}
                </Button>
              </div>
            </form>
          </FormProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

