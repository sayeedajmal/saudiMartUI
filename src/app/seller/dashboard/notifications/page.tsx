
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

const dummyNotifications = [
  { id: "s_notif1", title: "New Enquiry Received", message: "Buyer 'Tech Solutions Inc.' sent an enquiry for 'Advanced Circuit Board Model X'.", date: "2024-07-25", read: false },
  { id: "s_notif2", title: "Product Approved", message: "Your product 'Heavy-Duty Safety Gloves' has been approved and is now live.", date: "2024-07-24", read: true },
  { id: "s_notif3", title: "Quote Accepted", message: "Buyer 'Global Manufacturing Co.' accepted your quote for 'Industrial Grade Widget Pro'.", date: "2024-07-23", read: true },
];

export default function SellerNotificationsPage() {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="lg:hidden" />
          <h1 className="font-headline text-2xl font-semibold">Notifications</h1>
      </header>
      <main className="flex-1 p-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Your Notifications</CardTitle>
            <CardDescription>Updates on enquiries, orders, and platform announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            {dummyNotifications.length > 0 ? (
              <div className="space-y-4">
                {dummyNotifications.map((notification) => (
                  <Card key={notification.id} className={`shadow-sm ${!notification.read ? 'border-primary' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                          <CardTitle className={`font-headline text-lg ${!notification.read ? 'text-primary' : ''}`}>{notification.title}</CardTitle>
                          {!notification.read && <Badge className="bg-accent text-accent-foreground">New</Badge>}
                      </div>
                      <CardDescription className="text-xs">{notification.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="link" size="sm" className="text-primary">View Details</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">You have no new notifications.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
