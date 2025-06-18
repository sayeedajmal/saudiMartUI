
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
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, Boxes, FileText, PlusCircle, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuoteListItem {
  quote_id: string;
  quote_number: string;
  buyer_name: string;
  created_at: string;
  valid_until: string;
  total_amount: number;
  status: QuoteStatus;
}

export const DUMMY_QUOTES: QuoteListItem[] = [
  { quote_id: 'qt_001', quote_number: 'QT-2024-001', buyer_name: 'Industrial Buyer Ltd.', created_at: '2024-07-25', valid_until: '2024-08-25', total_amount: 5500.00, status: 'SENT' },
  { quote_id: 'qt_002', quote_number: 'QT-2024-002', buyer_name: 'Tech Solutions Inc.', created_at: '2024-07-20', valid_until: '2024-08-20', total_amount: 12050.75, status: 'ACCEPTED' },
  { quote_id: 'qt_003', quote_number: 'QT-2024-003', buyer_name: 'Bulk Goods Co.', created_at: '2024-07-15', valid_until: '2024-07-20', total_amount: 875.50, status: 'EXPIRED' },
  { quote_id: 'qt_004', quote_number: 'QT-2024-004', buyer_name: 'Innovate Group', created_at: '2024-07-28', valid_until: '2024-08-28', total_amount: 3200.00, status: 'DRAFT' },
];

export const getQuoteStatusBadgeVariant = (status: QuoteStatus) => {
  switch (status) {
    case 'SENT': return 'secondary';
    case 'ACCEPTED': return 'default'; // Green, like successful
    case 'REJECTED': case 'EXPIRED': return 'destructive';
    case 'DRAFT': default: return 'outline';
  }
};

export default function SellerQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchSellerQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken) {
      toast({ title: "Demo Mode", description: "Displaying sample quotes. Login to see your actual quotes." });
      setQuotes(DUMMY_QUOTES);
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuotes(DUMMY_QUOTES.map(q => ({ ...q, buyer_name: `${q.buyer_name} (Fetched)` })));
      toast({
        title: "Quotes Loaded (Simulated)",
        description: "Displaying quotes for the logged-in seller (simulated fetch).",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching quotes.");
      setQuotes(DUMMY_QUOTES);
      toast({ variant: "destructive", title: "Error Fetching Quotes", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    fetchSellerQuotes();
  }, [fetchSellerQuotes]);

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
              <SidebarMenuButton href="/seller/dashboard/product-manager" tooltip="Product Manager">
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
              <SidebarMenuButton href="/seller/dashboard/quotes" isActive tooltip="Manage Quotes">
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
            <h1 className="font-headline text-2xl font-semibold">Manage Quotes</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Your Quotes</CardTitle>
                <CardDescription>Create, view, and manage your price quotations to buyers.</CardDescription>
              </div>
               <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/seller/dashboard/quotes/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Quote
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading quotes...</p>
                </div>
              )}
              {!isLoading && error && (
                <p className="text-destructive text-center py-8">{error}</p>
              )}
              {!isLoading && !error && quotes.length === 0 && (
                 <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground mb-2">No quotes found.</p>
                  <p className="text-sm text-muted-foreground">
                    You haven't created any quotes yet.
                  </p>
                </div>
              )}
              {!isLoading && !error && quotes.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote #</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.quote_id}>
                        <TableCell className="font-medium">{quote.quote_number}</TableCell>
                        <TableCell>{quote.buyer_name}</TableCell>
                        <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(quote.valid_until).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">${quote.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getQuoteStatusBadgeVariant(quote.status)}
                                 className={quote.status === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                          >
                            {quote.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/seller/dashboard/quotes/${quote.quote_id}`}>
                              <Eye className="mr-1 h-3 w-3" /> View Details
                            </Link>
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
    </SidebarProvider>
  );
}

    