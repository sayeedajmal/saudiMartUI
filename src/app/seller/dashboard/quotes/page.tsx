
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, Loader2, Filter, User, Tag, ChevronDown, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken, selectUser, type MyProfile } from '@/lib/redux/slices/userSlice';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_BASE_URL } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

const ALL_QUOTE_STATUSES: QuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

export interface SellerQuote {
  id: string;
  quoteNumber: string;
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  quoteItem: {
    id: string;
    product: { id: string; name: string };
    variant: {
      id: string;
      variantName: string | null;
      images: {
        id: string;
        imageUrl: string;
        isPrimary: boolean;
      }[];
    };
    quantity: number;
    quotedPrice: number;
    totalPrice: number;
  } | null;
  status: QuoteStatus;
  validUntil: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  deliveryTerms?: string;
}

interface BuyerGroup {
  buyerId: string;
  buyerName: string;
  quotes: SellerQuote[];
}

interface PaginationInfo {
    totalPages: number;
    totalElements: number;
    isFirst: boolean;
    isLast: boolean;
    pageNumber: number;
    pageSize: number;
}

export const getQuoteStatusBadgeVariant = (status: QuoteStatus) => {
  switch (status) {
    case 'SENT': return 'secondary';
    case 'ACCEPTED': return 'default';
    case 'REJECTED': case 'EXPIRED': return 'destructive';
    case 'DRAFT': default: return 'outline';
  }
};

