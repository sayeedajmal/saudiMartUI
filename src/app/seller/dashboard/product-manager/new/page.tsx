
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';


const DUMMY_SELLER_CATEGORIES = [
  { id: "cat_seller_1", name: "My Custom Electronics" },
  { id: "cat_seller_2", name: "Handmade Textiles" },
  { id: "cat_seller_3", name: "Locally Sourced Spices (Inactive)" },
  { id: "cat_example_1", name: "General Goods (from main list example)" }
];

const productVariantSchema = z.object({
  sku: z.string().min(1, "Variant SKU is required").max(50),
  variant_name: z.string().optional(),
  additional_price: z.coerce.number({invalid_type_error: "Additional price must be a number"}).optional(), 
  available: z.boolean().default(true),
});

const productImageSchema = z.object({
  image_url: z.string().url({ message: "Please enter a valid URL for the image." }),
  alt_text: z.string().optional(),
  display_order: z.coerce.number({invalid_type_error: "Display order must be a number"}).int().optional(),
  is_primary: z.boolean().default(false),
});

const productSpecificationSchema = z.object({
  spec_name: z.string().min(1, "Specification name is required"),
  spec_value: z.string().min(1, "Specification value is required"),
  unit: z.string().optional(),
  display_order: z.coerce.number({invalid_type_error: "Display order must be a number"}).int().optional(),
});

const priceTierSchema = z.object({
  min_quantity: z.coerce.number({invalid_type_error: "Min quantity must be a number"}).int().min(1, "Min quantity must be at least 1"),
  max_quantity: z.coerce.number({invalid_type_error: "Max quantity must be a number"}).int().optional().nullable().transform(val => val === null || val === '' ? undefined : val),
  price_per_unit: z.coerce.number({invalid_type_error: "Price must be a number"}).positive("Price must be positive"),
  is_active: z.boolean().default(true),
});


