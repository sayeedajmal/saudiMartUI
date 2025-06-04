
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { generateEnquiryResponse, GenerateEnquiryResponseInput } from '@/ai/flows/automated-enquiry-response';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  productSpecs: z.string().min(10, {
    message: 'Product specifications must be at least 10 characters.',
  }),
  buyerInquiry: z.string().min(10, {
    message: 'Buyer inquiry must be at least 10 characters.',
  }),
  faqs: z.string().optional(),
  similarProducts: z.string().optional(),
});

export function AutomatedEnquiryResponseForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productSpecs: '',
      buyerInquiry: '',
      faqs: '',
      similarProducts: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResponse(null);
    try {
      const input: GenerateEnquiryResponseInput = {
        productSpecs: values.productSpecs,
        buyerInquiry: values.buyerInquiry,
        faqs: values.faqs || '', // Ensure empty strings if optional fields are not filled
        similarProducts: values.similarProducts || '',
      };
      const aiResponse = await generateEnquiryResponse(input);
      setResponse(aiResponse.response);
      toast({
        title: 'Success!',
        description: 'Enquiry response generated successfully.',
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Generate Enquiry Response</CardTitle>
          <CardDescription>
            Fill in the details below to automatically generate a response to a buyer's inquiry using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="productSpecs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Specifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed product specifications..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="buyerInquiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer Inquiry</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the buyer's specific inquiry..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="faqs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FAQs (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter frequently asked questions and answers (e.g., MOQ, lead time, usage)..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="similarProducts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Similar Products (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List similar products that might interest the buyer..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Response
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {response && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-md">
              <p className="whitespace-pre-wrap text-sm">{response}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
