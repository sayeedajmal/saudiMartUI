
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
import { LayoutDashboard, Users, Shapes, PackageCheck, ClipboardList, BarChart3, Settings, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';

const dummyEnquiries = [
  { id: "ENQ001", buyer: "Buyer Corp A", seller: "Seller Inc X", product: "Industrial Widget Pro", date: "2024-07-22", status: "New" },
  { id: "ENQ002", buyer: "Buyer Solutions B", seller: "Seller Global Y", product: "Eco Packaging Bulk", date: "2024-07-21", status: "Responded" },
  { id: "ENQ003", buyer: "Buyer Goods C", seller: "Seller National Z", product: "Advanced Circuit Board", date: "2024-07-20", status: "Quote Sent" },
  { id: "QT001", buyer: "Buyer Pro D", seller: "Seller Elite W", product: "Coffee Beans Premium", date: "2024-07-19", status: "Quote Approved", type: "Quote" },
];

export default function EnquiryMonitoringPage() {
  return (
    <RoleProtectedRoute expectedRole="ADMIN">
      <SidebarProvider>
        <Sidebar collapsible="icon" className="shadow-lg">
          <SidebarHeader className="p-4 justify-between items-center flex">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <h2 className="font-headline text-lg font-semibold text-sidebar-primary">SaudiMart Admin</h2>
            </Link>
          </SidebarHeader>
          <ScrollArea className="flex-1">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/dashboard" tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/user-management" tooltip="User Management">
                  <Users />
                  <span>User Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/category-management" tooltip="Category Management">
                  <Shapes />
                  <span>Category Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/product-moderation" tooltip="Product Moderation">
                  <PackageCheck />
                  <span>Product Moderation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/enquiry-monitoring" isActive tooltip="Enquiry Monitoring">
                  <ClipboardList />
                  <span>Enquiry Monitoring</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/reports" tooltip="Reports">
                  <BarChart3 />
                  <span>Reports</span>
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
              <h1 className="font-headline text-2xl font-semibold">Enquiry & Quote Monitoring</h1>
          </header>
          <main className="flex-1 p-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Monitor Enquiries and Quotes</CardTitle>
                <CardDescription>Oversee communication between buyers and sellers.</CardDescription>
                <div className="flex pt-2 gap-2">
                  <Input placeholder="Search by ID, buyer, or seller..." className="max-w-sm" />
                  <Button>Search</Button>
                </div>
              </CardHeader>
              <CardContent>
                 {dummyEnquiries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dummyEnquiries.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.type || "Enquiry"}</TableCell>
                          <TableCell>{item.buyer}</TableCell>
                          <TableCell>{item.seller}</TableCell>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>
                            <Badge variant={
                              item.status === "New" ? "destructive" :
                              item.status === "Quote Approved" ? "default" :
                              "secondary"
                            }>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm"><Eye className="mr-2 h-3 w-3"/>View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No enquiries or quotes to display.</p>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RoleProtectedRoute>
  );
}
