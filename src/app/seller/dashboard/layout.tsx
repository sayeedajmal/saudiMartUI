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
import { BotMessageSquare, LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, MessageSquare, Warehouse, Truck, Bell, Shapes, MapPin, FileText, Boxes } from "lucide-react";
import Link from "next/link";
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';

const menuItems = [
    { href: "/seller/dashboard", tooltip: "Dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/seller/dashboard/addresses", tooltip: "Manage Addresses", icon: MapPin, label: "Addresses" },
    { href: "/seller/dashboard/warehouses", tooltip: "Manage Warehouses", icon: Warehouse, label: "Warehouses" },
    { href: "/seller/dashboard/category-management", tooltip: "Category Management", icon: Shapes, label: "Category Management" },
    { href: "/seller/dashboard/product-manager", tooltip: "Product Manager", icon: Package, label: "Product Manager" },
    { href: "/seller/dashboard/inventory", tooltip: "Inventory", icon: Boxes, label: "Inventory" },
    { href: "/seller/dashboard/orders", tooltip: "Manage Orders", icon: ShoppingBag, label: "Manage Orders" },
    { href: "/seller/dashboard/quotes", tooltip: "Manage Quotes", icon: FileText, label: "Manage Quotes" },
    { href: "/seller/dashboard/enquiries", tooltip: "Manage Enquiries", icon: MessageSquare, label: "Manage Enquiries" },
    { href: "/seller/dashboard/automated-enquiry-response", tooltip: "AI Enquiry Response", icon: BotMessageSquare, label: "AI Enquiry Response" },
    { href: "/seller/dashboard/shipping-settings", tooltip: "Shipping Settings", icon: Truck, label: "Shipping Settings" },
    { href: "/seller/dashboard/notifications", tooltip: "Notifications", icon: Bell, label: "Notifications" },
    { href: "#", tooltip: "Analytics", icon: BarChart3, label: "Analytics" },
    { href: "#", tooltip: "Settings", icon: Settings, label: "Settings" }
];

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/seller/dashboard") {
      return pathname === href;
    }
    // Handle nested routes like /.../[id]
    if (pathname.includes(href) && href !== "#" && href !== "/seller/dashboard") {
      // Check if it's not another menu item that also starts with the same href
      const otherItems = menuItems.filter(i => i.href.startsWith(href) && i.href.length > href.length);
      if (otherItems.some(i => pathname.startsWith(i.href))) {
        return false;
      }
      return true;
    }
    return false;
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
