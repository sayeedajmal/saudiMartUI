
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
import { LayoutDashboard, Users, Shapes, PackageCheck, ClipboardList, BarChart3, Settings, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';

const dummyCategories = [
  { id: "cat001", name: "Electronics", subcategories: 5, products: 120 },
  { id: "cat002", name: "Construction Materials", subcategories: 3, products: 85 },
  { id: "cat003", name: "Industrial Supplies", subcategories: 8, products: 250 },
  { id: "cat004", name: "Food & Beverage", subcategories: 12, products: 400 },
];

export default function CategoryManagementPage() {
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
                <SidebarMenuButton href="/admin/category-management" isActive tooltip="Category Management">
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
              <h1 className="font-headline text-2xl font-semibold">Category Management</h1>
          </header>
          <main className="flex-1 p-6">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="font-headline">Manage Categories</CardTitle>
                  <CardDescription>Add, edit, or delete product categories and sub-categories.</CardDescription>
                </div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                </Button>
              </CardHeader>
              <CardContent>
                {dummyCategories.length > 0 ? (
                  <div className="space-y-4">
                    {dummyCategories.map((category) => (
                      <Card key={category.id} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="font-headline text-lg">{category.name}</CardTitle>
                          <CardDescription>Subcategories: {category.subcategories} | Products: {category.products}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline" size="sm"><Edit className="mr-2 h-3 w-3" />Edit</Button>
                          <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-3 w-3" />Delete</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No categories found. Add one to get started.</p>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RoleProtectedRoute>
  );
}
