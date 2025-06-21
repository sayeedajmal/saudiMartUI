
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DollarSign, MessageSquare, Package, ShoppingBag } from "lucide-react";

const dashboardCards = [
  { title: "New Enquiries", value: "12", icon: MessageSquare, change: "+5 this week", href: "/seller/dashboard/enquiries", color: "text-blue-500" },
  { title: "Active Products", value: "78", icon: Package, change: "+2 new", href: "/seller/dashboard/product-manager", color: "text-green-500" },
  { title: "Total Sales", value: "$15,230", icon: DollarSign, change: "+8% vs last month", href: "#", color: "text-purple-500" },
  { title: "Pending Orders", value: "5", icon: ShoppingBag, change: "+1 today", href: "/seller/dashboard/orders", color: "text-yellow-500" },
];

export default function SellerDashboardPage() {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="font-headline text-2xl font-semibold">Seller Dashboard</h1>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => (
            <Card key={card.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-headline">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.change}</p>
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
              <CardTitle className="font-headline">Recent Activity</CardTitle>
              <CardDescription>Overview of recent interactions on your listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity to display yet.</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
              <CardDescription>Common tasks at your fingertips.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start p-2 text-left hover:bg-muted rounded-md text-sm">
                <Link href="/seller/dashboard/product-manager/new">Add New Product</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start p-2 text-left hover:bg-muted rounded-md text-sm">
                <Link href="/seller/dashboard/orders">Manage Orders</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start p-2 text-left hover:bg-muted rounded-md text-sm">
                <Link href="/seller/dashboard/enquiries">Manage Enquiries</Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-2 text-left hover:bg-muted rounded-md text-sm">Check Analytics</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
