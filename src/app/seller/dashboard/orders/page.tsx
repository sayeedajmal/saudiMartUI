
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Eye, Loader2, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';

export type OrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface SellerOrderListItem {
  order_id: string;
  order_number: string;
  buyer_name: string;
  created_at: string;
  total_price: number;
  status: OrderStatus;
}

const DUMMY_ORDERS: SellerOrderListItem[] = [
  { order_id: 'ord_001', order_number: 'SO-2024-001', buyer_name: 'Global Buyer Corp', created_at: '2024-07-28', total_price: 1250.75, status: 'PROCESSING' },
  { order_id: 'ord_002', order_number: 'SO-2024-002', buyer_name: 'Tech Solutions Ltd', created_at: '2024-07-27', total_price: 850.00, status: 'SHIPPED' },
  { order_id: 'ord_003', order_number: 'SO-2024-003', buyer_name: 'Retail Goods Inc.', created_at: '2024-07-26', total_price: 340.50, status: 'DELIVERED' },
  { order_id: 'ord_004', order_number: 'SO-2024-004', buyer_name: 'New Age Importers', created_at: '2024-07-29', total_price: 2500.00, status: 'PENDING_APPROVAL' },
  { order_id: 'ord_005', order_number: 'SO-2024-005', buyer_name: 'Cancelled Orders Co.', created_at: '2024-07-25', total_price: 500.00, status: 'CANCELLED' },
];

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING_APPROVAL':
    case 'PROCESSING':
      return 'secondary'; 
    case 'SHIPPED':
    case 'APPROVED':
      return 'default'; 
    case 'DELIVERED':
      return 'default'; 
    case 'CANCELLED':
    case 'REJECTED':
      return 'destructive'; 
    case 'DRAFT':
    default:
      return 'outline'; 
  }
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const accessToken = useSelector(selectAccessToken);
  const { toast } = useToast();

  const fetchSellerOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!accessToken) {
      toast({ title: "Demo Mode", description: "Displaying sample orders. Login to see your actual orders." });
      setOrders(DUMMY_ORDERS);
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      setOrders(DUMMY_ORDERS.map(o => ({...o, buyer_name: `${o.buyer_name} (Fetched)`})));
      toast({
        title: "Orders Loaded (Simulated)",
        description: "Displaying orders for the logged-in seller (simulated fetch).",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching orders.");
      setOrders(DUMMY_ORDERS);
      toast({ variant: "destructive", title: "Error Fetching Orders", description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="lg:hidden" />
          <h1 className="font-headline text-2xl font-semibold">Manage Orders</h1>
      </header>
      <main className="flex-1 p-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Your Orders</CardTitle>
            <CardDescription>View and manage incoming orders from buyers.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading orders...</p>
              </div>
            )}
            {!isLoading && error && (
              <p className="text-destructive text-center py-8">{error}</p>
            )}
            {!isLoading && !error && orders.length === 0 && (
               <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground mb-2">No orders found.</p>
                <p className="text-sm text-muted-foreground">
                  You currently have no orders to display.
                </p>
              </div>
            )}
            {!isLoading && !error && orders.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.buyer_name}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${order.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}
                               className={
                                  order.status === 'DELIVERED' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                                  order.status === 'SHIPPED' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                  order.status === 'PENDING_APPROVAL' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                                  order.status === 'PROCESSING' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                  ''
                               }
                        >
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/seller/dashboard/orders/${order.order_id}`}>
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
    </>
  );
}
