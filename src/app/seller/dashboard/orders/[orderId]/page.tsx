
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronLeft, Loader2, User, Receipt, Edit2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import type { OrderStatus } from '../page';

interface OrderItem {
  order_item_id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  sku: string;
}

interface OrderAddress {
  street_address_1: string;
  street_address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  company_name?: string;
}

export interface SellerOrderDetail {
  order_id: string;
  order_number: string;
  buyer_id: string;
  buyer_name: string;
  created_at: string;
  status: OrderStatus;
  shipping_address: OrderAddress;
  billing_address: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_price: number;
  notes?: string;
  payment_method?: string;
  purchase_order_number?: string;
}

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING_APPROVAL': case 'PROCESSING': return 'secondary'; 
    case 'SHIPPED': case 'APPROVED': return 'default'; 
    case 'DELIVERED': return 'default'; 
    case 'CANCELLED': case 'REJECTED': return 'destructive'; 
    case 'DRAFT': default: return 'outline'; 
  }
};

const ALL_ORDER_STATUSES: OrderStatus[] = ['PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REJECTED'];

const generateDummyOrderDetail = (orderId: string): SellerOrderDetail | undefined => {
  if (orderId === 'ord_001') {
    return {
      order_id: 'ord_001', order_number: 'SO-2024-001', buyer_id: 'buyer_abc', buyer_name: 'Global Buyer Corp (Fetched)',
      created_at: '2024-07-28T10:30:00Z', status: 'PROCESSING',
      shipping_address: { street_address_1: '123 Main St', city: 'Riyadh', state: 'Riyadh Province', postal_code: '12345', country: 'Saudi Arabia', company_name: 'Global Buyer Corp' },
      billing_address: { street_address_1: '123 Main St', city: 'Riyadh', state: 'Riyadh Province', postal_code: '12345', country: 'Saudi Arabia', company_name: 'Global Buyer Corp' },
      items: [
        { order_item_id: 'item_001a', product_id: 'prod_123', product_name: 'Premium Steel Pipes', sku: 'SPP-MQ-001', quantity: 10, price_per_unit: 100, total_price: 1000 },
        { order_item_id: 'item_001b', product_id: 'prod_456', product_name: 'Organic Cotton Fabric', sku: 'OCF-HM-002', variant_name: 'Blue', quantity: 5, price_per_unit: 50.15, total_price: 250.75 },
      ],
      subtotal: 1250.75, shipping_cost: 50, tax_amount: 62.54, total_price: 1363.29,
      notes: 'Please ensure fragile items are handled with care.', payment_method: 'BANK_TRANSFER', purchase_order_number: 'PO-GB-001',
    };
  }
  if (orderId === 'ord_002') {
     return {
      order_id: 'ord_002', order_number: 'SO-2024-002', buyer_id: 'buyer_def', buyer_name: 'Tech Solutions Ltd (Fetched)',
      created_at: '2024-07-27T14:00:00Z', status: 'SHIPPED',
      shipping_address: { street_address_1: '456 Tech Park', city: 'Jeddah', state: 'Makkah Province', postal_code: '67890', country: 'Saudi Arabia' },
      billing_address: { street_address_1: '456 Tech Park', city: 'Jeddah', state: 'Makkah Province', postal_code: '67890', country: 'Saudi Arabia' },
      items: [
        { order_item_id: 'item_002a', product_id: 'prod_789', product_name: 'Advanced Circuit Board', sku: 'ACB-XYZ-003', quantity: 20, price_per_unit: 42.50, total_price: 850 },
      ],
      subtotal: 850, shipping_cost: 30, tax_amount: 0, total_price: 880,
    };
  }
  return undefined; 
};

