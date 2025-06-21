
'use client';

import { AutomatedEnquiryResponseForm } from "@/components/features/seller/automated-enquiry-response-form";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AutomatedEnquiryResponsePage() {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="font-headline text-2xl font-semibold">Automated Enquiry Response</h1>
      </header>
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <AutomatedEnquiryResponseForm />
        </div>
      </main>
    </>
  );
}
