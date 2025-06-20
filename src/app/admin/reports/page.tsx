
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
import { LayoutDashboard, Users, Shapes, PackageCheck, ClipboardList, BarChart3, Settings, Users2, ShoppingBag, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';
// Placeholder for Chart components if you were to use them:
// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export default function ReportsPage() {
  // Dummy data for charts (if implemented)
  // const salesData = [
  //   { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  //   // ... more months
  // ];

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
                <SidebarMenuButton href="/admin/enquiry-monitoring" tooltip="Enquiry Monitoring">
                  <ClipboardList />
                  <span>Enquiry Monitoring</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin/reports" isActive tooltip="Reports">
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
              <h1 className="font-headline text-2xl font-semibold">Reports Dashboard</h1>
          </header>
          <main className="flex-1 p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-headline">Total Users</CardTitle>
                  <Users2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+50 since last month</p>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-headline">Total Products</CardTitle>
                  <PackageCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5,678</div>
                  <p className="text-xs text-muted-foreground">+200 new products</p>
                </CardContent>
              </Card>
               <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-headline">Total Enquiries</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">890</div>
                  <p className="text-xs text-muted-foreground">+15% this week</p>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-headline">Active Users (24h)</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">152</div>
                  <p className="text-xs text-muted-foreground">Online now</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline">Sales Overview (Placeholder)</CardTitle>
                  <CardDescription>Monthly sales performance.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {/* Placeholder for chart:
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={salesData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  */}
                   <div className="h-[350px] w-full flex items-center justify-center bg-muted rounded-md">
                     <p className="text-muted-foreground">Sales Chart Placeholder</p>
                   </div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline">User Activity (Placeholder)</CardTitle>
                  <CardDescription>User registrations and activity trends.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="h-[350px] w-full flex items-center justify-center bg-muted rounded-md">
                     <p className="text-muted-foreground">User Activity Chart Placeholder</p>
                   </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RoleProtectedRoute>
  );
}