const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  category_id: z.string().min(1, "Please select a category"),
  base_price: z.coerce.number({invalid_type_error: "Base price must be a number"}).positive("Price must be a positive number").optional(),
  is_bulk_only: z.boolean().default(false),
  minimum_order_quantity: z.coerce.number({invalid_type_error: "MOQ must be a number"}).int().min(1, "MOQ must be at least 1").default(1),
  weight: z.coerce.number({invalid_type_error: "Weight must be a number"}).optional(),
  weight_unit: z.string().max(10).optional(),
  dimensions: z.string().max(50).optional(),
  sku: z.string().min(1, "SKU is required").max(50),
  available: z.boolean().default(true),
  variants: z.array(productVariantSchema).optional(),
  images: z.array(productImageSchema).optional(),
  specifications: z.array(productSpecificationSchema).optional(),
  priceTiers: z.array(priceTierSchema).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddNewProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const accessToken = useSelector(selectAccessToken);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      base_price: '' as unknown as number,
      is_bulk_only: false,
      minimum_order_quantity: 1,
      weight: '' as unknown as number, 
      weight_unit: "",
      dimensions: "",
      sku: "",
      available: true,
      variants: [],
      images: [],
      specifications: [],
      priceTiers: [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants"
  });
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images"
  });
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications"
  });
  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({
    control: form.control,
    name: "priceTiers"
  });

 const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);

    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You are not logged in. Please log in to add a product.",
      });
      setIsLoading(false);
      return;
    }
    
    const apiValues = {
      ...values,
      base_price: values.base_price === ('' as unknown as number) || values.base_price === undefined ? undefined : Number(values.base_price),
      weight: values.weight === ('' as unknown as number) || values.weight === undefined ? undefined : Number(values.weight),
      minimum_order_quantity: values.minimum_order_quantity === ('' as unknown as number) || values.minimum_order_quantity === undefined ? 1 : Number(values.minimum_order_quantity),
      variants: values.variants?.map(v => ({...v, additional_price: v.additional_price === ('' as unknown as number) || v.additional_price === undefined ? undefined : Number(v.additional_price)})),
      images: values.images?.map(img => ({...img, display_order: img.display_order === ('' as unknown as number) || img.display_order === undefined ? undefined : Number(img.display_order)})),
      specifications: values.specifications?.map(spec => ({...spec, display_order: spec.display_order === ('' as unknown as number) || spec.display_order === undefined ? undefined : Number(spec.display_order)})),
      priceTiers: values.priceTiers?.map(tier => ({
        ...tier,
        min_quantity: tier.min_quantity === ('' as unknown as number) || tier.min_quantity === undefined ? 1 : Number(tier.min_quantity),
        max_quantity: tier.max_quantity === ('' as unknown as number) || tier.max_quantity === undefined || tier.max_quantity === null ? undefined : Number(tier.max_quantity),
        price_per_unit: tier.price_per_unit === ('' as unknown as number) || tier.price_per_unit === undefined ? undefined : Number(tier.price_per_unit),
      }))
    };
    
    console.log("Submitting to API:", JSON.stringify(apiValues, null, 2));

    try {
      const response = await fetch('http://localhost:8080/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(apiValues),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", responseData);
        const serverMessage = responseData.message || (responseData.errors && responseData.errors.map((e: any) => e.defaultMessage).join(', ')) || `Failed to create product. Status: ${response.status}`;
        throw new Error(serverMessage);
      }

      toast({
        title: "Product Created Successfully!",
        description: responseData.message || `Product "${values.name}" has been created.`,
      });
      form.reset({ 
        name: "",
        description: "",
        category_id: "",
        base_price: '' as unknown as number,
        is_bulk_only: false,
        minimum_order_quantity: 1,
        weight: '' as unknown as number,
        weight_unit: "",
        dimensions: "",
        sku: "",
        available: true,
        variants: [],
        images: [],
        specifications: [],
        priceTiers: [],
      }); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Creating Product",
        description: error.message || "An unexpected error occurred. Please check the console for more details.",
      });
      console.error("Product creation error details:", error);
    } finally {
      setIsLoading(false);
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <Link href="/seller/dashboard/product-manager">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Product Manager</span>
                </Link>
              </Button>
              <h1 className="font-headline text-2xl font-semibold">Add New Product</h1>
            </div>
        </header>
        <main className="flex-1 p-6">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline">Basic Product Information</CardTitle>
                  <CardDescription>Enter the core details for your new product.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Premium Quality Steel Pipes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed description of your product..." className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (Main Product)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SPP-MQ-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DUMMY_SELLER_CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the primary category for this product. <Link href="/seller/dashboard/category-management" className="text-xs text-primary hover:underline">Manage Categories</Link>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline">Pricing & Quantity</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                   <FormField
                    control={form.control}
                    name="base_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (per unit)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} 
                                 onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minimum_order_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Quantity (MOQ)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} value={field.value ?? 1}
                                 onChange={e => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value, 10))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_bulk_only"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                        <div className="space-y-0.5">
                          <FormLabel>Bulk Orders Only</FormLabel>
                          <FormDescription>
                            Is this product sold only in bulk quantities?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline">Physical Details (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="e.g., 5.5" {...field} value={field.value ?? ''} 
                                 onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., kg, g, lb" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensions (LxWxH unit)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10x20x5 cm" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline">Inventory & Availability</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Product Available</FormLabel>
                          <FormDescription>
                            Is this product currently available for ordering?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Separator />

              {/* Product Variants Section */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center"><ListPlus className="mr-2 h-5 w-5 text-primary"/>Product Variants</CardTitle>
                  <CardDescription>Define different versions of your product (e.g., by size, color). Each variant can have its own SKU and price adjustment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {variantFields.map((item, index) => (
                    <Card key={item.id} className="p-4 border shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Variant SKU</FormLabel>
                              <FormControl><Input placeholder="Variant SKU" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.variant_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Variant Name (Optional)</FormLabel>
                              <FormControl><Input placeholder="e.g., Red, Small" {...field} value={field.value ?? ''}/></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.additional_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Price (Optional)</FormLabel>
                              <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''}
                                                   onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.available`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                               <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                               <FormLabel className="mb-0 font-normal">Available</FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeVariant(index)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Remove Variant
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendVariant({ sku: '', variant_name: '', additional_price: '' as unknown as number, available: true })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                  </Button>
                </CardContent>
              </Card>

              {/* Product Images Section */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center"><ImagePlus className="mr-2 h-5 w-5 text-primary"/>Product Images</CardTitle>
                  <CardDescription>Add image URLs for your product. Mark one as primary. (Actual file upload coming soon)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imageFields.map((item, index) => (
                    <Card key={item.id} className="p-4 border shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <FormField
                          control={form.control}
                          name={`images.${index}.image_url`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Image URL</FormLabel>
                              <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`images.${index}.alt_text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alt Text (Optional)</FormLabel>
                              <FormControl><Input placeholder="Descriptive alt text" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`images.${index}.display_order`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Order (Optional)</FormLabel>
                              <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''}
                                                   onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value,10))}/></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                         <FormField
                          control={form.control}
                          name={`images.${index}.is_primary`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                               <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                               <FormLabel className="mb-0 font-normal">Primary Image</FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Remove Image
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendImage({ image_url: '', alt_text: '', display_order: '' as unknown as number, is_primary: imageFields.length === 0 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
                  </Button>
                   <Alert variant="default" className="bg-muted/50 mt-4">
                     <Info className="h-4 w-4" />
                     <AlertDescription className="text-xs">
                       Actual file uploads for images will be implemented later. For now, please use publicly accessible image URLs. Ensure only one image is marked as primary.
                     </AlertDescription>
                   </Alert>
                </CardContent>
              </Card>

              {/* Product Specifications Section */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center"><Tags className="mr-2 h-5 w-5 text-primary"/>Product Specifications</CardTitle>
                  <CardDescription>Add key-value pairs for product specifications (e.g., Material: Steel, Voltage: 220V).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {specFields.map((item, index) => (
                    <Card key={item.id} className="p-4 border shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.spec_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spec Name</FormLabel>
                              <FormControl><Input placeholder="e.g., Material" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.spec_value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spec Value</FormLabel>
                              <FormControl><Input placeholder="e.g., Steel" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit (Optional)</FormLabel>
                              <FormControl><Input placeholder="e.g., cm, kg" {...field} value={field.value ?? ''} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`specifications.${index}.display_order`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Order (Optional)</FormLabel>
                              <FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} 
                                                   onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value,10))} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeSpec(index)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Remove Specification
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendSpec({ spec_name: '', spec_value: '', unit: '', display_order: '' as unknown as number })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Specification
                  </Button>
                </CardContent>
              </Card>

              {/* Price Tiers Section */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary"/>Price Tiers</CardTitle>
                  <CardDescription>Set up volume-based pricing. Offer discounts for larger quantities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tierFields.map((item, index) => (
                    <Card key={item.id} className="p-4 border shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                        <FormField
                          control={form.control}
                          name={`priceTiers.${index}.min_quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Quantity</FormLabel>
                              <FormControl><Input type="number" placeholder="1" {...field} value={field.value ?? ''}
                                                   onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value,10))} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`priceTiers.${index}.max_quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Quantity (Optional)</FormLabel>
                              <FormControl><Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} 
                                                   onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value,10))} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`priceTiers.${index}.price_per_unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Per Unit</FormLabel>
                              <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''}
                                                   onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                       <div className="flex justify-between items-center mt-2">
                        <FormField
                          control={form.control}
                          name={`priceTiers.${index}.is_active`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                               <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                               <FormLabel className="mb-0 font-normal">Active</FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeTier(index)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Remove Tier
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendTier({ min_quantity: '' as unknown as number, max_quantity: undefined, price_per_unit: '' as unknown as number, is_active: true })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Price Tier
                  </Button>
                </CardContent>
              </Card>

              <Separator />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => form.reset({ 
                    name: "", description: "", category_id: "", base_price: '' as unknown as number, is_bulk_only: false, minimum_order_quantity: 1,
                    weight: '' as unknown as number, weight_unit: "", dimensions: "", sku: "", available: true,
                    variants: [], images: [], specifications: [], priceTiers: [],
                })} disabled={isLoading}>
                  Reset Form
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[150px]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Product"
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

