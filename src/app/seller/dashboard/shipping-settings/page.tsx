
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function SellerShippingSettingsPage() {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="lg:hidden" />
          <h1 className="font-headline text-2xl font-semibold">Shipping Settings</h1>
      </header>
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Shipping Methods</CardTitle>
              <CardDescription>Configure how you ship products to buyers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <Label htmlFor="self-delivery-switch" className="flex flex-col space-y-1">
                  <span>Enable Self Delivery</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Offer delivery using your own logistics.
                  </span>
                </Label>
                <Switch id="self-delivery-switch" />
              </div>
               <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <Label htmlFor="pickup-switch" className="flex flex-col space-y-1">
                  <span>Allow Warehouse Pickup</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Let buyers pick up orders from your warehouse(s).
                  </span>
                </Label>
                <Switch id="pickup-switch" />
              </div>
               <div className="p-4 border rounded-lg space-y-3">
                  <Label className="flex flex-col space-y-1">
                      <span>Third-Party Logistics (3PL)</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                      Integrate with or list preferred 3PL partners.
                      </span>
                  </Label>
                  <Button variant="outline" size="sm">Configure 3PL Providers (Placeholder)</Button>
               </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Shipping Settings</Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Shipping Zones & Rates</CardTitle>
              <CardDescription>Define where you ship and how much it costs (Placeholder).</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Functionality for managing shipping zones and rates is not yet implemented.
              </p>
              <Button variant="outline" className="mt-4">Add Shipping Zone (Placeholder)</Button>
            </CardContent>
          </Card>

           <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Preferred Delivery Options</CardTitle>
              <CardDescription>Set default delivery timeframes or options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                  <Label htmlFor="delivery-timeframe">Standard Delivery Timeframe</Label>
                  <Input id="delivery-timeframe" placeholder="e.g., 3-5 business days" />
              </div>
               <div>
                  <Label htmlFor="contact-person">Shipping Contact Person</Label>
                  <Input id="contact-person" placeholder="e.g., John Doe" />
              </div>
               <div>
                  <Label htmlFor="shipping-phone">Shipping Contact Phone</Label>
                  <Input id="shipping-phone" type="tel" placeholder="+966 5X XXX XXXX" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Delivery Options</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
