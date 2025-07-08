
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
import { LayoutDashboard, ShoppingCart, Heart, MessageCircle, FileText, Bell, Settings, MapPin, Loader2, Package, Tag, ReceiptText, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { selectUser, selectAccessToken, type MyProfile } from '@/lib/redux/slices/userSlice';
import { API_BASE_URL } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';

type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface QuoteItem {
  id: string;
  product: {
    id: string;
    name: string;
  };
  variant: {
    id: string;
    variantName: string | null;
    images: {
      id: string;
      imageUrl: string;
    }[];
  };
  quantity: number;
  quotedPrice: number;
  totalPrice: number;
  discountPercent?: number;
}

interface BuyerQuote {
  id: string;
  quoteNumber: string;
  seller: {
    id: string;
    name: string;
  };
  createdAt: string;
  validUntil: string;
  totalAmount: number;
  status: QuoteStatus;
  notes?: string | null;
  subtotal: number;
  taxAmount: number;
  quoteItem: QuoteItem;
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const accessToken = useSelector(selectAccessToken);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<BuyerQuote | null>(null);

  // State for withdrawal
  const [quoteToDelete, setQuoteToDelete] = useState<BuyerQuote | null>(null);

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

  const handleViewDetails = (quote: BuyerQuote) => {
    setSelectedQuote(quote);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuote(null);
  };
  
  const confirmDelete = async () => {
    if (!quoteToDelete || !accessToken) {
        toast({ variant: "destructive", title: "Error", description: "Quote or authentication token not found." });
        return;
    }
    setIsDeleting(true);
    try {
        const response = await fetch(`${API_BASE_URL}/quotes/${quoteToDelete.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            const responseData = await response.json().catch(() => ({ message: "Failed to withdraw quote."}));
            throw new Error(responseData.message || "An unknown error occurred.");
        }
        
        toast({ title: "Quote Withdrawn", description: `Quote #${quoteToDelete.quoteNumber} has been successfully withdrawn.` });

        fetchQuotes();
    } catch (err: any) {
        toast({ variant: "destructive", title: "Withdrawal Failed", description: err.message });
    } finally {
        setIsDeleting(false);
        setQuoteToDelete(null);
    }
  };

  const renderModalContent = () => {
    if (!selectedQuote) {
      return <p className="text-destructive text-center py-12">Could not load quote details.</p>;
    }

    const item = selectedQuote.quoteItem;
    const primaryImage = item.variant?.images?.[0];

    return (
      <>
        <DialogHeader className="mb-4">
          <DialogTitle className="font-headline text-2xl">Quote #{selectedQuote.quoteNumber}</DialogTitle>
          <DialogDescription>
            From Seller: <span className="font-medium text-foreground">{selectedQuote.seller.name}</span>
            <br/>
            Status: <Badge variant={getStatusBadgeVariant(selectedQuote.status)} className={selectedQuote.status === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>{selectedQuote.status.replace(/_/g, ' ')}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <h3 className="font-semibold text-foreground flex items-center"><Package className="mr-2 h-4 w-4 text-primary" /> Item Details</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow key={item.id}>
                        <TableCell>
                          {primaryImage?.imageUrl ? (
                            <img src={primaryImage.imageUrl} alt={item.product.name} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <span className="text-muted-foreground text-sm">No Image</span>
                          )}
                        </TableCell>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.variant.variantName || 'N/A'}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.quotedPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <Separator />
            
            <h3 className="font-semibold text-foreground flex items-center"><ReceiptText className="mr-2 h-4 w-4 text-primary"/>Summary</h3>
            <div className="space-y-1 text-sm text-right w-full sm:w-1/2 ml-auto">
                <div className="flex justify-between"><span>Subtotal:</span><span>${selectedQuote.subtotal?.toFixed(2) || '0.00'}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>${selectedQuote.taxAmount?.toFixed(2) || '0.00'}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total:</span><span>${selectedQuote.totalAmount.toFixed(2)}</span></div>
            </div>

            {selectedQuote.notes && (
                <>
                    <Separator />
                    <h3 className="font-semibold text-foreground flex items-center"><Tag className="mr-2 h-4 w-4 text-primary"/>Seller Notes</h3>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{selectedQuote.notes}</p>
                </>
            )}
        </div>
        <DialogFooter className="pt-4 mt-4 border-t flex justify-end">
            <Button variant="outline" onClick={handleCloseModal}>Close</Button>
            {selectedQuote.status === 'DRAFT' && (
                <Button variant="destructive" onClick={() => { setQuoteToDelete(selectedQuote); handleCloseModal(); }} disabled={isDeleting}>
                    {isDeleting && quoteToDelete?.id === selectedQuote.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                     Withdraw Quote
                </Button>
            )}
        </DialogFooter>
      </>
    );
  };


  return (
    <>
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
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
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
                          <TableCell className="text-right">{quote.quoteItem?.quantity ?? 'N/A'}</TableCell>
                          <TableCell className="text-right">${quote.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(quote.status)}
                                  className={quote.status === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                              {quote.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(quote)}>
                              View Details
                            </Button>
                            {quote.status === 'DRAFT' && (
                               <Button variant="destructive" size="sm" onClick={() => setQuoteToDelete(quote)} disabled={isDeleting}>
                                   {isDeleting && quoteToDelete?.id === quote.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                               </Button>
                            )}
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
      
      {/* Quote Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-3xl">
          {renderModalContent()}
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Confirmation Dialog */}
      {quoteToDelete && (
        <AlertDialog open={!!quoteToDelete} onOpenChange={() => setQuoteToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to withdraw this quote?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently withdraw quote #{quoteToDelete.quoteNumber}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setQuoteToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Withdraw
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
