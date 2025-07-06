'use client';

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
import { LayoutDashboard, ShoppingCart, Heart, MessageCircle, FileText, Bell, Settings, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const dummyNotifications = [
  { id: "notif1", title: "New Quote Received", message: "Seller 'Reliable Industrial Co.' has sent you a quote for 'Industrial Grade Widget Pro'.", date: "2024-07-25", read: false },
  { id: "notif2", title: "Enquiry Responded", message: "Your enquiry for 'Eco-Friendly Packaging Solution' has been responded to.", date: "2024-07-24", read: true },
  { id: "notif3", title: "Order Shipped", message: "Your order #ORD001 has been shipped.", date: "2024-07-23", read: true },
];

export default function BuyerNotificationsPage() {
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
              <SidebarMenuButton href="/buyer/dashboard/quote-requests" tooltip="Quote Requests">
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
              <SidebarMenuButton href="/buyer/dashboard/notifications" isActive tooltip="Notifications">
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
            <h1 className="font-headline text-2xl font-semibold">Notifications</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Your Notifications</CardTitle>
              <CardDescription>Recent updates, new messages, and quote responses.</CardDescription>
            </CardHeader>
            <CardContent>
              {dummyNotifications.length > 0 ? (
                <div className="space-y-4">
                  {dummyNotifications.map((notification) => (
                    <Card key={notification.id} className={`shadow-sm ${!notification.read ? 'border-primary' : ''}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className={`font-headline text-lg ${!notification.read ? 'text-primary' : ''}`}>{notification.title}</CardTitle>
                            {!notification.read && <Badge className="bg-accent text-accent-foreground">New</Badge>}
                        </div>
                        <CardDescription className="text-xs">{notification.date}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button variant="link" size="sm" className="text-primary">View Details</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">You have no new notifications.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
