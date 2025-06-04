
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
import { LayoutDashboard, ShoppingCart, Heart, MessageCircle, FileText, Bell, Settings, MapPin, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const dummyAddresses = [
  { id: "addr1", name: "Primary Warehouse", street: "123 Industrial Ave", city: "Riyadh", country: "Saudi Arabia", isDefault: true },
  { id: "addr2", name: "Office Location", street: "456 Business Rd", city: "Jeddah", country: "Saudi Arabia", isDefault: false },
];

export default function BuyerAddressesPage() {
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
              <SidebarMenuButton href="#" tooltip="Quote Requests">
                <FileText />
                <span>Quote Requests</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/buyer/dashboard/addresses" isActive tooltip="My Addresses">
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
            <h1 className="font-headline text-2xl font-semibold">My Addresses</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Manage Your Addresses</CardTitle>
                <CardDescription>Add, edit, or remove your shipping addresses.</CardDescription>
              </div>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Add New Address</Button>
            </CardHeader>
            <CardContent>
              {dummyAddresses.length > 0 ? (
                <div className="space-y-4">
                  {dummyAddresses.map((address) => (
                    <Card key={address.id} className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="font-headline text-lg">{address.name} {address.isDefault && <span className="text-xs text-primary font-normal ml-2">(Default)</span>}</CardTitle>
                        <CardDescription>{address.street}, {address.city}, {address.country}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">You haven't added any addresses yet.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
