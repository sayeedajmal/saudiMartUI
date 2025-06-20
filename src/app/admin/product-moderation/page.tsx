
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
import { LayoutDashboard, Users, Shapes, PackageCheck, ClipboardList, BarChart3, Settings, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';

const dummyProducts = [
  { id: "prod001", name: "High-Power LED Lights", seller: "Bright Solutions Ltd.", category: "Electronics", status: "Pending Approval", dateAdded: "2024-07-22" },
  { id: "prod002", name: "Organic Cotton Fabric Rolls", seller: "EcoTextiles Co.", category: "Textiles", status: "Active", dateAdded: "2024-07-20" },
  { id: "prod003", name: "Steel Pipes (Heavy Gauge)", seller: "Industrial Metals Inc.", category: "Construction Materials", status: "Rejected", dateAdded: "2024-07-19" },
  { id: "prod004", name: "Gourmet Spice Mix", seller: "Spice Masters", category: "Food & Beverage", status: "Active", dateAdded: "2024-07-18" },
];

export default function ProductModerationPage() {
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
                <SidebarMenuButton href="/admin/product-moderation" isActive tooltip="Product Moderation">
                  <PackageCheck />
                  <span>Product Moderation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/enquiry-monitoring" tooltip="Enquiry Monitoring">
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
              <h1 className="font-headline text-2xl font-semibold">Product Moderation</h1>
          </header>
          <main className="flex-1 p-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Review Products</CardTitle>
                <CardDescription>Approve, reject, or edit product listings from sellers.</CardDescription>
                <div className="flex pt-2 gap-2 items-center">
                  <Input placeholder="Search products by name or ID..." className="flex-grow" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                </div>
              </CardHeader>
              <CardContent>
                 {dummyProducts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dummyProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.id}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.seller}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <Badge variant={
                              product.status === "Active" ? "default" :
                              product.status === "Pending Approval" ? "secondary" :
                              "destructive"
                            }>{product.status}</Badge>
                          </TableCell>
                          <TableCell>{product.dateAdded}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm">View/Edit</Button>
                            {product.status === "Pending Approval" && <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Approve</Button>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No products awaiting moderation or matching filters.</p>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RoleProtectedRoute>
  );
}
