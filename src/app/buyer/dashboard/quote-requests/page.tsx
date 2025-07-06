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
import { LayoutDashboard, ShoppingCart, Heart, MessageCircle, FileText, Bell, Settings, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { selectUser, selectAccessToken, type MyProfile } from '@/lib/redux/slices/userSlice';
import { API_BASE_URL } from '@/lib/api';

type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface BuyerQuote {
  id: string;
  quoteNumber: string;
  seller: {
    name: string;
  };
  createdAt: string;
  validUntil: string;
  totalAmount: number;
  status: QuoteStatus;
}

const getStatusBadgeVariant = (status: QuoteStatus) => {
  switch (status) {
    case 'SENT': return 'secondary';
    case 'ACCEPTED': return 'default';
    case 'REJECTED': case 'EXPIRED': return 'destructive';
    case 'DRAFT': default: return 'outline';
  }
};

export default function BuyerQuoteRequestsPage() {
  const [quotes, setQuotes] = useState<BuyerQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const accessToken = useSelector(selectAccessToken);

  const fetchQuotes = useCallback(async () => {
    if (!currentUser || !accessToken) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/buyer/${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to fetch your quotes.");
      }
      setQuotes(responseData.data.content || []);
    } catch (err: any) {
      setError(err.message);
      setQuotes([]);
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, accessToken, toast]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

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
                <SidebarMenuButton href="/buyer/dashboard" tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="My Orders">
                  <ShoppingCart />
                  <span>My Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Saved Products">
                  <Heart />
                  <span>Saved Products</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/buyer/dashboard/my-enquiries" tooltip="My Enquiries">
                  <MessageCircle />
                  <span>My Enquiries</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/buyer/dashboard/quote-requests" isActive tooltip="Quote Requests">
                  <FileText />
                  <span>Quote Requests</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/buyer/dashboard/addresses" tooltip="My Addresses">
                  <MapPin />
                  <span>My Addresses</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/buyer/dashboard/notifications" tooltip="Notifications">
                  <Bell />
                  <span>Notifications</span>
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
            <h1 className="font-headline text-2xl font-semibold">My Quote Requests</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Your Quotes</CardTitle>
              <CardDescription>Track the status of quotes you have requested or received.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading your quotes...</p>
                </div>
              ) : error ? (
                <p className="text-destructive text-center py-8">{error}</p>
              ) : quotes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote #</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                        <TableCell>{quote.seller.name}</TableCell>
                        <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>${quote.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(quote.status)}
                                 className={quote.status === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                            {quote.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`#`}>View Details</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground">No quotes found.</p>
                    <p className="text-sm text-muted-foreground mt-2">You have not requested any quotes yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
