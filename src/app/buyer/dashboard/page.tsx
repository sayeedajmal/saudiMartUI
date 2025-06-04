
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const buyerDashboardCards = [
  { title: "Pending Orders", value: "3", icon: ShoppingCart, href: "#", color: "text-blue-500" },
  { title: "Saved Products", value: "15", icon: Heart, href: "#", color: "text-red-500" },
  { title: "Unread Messages", value: "5", icon: MessageCircle, href: "/buyer/dashboard/my-enquiries", color: "text-green-500" },
  { title: "Active Quotes", value: "2", icon: FileText, href: "#", color: "text-yellow-500" },
];

export default function BuyerDashboardPage() {
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
              <SidebarMenuButton href="/buyer/dashboard" isActive tooltip="Dashboard">
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
              <SidebarMenuButton href="#" tooltip="Quote Requests">
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
            <h1 className="font-headline text-2xl font-semibold">Buyer Dashboard</h1>
        </header>
        <main className="flex-1 p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {buyerDashboardCards.map((card) => (
              <Card key={card.title} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-headline">{card.title}</CardTitle>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <Link href={card.href} className="text-xs text-primary hover:underline mt-2 inline-block">
                    View Details
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Recent Order Activity</CardTitle>
                <CardDescription>Track your recent orders and their statuses.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No recent order activity to display yet.</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Quick Links</CardTitle>
                <CardDescription>Access common actions quickly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                 <Button asChild variant="ghost" className="w-full justify-start p-2 text-left hover:bg-muted rounded-md text-sm">
                    <Link href="/products">Browse Products</Link>
                 </Button>
                 <Button asChild variant="ghost" className="w-full justify-start p-2 text-left hover:bg-muted rounded-md text-sm">
                    <Link href="/buyer/dashboard/my-enquiries">View My Enquiries</Link>
                 </Button>
                 <Button asChild variant="ghost" className="w-full justify-start p-2 text-left hover:bg-muted rounded-md text-sm">
                    <Link href="/buyer/dashboard/addresses">Manage Addresses</Link>
                 </Button>
                 <Button asChild variant="ghost" className="w-full justify-start p-2 text-left hover:bg-muted rounded-md text-sm">
                    <Link href="/buyer/dashboard/notifications">Check Notifications</Link>
                 </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
