

'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronLeft, Info, ImagePlus, ListPlus, Tags, DollarSign, PlusCircle, Trash2, Loader2, BookCopy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useSelector } from 'react-redux';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface FetchedCategory {
  id: string;
  name: string;
  isActive: boolean;
}

const priceTierSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  minQuantity: z.coerce.number({ required_error: "Min quantity is required" }).int().min(1, "Min quantity must be at least 1"),
  maxQuantity: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number({ invalid_type_error: "Max quantity must be a number" }).int().optional().nullable()
  ),
  pricePerUnit: z.coerce.number({ required_error: "Price per unit is required" }).positive("Price must be positive"),
  discountPercent: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ invalid_type_error: "Discount must be a number" }).optional().nullable()
  ),
  isActive: z.boolean().default(true),
});

const imageSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  imageUrl: z.string()
    .min(1, "Image URL is required.")
    .url({ message: "Please enter a valid URL." })
    .max(500, { message: "Image URL cannot be longer than 500 characters." }),
  altText: z.string().max(255).optional().nullable(),
  displayOrder: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ invalid_type_error: "Display order must be a number" }).int().optional().nullable()
  ),
  isPrimary: z.boolean().default(false),
});

const productSpecificationSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  specName: z.string().min(1, "Specification name is required"),
  specValue: z.string().min(1, "Specification value is required"),
  unit: z.string().optional().nullable(),
  displayOrder: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ invalid_type_error: "Display order must be a number" }).int().optional().nullable()
  ),
});

const productVariantSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  sku: z.string().min(1, "Variant SKU is required").max(50),
  variantName: z.string().optional().nullable(),
  basePrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ invalid_type_error: "Base price must be a number" }).positive().optional().nullable()
  ),
  additionalPrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ invalid_type_error: "Additional price must be a number" }).optional().nullable()
  ),
  available: z.boolean().default(true),
  images: z.array(imageSchema).min(1, "Each variant must have at least one image."),
  priceTiers: z.array(priceTierSchema).min(1, "At least one price tier is required for each variant."),
});


const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  categoryId: z.string().min(1, "Please select a category"),
  basePrice: z.coerce.number({ required_error: "Base price is required" }).positive("Price must be positive"),
  minimumOrderQuantity: z.coerce.number({ invalid_type_error: "MOQ must be a number" }).int().min(1, "MOQ must be at least 1").default(1),
  weight: z.coerce.number({ required_error: "Weight is required" }).positive("Weight must be positive"),
  weightUnit: z.string().min(1, "Weight unit is required").max(10),
  dimensions: z.string().min(1, "Dimensions are required").max(50),
  sku: z.string().min(1, "SKU is required").max(50),
  available: z.boolean().default(true),
  specifications: z.array(productSpecificationSchema).min(1, "At least one product specification is required."),
  variants: z.array(productVariantSchema).min(1, "At least one product variant is required."),
});

type ProductFormValues = z.infer<typeof productSchema>;

