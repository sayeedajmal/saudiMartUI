
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

interface BuyerQuote {
  id: string;
  quoteNumber: string;
  seller: {
    id?: string; // Optional for list view
    name: string;
  };
  createdAt: string;
  validUntil: string;
  totalAmount: number;
  status: QuoteStatus;
  notes?: string | null;
  subtotal?: number;
  taxAmount?: number;
}

// Type for the detailed quote item response
interface QuoteItemDetail {
  id: string; // quote item id
  quote: BuyerQuote;
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

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteDetails, setSelectedQuoteDetails] = useState<QuoteItemDetail[] | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // State for withdrawal
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [itemToWithdraw, setItemToWithdraw] = useState<QuoteItemDetail | null>(null);

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

  const handleViewDetails = async (quote: BuyerQuote) => {
    setIsModalOpen(true);
    setIsFetchingDetails(true);
    setSelectedQuoteDetails(null);
    if (!accessToken) {
        toast({ variant: "destructive", title: "Error", description: "Authentication token not found." });
        setIsFetchingDetails(false);
        return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/quoteitems/quote`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ id: quote.id})
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to fetch quote details.");
      }

      // Handle both array and single object responses for safety
      const details = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
      setSelectedQuoteDetails(details);

    } catch(err: any) {
      toast({ variant: "destructive", title: "Error Fetching Details", description: err.message });
      // Don't close modal on error, show error inside
    } finally {
      setIsFetchingDetails(false);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuoteDetails(null);
  };
  
  const handleWithdrawClick = (item: QuoteItemDetail) => {
    setItemToWithdraw(item);
  };

  const confirmWithdraw = async () => {
    if (!itemToWithdraw || !accessToken) {
        toast({ variant: "destructive", title: "Error", description: "Quote item or authentication token not found." });
        return;
    }
    setIsWithdrawing(true);
    try {
        const response = await fetch(`${API_BASE_URL}/quoteitems/${itemToWithdraw.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            const responseData = await response.json().catch(() => ({ message: "Failed to withdraw quote."}));
            throw new Error(responseData.message || "An unknown error occurred.");
        }
        
        toast({ title: "Quote Withdrawn", description: `Quote #${itemToWithdraw.quote.quoteNumber} has been successfully withdrawn.` });

        setIsModalOpen(false);
        fetchQuotes();
    } catch (err: any) {
        toast({ variant: "destructive", title: "Withdrawal Failed", description: err.message });
    } finally {
        setIsWithdrawing(false);
        setItemToWithdraw(null);
    }
  };

  const renderModalContent = () => {
    if (isFetchingDetails) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading details...</p>
        </div>
      );
    }

    if (!selectedQuoteDetails || selectedQuoteDetails.length === 0) {
      return <p className="text-destructive text-center py-12">Could not load quote details.</p>;
    }

    const quoteInfo = selectedQuoteDetails[0].quote;

    return (
      <>
        <DialogHeader className="mb-4">
          <DialogTitle className="font-headline text-2xl">Quote #{quoteInfo.quoteNumber}</DialogTitle>
          <DialogDescription>
            From Seller: <span className="font-medium text-foreground">{quoteInfo.seller.name}</span>
            <br/>
            Status: <Badge variant={getStatusBadgeVariant(quoteInfo.status)} className={quoteInfo.status === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>{quoteInfo.status.replace(/_/g, ' ')}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <h3 className="font-semibold text-foreground flex items-center"><Package className="mr-2 h-4 w-4 text-primary" /> Items</h3>
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
                    {selectedQuoteDetails.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>
                              {item.variant.images && item.variant.images.length > 0 ? (
                                <img src={item.variant.images[0].imageUrl} alt={item.product.name} className="w-10 h-10 object-cover rounded" />
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
                    ))}
                </TableBody>
            </Table>

            <Separator />
            
            <h3 className="font-semibold text-foreground flex items-center"><ReceiptText className="mr-2 h-4 w-4 text-primary"/>Summary</h3>
            <div className="space-y-1 text-sm text-right w-full sm:w-1/2 ml-auto">
                <div className="flex justify-between"><span>Subtotal:</span><span>${quoteInfo.subtotal?.toFixed(2) || '0.00'}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>${quoteInfo.taxAmount?.toFixed(2) || '0.00'}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total:</span><span>${quoteInfo.totalAmount.toFixed(2)}</span></div>
            </div>

            {quoteInfo.notes && (
                <>
                    <Separator />
                    <h3 className="font-semibold text-foreground flex items-center"><Tag className="mr-2 h-4 w-4 text-primary"/>Seller Notes</h3>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{quoteInfo.notes}</p>
                </>
            )}
        </div>
        <DialogFooter className="pt-4 mt-4 border-t flex-col-reverse sm:flex-row sm:justify-between sm:items-center">
            {quoteInfo.status === 'DRAFT' ? (
                <Button variant="destructive" onClick={() => handleWithdrawClick(selectedQuoteDetails[0])} disabled={isWithdrawing}>
                    <Trash2 className="mr-2 h-4 w-4" /> Withdraw Quote
                </Button>
            ) : (
                <div></div> // Placeholder to keep Close button on the right
            )}
            <Button variant="outline" onClick={handleCloseModal}>Close</Button>
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
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(quote)}>
                              View Details
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
      
      {/* Quote Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          {renderModalContent()}
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Confirmation Dialog */}
      {itemToWithdraw && (
        <AlertDialog open={!!itemToWithdraw} onOpenChange={() => setItemToWithdraw(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to withdraw this quote?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently withdraw quote #{itemToWithdraw.quote.quoteNumber}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToWithdraw(null)} disabled={isWithdrawing}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmWithdraw} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isWithdrawing}>
                {isWithdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Withdraw
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
