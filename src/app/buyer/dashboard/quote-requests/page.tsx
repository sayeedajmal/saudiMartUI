
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { LayoutDashboard, ShoppingCart, Heart, MessageCircle, FileText, Bell, Settings, MapPin, Loader2, Package, Tag, ReceiptText, Trash2, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

const ALL_QUOTE_STATUSES: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
const STATUS_ORDER: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

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

interface PaginationInfo {
    totalPages: number;
    totalElements: number;
    isFirst: boolean;
    isLast: boolean;
    pageNumber: number;
    pageSize: number;
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

  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    totalPages: 1, totalElements: 0, isFirst: true, isLast: true, pageNumber: 0, pageSize: 10,
  });

  const { toast } = useToast();
  const currentUser = useSelector(selectUser) as MyProfile | null;
  const accessToken = useSelector(selectAccessToken);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<BuyerQuote | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<BuyerQuote | null>(null);

  const fetchQuotes = useCallback(async (page = 0, status: string = 'all') => {
    if (!currentUser || !accessToken) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('buyerId', currentUser.id);
      params.append('page', String(page));
      params.append('size', '10');

      if (status !== 'all') {
        params.append('status', status);
      }
      
      const response = await fetch(`${API_BASE_URL}/quotes/filter?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to fetch your quotes.");
      }

      const quoteData = responseData.data;
      setQuotes(quoteData?.content?.map((c: any) => c.quote) || []);
      setPaginationInfo({
        totalPages: quoteData?.totalPages || 1,
        totalElements: quoteData?.totalElements || 0,
        isFirst: quoteData?.first || true,
        isLast: quoteData?.last || true,
        pageNumber: quoteData?.number || 0,
        pageSize: quoteData?.size || 10,
      });

    } catch (err: any) {
      setError(err.message);
      setQuotes([]);
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, accessToken, toast]);

  const groupedQuotes = useMemo(() => {
    const groups = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = [];
        return acc;
    }, {} as Record<QuoteStatus, BuyerQuote[]>);

    for (const quote of quotes) {
        if (quote && quote.status && groups[quote.status]) {
            groups[quote.status].push(quote);
        }
    }
    return groups;
  }, [quotes]);

  useEffect(() => {
    fetchQuotes(currentPage, statusFilter);
  }, [fetchQuotes, currentPage, statusFilter]);
  
  const handleRefresh = () => {
      setCurrentPage(0);
      fetchQuotes(0, statusFilter);
  };

  const handleStatusFilterChange = (value: string) => {
      setCurrentPage(0);
      setStatusFilter(value as 'all' | QuoteStatus);
  };

  const handleNextPage = () => !paginationInfo.isLast && setCurrentPage(currentPage + 1);
  const handlePrevPage = () => !paginationInfo.isFirst && setCurrentPage(currentPage - 1);

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

        fetchQuotes(currentPage, statusFilter);
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle className="font-headline">Your Quotes</CardTitle>
                        <CardDescription>Track the status of quotes you have requested or received.</CardDescription>
                    </div>
                    <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading} className="mt-2 sm:mt-0 bg-accent text-accent-foreground hover:bg-accent/90">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50 mb-6 flex items-center gap-4">
                  <div className="flex-1">
                      <label className="text-sm font-medium flex items-center mb-1"><Filter className="w-4 h-4 mr-2" />Filter by Status</label>
                      <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              {ALL_QUOTE_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading your quotes...</p>
                  </div>
                ) : error ? (
                  <p className="text-destructive text-center py-8">{error}</p>
                ) : quotes.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-4" defaultValue={['DRAFT', 'SENT', 'ACCEPTED']}>
                        {STATUS_ORDER.map(status => {
                            const group = groupedQuotes[status];
                            if (!group || group.length === 0) return null;

                            const statusName = status.replace(/_/g, ' ');
                            const statusBadgeVariant = getStatusBadgeVariant(status);
                            const statusClassName = status === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 text-white' : '';

                            return (
                                <AccordionItem key={status} value={status} className="border-b-0">
                                    <Card className="shadow-sm">
                                        <AccordionTrigger className="p-4 hover:no-underline rounded-t-lg data-[state=open]:bg-muted/80">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={statusBadgeVariant} className={statusClassName}>{statusName}</Badge>
                                                <span className="font-headline text-lg">{statusName} Quotes</span>
                                                <span className="text-sm text-muted-foreground">({group.length} item{group.length !== 1 ? 's' : ''})</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Quote #</TableHead>
                                                        <TableHead>Seller</TableHead>
                                                        <TableHead>Created</TableHead>
                                                        <TableHead className="text-right">Quantity</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.map((quote) => (
                                                        <TableRow key={quote.id}>
                                                            <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                                                            <TableCell>{quote.seller.name}</TableCell>
                                                            <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                                                            <TableCell className="text-right">{quote.quoteItem?.quantity ?? 'N/A'}</TableCell>
                                                            <TableCell className="text-right">${quote.totalAmount.toFixed(2)}</TableCell>
                                                            <TableCell className="text-right space-x-2">
                                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(quote)}>View Details</Button>
                                                                {quote.status === 'DRAFT' && (
                                                                    <Button variant="destructive" size="sm" onClick={() => setQuoteToDelete(quote)} disabled={isDeleting}>
                                                                        {isDeleting && quoteToDelete?.id === quote.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null} Withdraw
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </AccordionContent>
                                    </Card>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                ) : (
                  <div className="text-center py-10">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-xl font-semibold text-muted-foreground">No quotes found.</p>
                      <p className="text-sm text-muted-foreground mt-2">No quotes match your current filter.</p>
                  </div>
                )}
              </CardContent>
              {paginationInfo.totalPages > 1 && (
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
