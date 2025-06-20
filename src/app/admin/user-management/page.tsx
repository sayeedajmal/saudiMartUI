
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
import { LayoutDashboard, Users, Shapes, PackageCheck, ClipboardList, BarChart3, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';

const dummyUsers = [
  { id: "usr001", name: "Ahmed Khaled", email: "ahmed@example.com", role: "Buyer", status: "Active", joined: "2024-07-01" },
  { id: "usr002", name: "Fatima Stores", email: "fatima.stores@example.com", role: "Seller", status: "Pending Approval", joined: "2024-07-20" },
  { id: "usr003", name: "Global Trade Co.", email: "contact@globaltrade.com", role: "Seller", status: "Active", joined: "2023-12-15" },
  { id: "usr004", name: "Procure Pro", email: "procure@pro.sa", role: "Buyer", status: "Suspended", joined: "2024-03-10" },
];

export default function UserManagementPage() {
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
                <SidebarMenuButton href="/admin/user-management" isActive tooltip="User Management">
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
              <h1 className="font-headline text-2xl font-semibold">User Management</h1>
          </header>
          <main className="flex-1 p-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Manage Users</CardTitle>
                <CardDescription>View, approve, and manage buyer and seller accounts.</CardDescription>
                <div className="flex pt-2 gap-2">
                  <Input placeholder="Search users by name or email..." className="max-w-sm" />
                  <Button>Search</Button>
                </div>
              </CardHeader>
              <CardContent>
                 {dummyUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dummyUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Badge variant={
                              user.status === "Active" ? "default" :
                              user.status === "Pending Approval" ? "secondary" :
                              "destructive"
                            }>{user.status}</Badge>
                          </TableCell>
                          <TableCell>{user.joined}</TableCell>
                          <TableCell className="text-right space-x-2">
                            {user.status === "Pending Approval" && <Button variant="outline" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Approve</Button>}
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RoleProtectedRoute>
  );
}