const VariantCard = ({ variantIndex, removeVariant }: { variantIndex: number, removeVariant: (index: number) => void }) => {
  const { control } = useFormContext<ProductFormValues>();
  
  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({ control, name: `variants.${variantIndex}.priceTiers` });
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: `variants.${variantIndex}.images` });

  return (
    <Card className="p-4 border shadow-sm bg-muted/30 space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="destructive" size="sm" onClick={() => removeVariant(variantIndex)}><Trash2 className="mr-1 h-4 w-4" /> Remove Variant</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
        <FormField control={control} name={`variants.${variantIndex}.sku`} render={({ field }) => (<FormItem><FormLabel>Variant SKU</FormLabel><FormControl><Input placeholder="Variant SKU" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={control} name={`variants.${variantIndex}.variantName`} render={({ field }) => (<FormItem><FormLabel>Variant Name</FormLabel><FormControl><Input placeholder="e.g., Red, Small" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={control} name={`variants.${variantIndex}.basePrice`} render={({ field }) => (<FormItem><FormLabel>Base Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Overrides main price" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
      </div>
      <FormField control={control} name={`variants.${variantIndex}.available`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-2 pb-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="mb-0 font-normal">Variant Available</FormLabel></FormItem>)} />
      
      <Separator />

      {/* Images for this variant */}
      <div className="pl-2 space-y-3">
        <h4 className="font-medium text-sm mb-2 flex items-center"><ImagePlus className="mr-2 h-4 w-4" />Images for this Variant</h4>
         {imageFields.map((item, imageIndex) => (
            <Card key={item.id} className="p-3 bg-background relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`variants.${variantIndex}.images.${imageIndex}.imageUrl`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.png" {...field} />
                          </FormControl>
                          <FormDescription>Must be a direct link (URL), not a data URI.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={control} name={`variants.${variantIndex}.images.${imageIndex}.altText`} render={({ field }) => (<FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input placeholder="Descriptive alt text" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name={`variants.${variantIndex}.images.${imageIndex}.isPrimary`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-2 pt-7"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="mb-0 font-normal">Primary Image</FormLabel></FormItem>)} />
                </div>
                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage(imageIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </Card>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ imageUrl: '', altText: '', displayOrder: 0, isPrimary: imageFields.length === 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Image to Variant</Button>
      </div>

      <Separator />

      {/* Price Tiers for this variant */}
      <div className="pl-2 space-y-3">
        <h4 className="font-medium text-sm mb-2 flex items-center"><DollarSign className="mr-2 h-4 w-4" />Price Tiers for this Variant</h4>
        {tierFields.map((tier, tierIndex) => (
          <Card key={tier.id} className="p-3 bg-background relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField control={control} name={`variants.${variantIndex}.priceTiers.${tierIndex}.minQuantity`} render={({ field }) => (<FormItem><FormLabel>Min Qty</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={control} name={`variants.${variantIndex}.priceTiers.${tierIndex}.maxQuantity`} render={({ field }) => (<FormItem><FormLabel>Max Qty</FormLabel><FormControl><Input type="number" placeholder="Optional" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={control} name={`variants.${variantIndex}.priceTiers.${tierIndex}.pricePerUnit`} render={({ field }) => (<FormItem><FormLabel>Price/Unit</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeTier(tierIndex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </Card>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => appendTier({ minQuantity: 1, maxQuantity: undefined, pricePerUnit: undefined, discountPercent: undefined, isActive: true })}><PlusCircle className="mr-2 h-4 w-4" /> Add Price Tier</Button>
      </div>
    </Card>
  );
}


export default function ManageProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params.productId === 'string' ? params.productId : '';
  const isEditMode = productId !== 'new';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  const { toast } = useToast();
  const accessToken = useSelector(selectAccessToken);
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const [categories, setCategories] = useState<FetchedCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      basePrice: undefined,
      minimumOrderQuantity: 1,
      weight: undefined,
      weightUnit: "",
      dimensions: "",
      sku: "",
      available: true,
      specifications: [],
      variants: [],
    },
  });

  const fetchCategories = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingCategories(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories?isActive=true`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to fetch categories");
      setCategories(responseData.data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error fetching categories", description: error.message });
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [accessToken, toast]);

  const fetchProductData = useCallback(async (idToFetch: string) => {
    if (!accessToken) {
      toast({ variant: "destructive", title: "Auth Error", description: "Please log in." });
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${idToFetch}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to fetch product data");

      const productData = responseData.data;
      if (!productData) throw new Error("Product data not found in API response.");

      form.reset({
        name: productData.name || "",
        description: productData.description || "",
        categoryId: productData.category?.id?.toString() || "",
        basePrice: productData.basePrice ?? undefined,
        minimumOrderQuantity: productData.minimumOrderQuantity || 1,
        weight: productData.weight ?? undefined,
        weightUnit: productData.weightUnit || "",
        dimensions: productData.dimensions || "",
        sku: productData.sku || "",
        available: productData.available === undefined ? true : productData.available,
        specifications: productData.specifications?.map((spec: any) => ({
          id: spec.id,
          specName: spec.specName || '',
          specValue: spec.specValue || '',
          unit: spec.unit || '',
          displayOrder: spec.displayOrder ?? 0,
        })) || [],
        variants: productData.variants?.map((v: any) => ({
          id: v.id,
          sku: v.sku || '',
          variantName: v.variantName || '',
          basePrice: v.basePrice ?? '',
          additionalPrice: v.additionalPrice ?? '',
          available: v.available === undefined ? true : v.available,
          images: v.images?.map((img: any) => ({
              id: img.id,
              imageUrl: img.imageUrl || '',
              altText: img.altText || '',
              displayOrder: img.displayOrder ?? 0,
              isPrimary: img.isPrimary || false,
          })) || [],
          priceTiers: v.priceTiers?.map((t: any) => ({
            id: t.id,
            minQuantity: t.minQuantity,
            maxQuantity: t.maxQuantity,
            pricePerUnit: t.pricePerUnit,
            discountPercent: t.discountPercent,
            isActive: t.isActive,
          })) || [],
        })) || [],
      });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error fetching product data", description: error.message });
      router.push('/seller/dashboard/product-manager');
    } finally {
      setIsLoadingData(false);
    }
  }, [accessToken, toast, form, router]);

  useEffect(() => {
    if (accessToken) {
      fetchCategories();
      if (isEditMode) {
        fetchProductData(productId);
      } else {
        setIsLoadingData(false);
      }
    }
  }, [accessToken, isEditMode, productId, fetchCategories, fetchProductData]);

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control: form.control, name: "specifications" });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control: form.control, name: "variants" });
  
  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    if (!currentUser?.id || !accessToken) {
      toast({ variant: "destructive", title: "Error", description: "User information or authentication is missing." });
      setIsSubmitting(false);
      return;
    }

    const apiPayload = {
      id: isEditMode ? productId : undefined,
      name: values.name,
      description: values.description,
      category: values.categoryId ? { id: values.categoryId } : null,
      basePrice: values.basePrice,
      minimumOrderQuantity: values.minimumOrderQuantity,
      weight: values.weight,
      weightUnit: values.weightUnit,
      dimensions: values.dimensions,
      sku: values.sku,
      available: values.available,
      seller: { id: currentUser.id },
      specifications: values.specifications,
      variants: values.variants,
    };
    
    const cleanedPayload = JSON.parse(JSON.stringify(apiPayload, (key, value) => {
        if (value === null || value === "") return undefined;
        return value;
    }));

    const url = isEditMode ? `${API_BASE_URL}/products/${productId}` : `${API_BASE_URL}/products`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(cleanedPayload),
      });
      const responseData = await response.json();
      if (!response.ok || (responseData.statusCode && responseData.statusCode >= 400)) {
        const serverMessage = responseData.message || (responseData.errors && responseData.errors.map((e: any) => e.defaultMessage || e.message).join(', ')) || `Failed to ${isEditMode ? 'update' : 'create'} product. Status: ${response.status}`;
        throw new Error(serverMessage);
      }
      toast({ title: `Product ${isEditMode ? 'Updated' : 'Created'}!`, description: responseData.message || `Product "${values.name}" has been successfully ${isEditMode ? 'updated' : 'created'}.` });
      router.push('/seller/dashboard/product-manager');
    } catch (error: any) {
      toast({ variant: "destructive", title: `Error ${isEditMode ? 'Updating' : 'Creating'} Product`, description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading product data...</p>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/seller/dashboard/product-manager">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Product Manager</span>
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-semibold">{isEditMode ? "Edit Product" : "Add New Product"}</h1>
        </div>
      </header>
      <main className="flex-1 p-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><BookCopy className="mr-2 h-5 w-5 text-primary" />Basic Product Information</CardTitle>
                <CardDescription>{isEditMode ? "Update the core details for your product." : "Enter the core details for your new product."}</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Premium Quality Steel Pipes" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Product Description</FormLabel><FormControl><Textarea placeholder="Detailed description of your product..." className="min-h-[120px]" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="sku" render={({ field }) => (<FormItem><FormLabel>SKU (Main Product)</FormLabel><FormControl><Input placeholder="e.g., SPP-MQ-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isLoadingCategories}>
                      <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {isLoadingCategories && !categories.length ? (<SelectItem value="loading" disabled>Loading...</SelectItem>) : categories.length > 0 ? (categories.map((cat) => (<SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>))) : (<SelectItem value="no-categories" disabled>No active categories found.</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the primary category. <Link href="/seller/dashboard/category-management" className="text-xs text-primary hover:underline">Manage Categories</Link></FormDescription><FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Pricing & Quantity Card */}
            <Card className="shadow-md">
              <CardHeader><CardTitle className="font-headline flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary" />Pricing & Quantity</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (per unit)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl><FormDescription>This is the default price if no variant price is set.</FormDescription><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="minimumOrderQuantity" render={({ field }) => (<FormItem><FormLabel>Minimum Order Quantity (MOQ)</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>

            {/* Physical Details Card */}
            <Card className="shadow-md">
              <CardHeader><CardTitle className="font-headline">Physical Details</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight</FormLabel><FormControl><Input type="number" placeholder="e.g., 5.5" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="weightUnit" render={({ field }) => (<FormItem><FormLabel>Weight Unit</FormLabel><FormControl><Input placeholder="e.g., kg, g, lb" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="dimensions" render={({ field }) => (<FormItem><FormLabel>Dimensions (LxWxH unit)</FormLabel><FormControl><Input placeholder="e.g., 10x20x5 cm" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>

            {/* Availability Card */}
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
                Manage Product Specifications and Variants here. At least one of each is required.
              </AlertDescription>
            </Alert>
            
            {/* Top-level Specifications Card */}
            <Card className="shadow-md">
              <CardHeader><CardTitle className="font-headline flex items-center"><Tags className="mr-2 h-5 w-5 text-primary" />Main Product Specifications</CardTitle><CardDescription>Add key-value pairs for product specifications (e.g., Material: Steel, Voltage: 220V).</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {specFields.map((item, index) => (<Card key={item.id || index} className="p-4 border shadow-sm"><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2"><FormField control={form.control} name={`specifications.${index}.specName`} render={({ field }) => (<FormItem><FormLabel>Spec Name</FormLabel><FormControl><Input placeholder="e.g., Material" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name={`specifications.${index}.specValue`} render={({ field }) => (<FormItem><FormLabel>Spec Value</FormLabel><FormControl><Input placeholder="e.g., Steel" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name={`specifications.${index}.unit`} render={({ field }) => (<FormItem><FormLabel>Unit (Optional)</FormLabel><FormControl><Input placeholder="e.g., cm, kg" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} /></div><div className="flex justify-end"><Button type="button" variant="destructive" size="sm" onClick={() => removeSpec(index)}><Trash2 className="mr-1 h-4 w-4" /> Remove Specification</Button></div></Card>))}
                <Button type="button" variant="outline" onClick={() => appendSpec({ specName: '', specValue: '', unit: '', displayOrder: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Specification</Button>
                <FormMessage>{(form.formState.errors.specifications as any)?.message}</FormMessage>
              </CardContent>
            </Card>

            {/* Variants Card */}
            <Card className="shadow-md">
              <CardHeader><CardTitle className="font-headline flex items-center"><ListPlus className="mr-2 h-5 w-5 text-primary" />Product Variants</CardTitle><CardDescription>Define different versions of your product (e.g., by size, color). Each variant has its own SKU, images, and price tiers.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {variantFields.map((item, index) => <VariantCard key={item.id} variantIndex={index} removeVariant={removeVariant} />)}
                <Button type="button" variant="outline" onClick={() => appendVariant({ sku: '', variantName: '', basePrice: undefined, additionalPrice: undefined, available: true, priceTiers: [], images: [] })}><PlusCircle className="mr-2 h-4 w-4" /> Add Variant</Button>
                <FormMessage>{(form.formState.errors.variants as any)?.message || (form.formState.errors.variants as any)?.root?.message}</FormMessage>
              </CardContent>
            </Card>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting || isLoadingData}>
                Reset Form
              </Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[150px]" disabled={isSubmitting || isLoadingData}>
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (isEditMode ? "Update Product" : "Save Product")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </main>
    </>
  );
}