export default function SellerQuotesPage() {
  const [allQuotes, setAllQuotes] = useState<SellerQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [buyerFilter, setBuyerFilter] = useState('all');
  
  const [pendingStatusChanges, setPendingStatusChanges] = useState<Record<string, QuoteStatus>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    totalPages: 1,
    totalElements: 0,
    isFirst: true,
    isLast: true,
    pageNumber: 0,
    pageSize: 5,
  });

  const currentUser = useSelector(selectUser) as MyProfile | null;
  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchSellerQuotes = useCallback(async (page = 0, status = 'all', buyer = 'all') => {
    if (!currentUser?.id || !accessToken) return;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append('sellerId', currentUser.id);
    params.append('page', String(page));
    params.append('size', '5');

    if (status !== 'all') {
        params.append('status', status);
    }
    if (buyer !== 'all') {
        params.append('buyerId', buyer);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/filter?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to fetch quotes.");
      
      const quoteData = responseData.data;
      setAllQuotes(quoteData.content || []);
      
      setPaginationInfo({
        totalPages: quoteData?.totalPages || 1,
        totalElements: quoteData?.totalElements || 0,
        isFirst: quoteData?.first || true,
        isLast: quoteData?.last || true,
        pageNumber: quoteData?.number || 0,
        pageSize: quoteData?.size || 5,
      });
      setCurrentPage(quoteData?.number || 0);

    } catch (err: any) {
      setError(err.message);
      setAllQuotes([]);
      toast({ variant: "destructive", title: "Error Fetching Quotes", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, accessToken, toast]);

  useEffect(() => {
    fetchSellerQuotes(currentPage, statusFilter, buyerFilter);
  }, [fetchSellerQuotes, currentPage, statusFilter, buyerFilter]);
  
  const handleFilterChange = () => {
      setCurrentPage(0);
      fetchSellerQuotes(0, statusFilter, buyerFilter);
  }

  const uniqueBuyers = useMemo(() => {
    // This should ideally be populated from a separate endpoint for better UX with pagination
    const buyers = new Map<string, string>();
    allQuotes.forEach(quote => {
      if (!buyers.has(quote.buyer.id)) {
        buyers.set(quote.buyer.id, quote.buyer.name);
      }
    });
    return Array.from(buyers, ([id, name]) => ({ id, name }));
  }, [allQuotes]);

  const groupedAndFilteredQuotes = useMemo(() => {
    const grouped = allQuotes.reduce<Record<string, BuyerGroup>>((acc, quote) => {
      const buyerId = quote.buyer.id;
      if (!acc[buyerId]) {
        acc[buyerId] = { buyerId, buyerName: quote.buyer.name, quotes: [] };
      }
      acc[buyerId].quotes.push(quote);
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a, b) => a.buyerName.localeCompare(b.buyerName));
  }, [allQuotes]);


  const handleUpdateStatus = async (quote: SellerQuote) => {
    const newStatus = pendingStatusChanges[quote.id];
    if (!newStatus) return;

    setIsUpdating(prev => ({ ...prev, [quote.id]: true }));

    const payload = {
      ...quote,
      status: newStatus,
      buyer: { id: quote.buyer.id },
      seller: { id: quote.seller.id },
      quoteItem: quote.quoteItem ? {
        id: quote.quoteItem.id,
        product: { id: quote.quoteItem.product.id },
        variant: { id: quote.quoteItem.variant.id },
        quantity: quote.quoteItem.quantity,
        quotedPrice: quote.quoteItem.quotedPrice,
        discountPercent: 0,
        totalPrice: quote.quoteItem.totalPrice,
      } : null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${quote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to update quote.");

      toast({
        title: "Quote Updated!",
        description: `Quote #${quote.quoteNumber} status changed to ${newStatus}.`,
        action: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      setPendingStatusChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[quote.id];
        return newChanges;
      });
      fetchSellerQuotes(currentPage, statusFilter, buyerFilter);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message,
        action: <XCircle className="h-5 w-5 text-white" />,
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [quote.id]: false }));
    }
  };

  const handleNextPage = () => {
    if (!paginationInfo.isLast) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (!paginationInfo.isFirst) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="font-headline text-2xl font-semibold">Manage Quotes</h1>
      </header>
      <main className="flex-1 p-6">
        <Card className="shadow-md">
          <CardHeader className="flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <CardTitle className="font-headline">Your Quotes</CardTitle>
              <CardDescription>Review, update, and manage price quotations to buyers.</CardDescription>
            </div>
            <Button onClick={() => fetchSellerQuotes(currentPage, statusFilter, buyerFilter)} variant="outline" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/50 mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium flex items-center mb-1"><Tag className="w-4 h-4 mr-2" />Filter by Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {ALL_QUOTE_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium flex items-center mb-1"><User className="w-4 h-4 mr-2" />Filter by Buyer</label>
                <Select value={buyerFilter} onValueChange={setBuyerFilter} disabled={uniqueBuyers.length === 0}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buyers</SelectItem>
                    {uniqueBuyers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading && (<div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading quotes...</p></div>)}
            {!isLoading && error && (<p className="text-destructive text-center py-8">{error}</p>)}
            {!isLoading && !error && groupedAndFilteredQuotes.length === 0 && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-semibold">No quotes found</p>
                <p className="text-sm text-muted-foreground">No quotes match the current filters.</p>
              </div>
            )}

            {!isLoading && !error && groupedAndFilteredQuotes.length > 0 && (
              <Accordion type="multiple" className="w-full space-y-4" defaultValue={groupedAndFilteredQuotes.map(g => g.buyerId)}>
                {groupedAndFilteredQuotes.map(group => (
                  <AccordionItem key={group.buyerId} value={group.buyerId} className="border-b-0">
                    <Card className="shadow-sm">
                      <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-primary" />
                          <span className="font-headline text-lg">{group.buyerName}</span>
                          <Badge variant="secondary">{group.quotes.length} Quote(s)</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Image</TableHead>
                              <TableHead>Quote #</TableHead>
                              <TableHead>Product / Variant</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead>Current Status</TableHead>
                              <TableHead>Update Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.quotes.map(quote => {
                              const primaryImage = quote.quoteItem?.variant.images?.find(i => i.isPrimary) || quote.quoteItem?.variant.images?.[0];
                              return (
                              <TableRow key={quote.id}>
                                <TableCell>
                                  <Avatar className="h-12 w-12 rounded-md">
                                    <AvatarImage src={primaryImage?.imageUrl} alt={quote.quoteItem?.product.name} className="object-cover" />
                                    <AvatarFallback className="rounded-md bg-muted">
                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                                <TableCell>
                                    {quote.quoteItem ? (
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate max-w-[200px]" title={quote.quoteItem.product.name}>
                                                {quote.quoteItem.product.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {quote.quoteItem.variant.variantName || 'Default'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">${quote.totalAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge variant={getQuoteStatusBadgeVariant(quote.status)} className={quote.status === 'ACCEPTED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                                    {quote.status.replace(/_/g, ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    defaultValue={quote.status}
                                    onValueChange={(newStatus: QuoteStatus) => setPendingStatusChanges(prev => ({ ...prev, [quote.id]: newStatus }))}
                                  >
                                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {ALL_QUOTE_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pendingStatusChanges[quote.id] || isUpdating[quote.id] || pendingStatusChanges[quote.id] === quote.status}
                                    onClick={() => handleUpdateStatus(quote)}
                                    className="bg-accent text-accent-foreground hover:bg-accent/80"
                                  >
                                    {isUpdating[quote.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )})}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
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
    </>
  );
}
