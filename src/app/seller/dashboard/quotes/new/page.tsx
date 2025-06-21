
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronLeft, PlusCircle, Trash2, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const DUMMY_PRODUCT_CATALOG: { id: string; name: string; sku: string; base_price: number }[] = [
  { id: 'prod_123', name: 'Premium Steel Pipes', sku: 'SPP-MQ-001', base_price: 150.00 },
  { id: 'prod_456', name: 'Organic Cotton Fabric', sku: 'OCF-HM-002', base_price: 25.50 },
  { id: 'prod_789', name: 'Advanced Circuit Board', sku: 'ACB-XYZ-003', base_price: 75.00 },
  { id: 'prod_101', name: 'Bulk Organic Coffee Beans', sku: 'BOCB-ETH-004', base_price: 120.00 },
];

const quoteItemSchema = z.object({
  product_id: z.string().min(1, "Product selection is required."),
  product_name: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  quoted_price: z.coerce.number().positive("Quoted price must be a positive number."),
});

const createQuoteSchema = z.object({
  buyer_name: z.string().min(2, "Buyer name is required."),
  quote_number: z.string().optional(),
  valid_until: z.date({ required_error: "Valid until date is required." }),
  items: z.array(quoteItemSchema).min(1, "At least one item is required in the quote."),
  notes: z.string().optional(),
});

type CreateQuoteFormValues = z.infer<typeof createQuoteSchema>;
export type QuoteItemFormValues = z.infer<typeof quoteItemSchema>;

export default function CreateNewQuotePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const accessToken = useSelector(selectAccessToken);

  const form = useForm<CreateQuoteFormValues>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      buyer_name: "",
      quote_number: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      valid_until: undefined,
      items: [],
      notes: "",
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem, update: updateItem } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const calculateTotals = () => {
    const items = form.getValues("items");
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.quoted_price), 0);
    const taxRate = 0.15;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith("items")) {
        form.trigger();
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleProductSelect = (itemIndex: number, selectedProductId: string) => {
    const product = DUMMY_PRODUCT_CATALOG.find(p => p.id === selectedProductId);
    if (product) {
      updateItem(itemIndex, {
        ...form.getValues(`items.${itemIndex}`),
        product_id: product.id,
        product_name: product.name,
        quoted_price: product.base_price,
      });
      form.trigger(`items.${itemIndex}.quoted_price`);
    }
  };

  const onSubmit = async (values: CreateQuoteFormValues) => {
    setIsSubmitting(true);
    if (!accessToken) {
      toast({ variant: "destructive", title: "Authentication Error", description: "Please log in to create a quote." });
      setIsSubmitting(false);
      return;
    }

    const finalQuoteData = {
      ...values,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: 'DRAFT',
    };

    console.log("Simulating Create Quote API call with data:", JSON.stringify(finalQuoteData, null, 2));
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Quote Created (Simulated)",
      description: `Quote ${finalQuoteData.quote_number || 'N/A'} for ${finalQuoteData.buyer_name} has been saved as a draft.`,
    });
    form.reset();
    setIsSubmitting(false);
  };
  
  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
              <Link href="/seller/dashboard/quotes">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back to Quotes</span>
              </Link>
            </Button>
            <h1 className="font-headline text-2xl font-semibold">Create New Quote</h1>
          </div>
      </header>
      <main className="flex-1 p-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Basic Quote Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="buyer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buyer Name</FormLabel>
                      <FormControl><Input placeholder="Enter buyer's company or contact name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quote_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote Number (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., QT-2024-001" {...field} /></FormControl>
                      <FormDescription>Leave blank to auto-generate or use suggested.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem className="flex flex-col md:col-span-2">
                      <FormLabel>Valid Until</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Quote Items</CardTitle>
                <CardDescription>Add products to this quotation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {itemFields.map((item, index) => (
                  <Card key={item.id} className="p-4 border shadow-sm relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_id`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Product</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProductSelect(index, value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DUMMY_PRODUCT_CATALOG.map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} (SKU: {product.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quoted_price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quoted Price (per unit)</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-2 text-sm font-medium text-right">
                      Line Total: $
                      {( (form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.quoted_price`) || 0) ).toFixed(2)}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendItem({ product_id: "", product_name: "", quantity: 1, quoted_price: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
                {form.formState.errors.items && !form.formState.errors.items.root && !Array.isArray(form.formState.errors.items) && (
                  <p className="text-sm font-medium text-destructive">
                     {form.formState.errors.items.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                  <CardTitle className="font-headline">Summary & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl><Textarea placeholder="Add any terms, conditions, or additional notes for the buyer..." {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <Separator />
                  <div className="space-y-2 text-right">
                      <div className="flex justify-between text-lg">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                          <span className="text-muted-foreground">Tax (15% Placeholder):</span>
                          <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                      </div>
                       <div className="flex justify-between text-xl font-bold text-primary">
                          <span>Grand Total:</span>
                          <span>${totalAmount.toFixed(2)}</span>
                      </div>
                  </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
                Reset Form
              </Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[150px]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Quote (Draft)"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </main>
    </>
  );
}
