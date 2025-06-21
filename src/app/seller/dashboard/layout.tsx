
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
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from 'next/navigation';
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, Boxes, FileText } from "lucide-react";
import Link from "next/link";
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';

const menuItems = [
    { href: "/seller/dashboard", tooltip: "Dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/seller/dashboard/product-manager", tooltip: "Product Manager", icon: Package, label: "Product Manager" },
    { href: "/seller/dashboard/inventory", tooltip: "Inventory Management", icon: Boxes, label: "Inventory" },
    { href: "/seller/dashboard/orders", tooltip: "Manage Orders", icon: ShoppingBag, label: "Manage Orders" },
    { href: "/seller/dashboard/enquiries", tooltip: "Manage Enquiries", icon: MessageSquare, label: "Manage Enquiries" },
    { href: "/seller/dashboard/quotes", tooltip: "Manage Quotes", icon: FileText, label: "Manage Quotes" },
    { href: "/seller/dashboard/automated-enquiry-response", tooltip: "AI Enquiry Response", icon: BotMessageSquare, label: "AI Enquiry Response" },
    { href: "/seller/dashboard/category-management", tooltip: "Category Management", icon: Shapes, label: "Category Management" },
    { href: "/seller/dashboard/warehouses", tooltip: "Manage Warehouses", icon: Warehouse, label: "Warehouses" },
    { href: "/seller/dashboard/shipping-settings", tooltip: "Shipping Settings", icon: Truck, label: "Shipping Settings" },
    { href: "/seller/dashboard/notifications", tooltip: "Notifications", icon: Bell, label: "Notifications" },
    { href: "#", tooltip: "Analytics", icon: BarChart3, label: "Analytics" },
    { href: "#", tooltip: "Settings", icon: Settings, label: "Settings" }
];

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // This logic helps highlight the correct menu item even for dynamic routes
  const isActive = (href: string) => {
    if (href === "/seller/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href) && href !== "#";
  };

  return (
    <RoleProtectedRoute expectedRole="SELLER">
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
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href + item.label}>
                        <SidebarMenuButton 
                            href={item.href} 
                            isActive={isActive(item.href)}
                            tooltip={item.tooltip}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </ScrollArea>
        </Sidebar>
        <SidebarInset>
            {children}
        </SidebarInset>
      </SidebarProvider>
    </RoleProtectedRoute>
  );
}
