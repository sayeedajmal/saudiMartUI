
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
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const dummyWarehouses = [
  { id: "wh1", name: "Main Warehouse Riyadh", city: "Riyadh", capacity: "1000 sqm" },
  { id: "wh2", name: "Jeddah Distribution Hub", city: "Jeddah", capacity: "500 sqm" },
];

export default function SellerWarehousesPage() {
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
              <SidebarMenuButton href="#" tooltip="Product Manager">
                <Package />
                <span>Product Manager</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Manage Orders">
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
              <SidebarMenuButton href="/seller/dashboard/automated-enquiry-response" tooltip="AI Enquiry Response">
                <BotMessageSquare />
                <span>AI Enquiry Response</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/seller/dashboard/warehouses" isActive tooltip="Manage Warehouses">
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
            <h1 className="font-headline text-2xl font-semibold">Manage Warehouses</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Your Warehouses</CardTitle>
                <CardDescription>Add, edit, or remove your warehouse locations.</CardDescription>
              </div>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Add New Warehouse</Button>
            </CardHeader>
            <CardContent>
              {dummyWarehouses.length > 0 ? (
                <div className="space-y-4">
                  {dummyWarehouses.map((warehouse) => (
                    <Card key={warehouse.id} className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="font-headline text-lg">{warehouse.name}</CardTitle>
                        <CardDescription>{warehouse.city} - Capacity: {warehouse.capacity}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">You haven't added any warehouses yet.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