export default function SellerOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.orderId === 'string' ? params.orderId : '';
  
  const [order, setOrder] = useState<SellerOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) {
      setError("Order ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    if (!accessToken) {
      toast({ title: "Demo Mode", description: "Displaying sample order. Login to see actual order details." });
      const dummyOrder = generateDummyOrderDetail(orderId);
      if (dummyOrder) {
        setOrder(dummyOrder);
        setSelectedStatus(dummyOrder.status);
      } else {
        setError("Order not found in dummy data.");
        toast({ variant: "destructive", title: "Error", description: `Demo order ${orderId} not found.` });
      }
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      const fetchedOrder = generateDummyOrderDetail(orderId);

      if (fetchedOrder) {
        setOrder(fetchedOrder);
        setSelectedStatus(fetchedOrder.status);
        toast({ title: "Order Details Loaded (Simulated)", description: `Details for order ${fetchedOrder.order_number} loaded.` });
      } else {
        throw new Error("Order not found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch order details.");
      toast({ variant: "destructive", title: "Error Fetching Order", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [orderId, accessToken, toast]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleUpdateStatus = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) {
      toast({ title: "No Change", description: "Status is already set or no new status selected.", variant: "default"});
      return;
    }
    setIsUpdatingStatus(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 700)); 
      setOrder(prevOrder => prevOrder ? { ...prevOrder, status: selectedStatus } : null);
      toast({ title: "Status Updated (Simulated)", description: `Order ${order.order_number} status changed to ${selectedStatus.replace(/_/g, ' ')}.`});
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to Update Status", description: err.message });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Error Loading Order</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild variant="outline">
          <Link href="/seller/dashboard/orders">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
       <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested order could not be found.</p>
        <Button asChild variant="outline">
          <Link href="/seller/dashboard/orders">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const currentStatusBadgeVariant = getStatusBadgeVariant(order.status);
  const currentStatusClassName = 
    order.status === 'DELIVERED' ? 'bg-green-500 hover:bg-green-600 text-white' : 
    order.status === 'SHIPPED' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
    order.status === 'PENDING_APPROVAL' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
    order.status === 'PROCESSING' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
    '';

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <SidebarTrigger className="lg:hidden" />
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link href="/seller/dashboard/orders">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Orders</span>
          </Link>
        </Button>
        <h1 className="font-headline text-xl md:text-2xl font-semibold">Order Details</h1>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <CardTitle className="font-headline text-2xl">Order #{order.order_number}</CardTitle>
              <CardDescription>
                Placed on: {new Date(order.created_at).toLocaleDateString()} by {order.buyer_name}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-sm text-muted-foreground">Status:</span>
               <Badge variant={currentStatusBadgeVariant} className={currentStatusClassName}>
                  {order.status.replace(/_/g, ' ')}
               </Badge>
            </div>
          </CardHeader>
           {order.purchase_order_number && (
              <CardContent className="pt-0 pb-2">
                  <p className="text-sm text-muted-foreground">PO Number: <span className="font-medium text-foreground">{order.purchase_order_number}</span></p>
              </CardContent>
          )}
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><Receipt className="mr-2 h-5 w-5 text-primary"/>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(item => (
                    <TableRow key={item.order_item_id}>
                      <TableCell>
                        <div>{item.product_name}</div>
                        {item.variant_name && <div className="text-xs text-muted-foreground">{item.variant_name}</div>}
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price_per_unit.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.total_price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="space-y-1 text-sm text-right">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span className="font-medium">${order.shipping_cost.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-medium">${order.tax_amount.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between text-base font-semibold">
                      <span>Grand Total:</span>
                      <span>${order.total_price.toFixed(2)}</span>
                  </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 md:col-span-1">
              <Card className="shadow-md">
                  <CardHeader>
                      <CardTitle className="font-headline text-lg flex items-center"><Edit2 className="mr-2 h-5 w-5 text-primary"/>Update Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      <Select value={selectedStatus} onValueChange={(value: OrderStatus) => setSelectedStatus(value)}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                              {ALL_ORDER_STATUSES.map(statusValue => (
                              <SelectItem key={statusValue} value={statusValue}>
                                  {statusValue.replace(/_/g, ' ')}
                              </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <Button 
                          onClick={handleUpdateStatus} 
                          disabled={isUpdatingStatus || !selectedStatus || selectedStatus === order.status}
                          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                          {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Update Status
                      </Button>
                  </CardContent>
              </Card>
              <Card className="shadow-md">
                  <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>Buyer & Shipping</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                      <div>
                          <h4 className="font-semibold mb-0.5">Shipping Address:</h4>
                          {order.shipping_address.company_name && <p className="text-muted-foreground">{order.shipping_address.company_name}</p>}
                          <p className="text-muted-foreground">{order.shipping_address.street_address_1}</p>
                          {order.shipping_address.street_address_2 && <p className="text-muted-foreground">{order.shipping_address.street_address_2}</p>}
                          <p className="text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                          <p className="text-muted-foreground">{order.shipping_address.country}</p>
                      </div>
                      <Separator />
                       <div>
                          <h4 className="font-semibold mb-0.5">Billing Address:</h4>
                           {order.billing_address.company_name && <p className="text-muted-foreground">{order.billing_address.company_name}</p>}
                          <p className="text-muted-foreground">{order.billing_address.street_address_1}</p>
                          {order.billing_address.street_address_2 && <p className="text-muted-foreground">{order.billing_address.street_address_2}</p>}
                          <p className="text-muted-foreground">{order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}</p>
                          <p className="text-muted-foreground">{order.billing_address.country}</p>
                      </div>
                       {order.payment_method && (
                          <>
                              <Separator />
                              <div>
                                  <h4 className="font-semibold mb-0.5">Payment Method:</h4>
                                  <p className="text-muted-foreground">{order.payment_method.replace(/_/g, ' ')}</p>
                              </div>
                          </>
                       )}
                  </CardContent>
              </Card>
              {order.notes && (
                  <Card className="shadow-md">
                      <CardHeader>
                          <CardTitle className="font-headline text-lg">Order Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
                      </CardContent>
                  </Card>
              )}
          </div>
        </div>
      </main>
    </>
  );
}
