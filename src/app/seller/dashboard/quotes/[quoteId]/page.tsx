
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, Boxes, ChevronLeft, Loader2, User, Receipt, FileText, FileEdit, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import { DUMMY_QUOTES, type QuoteListItem, type QuoteStatus, getQuoteStatusBadgeVariant } from '../page'; // Import from parent page

interface QuoteItemDetail {
  product_id: string;
  product_name: string;
  quantity: number;
  quoted_price: number;
  line_total: number; // Calculated: quantity * quoted_price
}

export interface SellerQuoteDetail extends QuoteListItem {
  items: QuoteItemDetail[];
  notes?: string;
  // Subtotal, Tax, and Grand Total are already on QuoteListItem as total_amount (which is grand total)
  // We'll derive subtotal and tax for display
}

// Dummy item data for quote details
const DUMMY_QUOTE_ITEMS_CATALOG: { [key: string]: QuoteItemDetail[] } = {
  'qt_001': [
    { product_id: 'prod_123', product_name: 'Premium Steel Pipes', quantity: 50, quoted_price: 100, line_total: 5000 },
    { product_id: 'prod_456', product_name: 'Organic Cotton Fabric (Special)', quantity: 20, quoted_price: 25, line_total: 500 },
  ],
  'qt_002': [
    { product_id: 'prod_789', product_name: 'Advanced Circuit Board X100', quantity: 100, quoted_price: 100, line_total: 10000 },
    { product_id: 'prod_101', product_name: 'Bulk Organic Coffee Beans - Grade A', quantity: 50, quoted_price: 41.015, line_total: 2050.75 },
  ],
  'qt_003': [
    { product_id: 'prod_123', product_name: 'Standard Steel Fittings', quantity: 10, quoted_price: 87.55, line_total: 875.50 },
  ],
  'qt_004': [
    { product_id: 'prod_456', product_name: 'Industrial Fabric Rolls - Heavy Duty', quantity: 100, quoted_price: 32, line_total: 3200 },
  ],
};


const generateDummyQuoteDetail = (quoteId: string): SellerQuoteDetail | undefined => {
  const baseQuote = DUMMY_QUOTES.find(q => q.quote_id === quoteId);
  if (!baseQuote) return undefined;

  return {
    ...baseQuote,
    items: DUMMY_QUOTE_ITEMS_CATALOG[quoteId] || [{ product_id: 'prod_sample', product_name: 'Sample Product', quantity: 1, quoted_price: baseQuote.total_amount, line_total: baseQuote.total_amount }],
    notes: baseQuote.status === 'DRAFT' ? "This is a draft quote. Please review pricing and terms." : "Standard terms and conditions apply. Payment due upon receipt for accepted quotes.",
  };
};

const TAX_RATE = 0.15; // Example 15% tax rate

export default function SellerQuoteDetailPage() {
  const params = useParams();
  const quoteId = typeof params.quoteId === 'string' ? params.quoteId : '';
  
  const [quote, setQuote] = useState<SellerQuoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchQuoteDetail = useCallback(async () => {
    if (!quoteId) {
      setError("Quote ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700)); 

    if (!accessToken) {
      toast({ title: "Demo Mode", description: "Displaying sample quote. Login to see actual quote details." });
    }
    
    const fetchedQuote = generateDummyQuoteDetail(quoteId);

    if (fetchedQuote) {
      setQuote(fetchedQuote);
      toast({ title: "Quote Details Loaded (Simulated)", description: `Details for quote ${fetchedQuote.quote_number} loaded.` });
    } else {
      setError(`Quote with ID ${quoteId} not found.`);
      toast({ variant: "destructive", title: "Error", description: `Demo quote ${quoteId} not found.` });
    }
    setIsLoading(false);
  }, [quoteId, accessToken, toast]);

  useEffect(() => {
    fetchQuoteDetail();
  }, [fetchQuoteDetail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]"> {/* Adjust height for layout */}
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading quote details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <SidebarProvider> <Sidebar /> {/* Provide context for sidebar if needed on error page */}
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 py-4">
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <Link href="/seller/dashboard/quotes"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back</span></Link>
            </Button>
            <h1 className="font-headline text-xl md:text-2xl font-semibold">Error</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
            <Card className="shadow-md">
                <CardHeader><CardTitle className="text-destructive">Error Loading Quote</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{error}</p></CardContent>
            </Card>
        </main>
      </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!quote) {
    return (
      <SidebarProvider> <Sidebar />
      <SidebarInset>
         <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 py-4">
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <Link href="/seller/dashboard/quotes"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back</span></Link>
            </Button>
            <h1 className="font-headline text-xl md:text-2xl font-semibold">Quote Not Found</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
            <Card className="shadow-md">
                <CardHeader><CardTitle>Quote Not Found</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">The requested quote could not be found.</p></CardContent>
            </Card>
        </main>
      </SidebarInset>
      </SidebarProvider>
    );
  }
  
  const subtotal = quote.items.reduce((sum, item) => sum + item.line_total, 0);
  const taxAmount = subtotal * TAX_RATE;
  const grandTotal = subtotal + taxAmount; // Should match quote.total_amount if calculated same way

  const statusBadgeVariant = getQuoteStatusBadgeVariant(quote.status);
  const statusClassName = quote.status === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 text-white' : '';


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
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/product-manager" tooltip="Product Manager"><Package /><span>Product Manager</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/inventory" tooltip="Inventory Management"><Boxes /><span>Inventory</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/orders" tooltip="Manage Orders"><ShoppingBag /><span>Manage Orders</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/enquiries" tooltip="Manage Enquiries"><MessageSquare /><span>Manage Enquiries</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton href="/seller/dashboard/quotes" isActive tooltip="Manage Quotes"><FileText /><span>Manage Quotes</span></SidebarMenuButton></SidebarMenuItem>
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
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/seller/dashboard/quotes">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Quotes</span>
            </Link>
          </Button>
          <h1 className="font-headline text-xl md:text-2xl font-semibold truncate">Quote Details: {quote.quote_number}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div>
                <CardTitle className="font-headline text-2xl">Quote #{quote.quote_number}</CardTitle>
                <CardDescription className="mt-1">
                  Buyer: <span className="font-medium text-foreground">{quote.buyer_name}</span>
                  <br />
                  Created: {new Date(quote.created_at).toLocaleDateString()} | Valid Until: {new Date(quote.valid_until).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={statusBadgeVariant} className={statusClassName}>
                        {quote.status.replace(/_/g, ' ')}
                    </Badge>
                </div>
                {/* Placeholder for future actions like "Edit Quote", "Send Quote", "Mark as Accepted" */}
                {quote.status === 'DRAFT' && (
                    <Button size="sm" variant="outline" className="bg-accent text-accent-foreground hover:bg-accent/80">
                        <FileEdit className="mr-2 h-4 w-4" /> Edit Quote (NI)
                    </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><Tag className="mr-2 h-5 w-5 text-primary"/>Quoted Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Quoted Price/Unit</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.quoted_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.line_total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="space-y-1 text-sm text-right">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({TAX_RATE * 100}%):</span>
                      <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between text-base font-semibold text-primary pt-1 border-t mt-1">
                      <span>Grand Total:</span>
                      <span>${grandTotal.toFixed(2)}</span>
                  </div>
              </div>
            </CardContent>
          </Card>

          {quote.notes && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    