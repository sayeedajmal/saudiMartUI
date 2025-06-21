
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

const dummyReceivedEnquiries = [
  { id: "ENQ101", product: "Advanced Circuit Board Model X", buyer: "Tech Solutions Inc.", date: "2024-07-21", status: "New" },
  { id: "ENQ102", product: "Industrial Grade Widget Pro", buyer: "Global Manufacturing Co.", date: "2024-07-20", status: "Responded" },
  { id: "ENQ103", product: "Eco-Friendly Packaging Solution", buyer: "Sustainable Goods Ltd.", date: "2024-07-19", status: "Viewed" },
];

export default function SellerManageEnquiriesPage() {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="lg:hidden" />
          <h1 className="font-headline text-2xl font-semibold">Manage Enquiries</h1>
      </header>
      <main className="flex-1 p-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Received Enquiries</CardTitle>
            <CardDescription>View and respond to enquiries from potential buyers.</CardDescription>
          </CardHeader>
          <CardContent>
            {dummyReceivedEnquiries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enquiry ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Date Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyReceivedEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">{enquiry.id}</TableCell>
                      <TableCell>{enquiry.product}</TableCell>
                      <TableCell>{enquiry.buyer}</TableCell>
                      <TableCell>{enquiry.date}</TableCell>
                      <TableCell>
                        <Badge variant={
                          enquiry.status === "New" ? "destructive" :
                          enquiry.status === "Responded" ? "default" :
                          "outline"
                        }>{enquiry.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild className="mr-2">
                          <Link href={`#`}> 
                            View & Respond
                          </Link>
                        </Button>
                         <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                          Archive
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
               <p className="text-sm text-muted-foreground text-center py-8">You have no new enquiries.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
