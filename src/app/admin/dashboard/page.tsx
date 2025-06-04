
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
import Link from "next/link";

const adminDashboardCards = [
  { title: "Pending Approvals", value: "5", icon: Users, href: "/admin/user-management", color: "text-orange-500" },
  { title: "Active Products", value: "1200+", icon: PackageCheck, href: "/admin/product-moderation", color: "text-green-500" },
  { title: "Open Enquiries", value: "32", icon: ClipboardList, href: "/admin/enquiry-monitoring", color: "text-blue-500" },
  { title: "Total Sales (Month)", value: "$45,780", icon: BarChart3, href: "/admin/reports", color: "text-purple-500" },
];

export default function AdminDashboardPage() {
  return (
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
              <SidebarMenuButton href="/admin/dashboard" isActive tooltip="Dashboard">
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
            <h1 className="font-headline text-2xl font-semibold">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {adminDashboardCards.map((card) => (
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
                <CardTitle className="font-headline">Recent Platform Activity</CardTitle>
                <CardDescription>Overview of new users, products, and enquiries.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Platform activity metrics will be displayed here.</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">System Health</CardTitle>
                <CardDescription>Status of key platform services.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">System health indicators will be displayed here.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
