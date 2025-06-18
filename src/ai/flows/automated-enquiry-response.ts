'use server';
/**
 * @fileOverview AI-powered tool to generate responses to buyer inquiries.
 *
 * - generateEnquiryResponse - A function that generates automated responses to buyer inquiries.
 * - GenerateEnquiryResponseInput - The input type for the generateEnquiryResponse function.
 * - GenerateEnquiryResponseOutput - The return type for the generateEnquiryResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEnquiryResponseInputSchema = z.object({
  productSpecs: z
    .string()
    .describe('Detailed specifications of the product the buyer is inquiring about.'),
  buyerInquiry: z.string().describe('The buyer’s specific inquiry or question.'),
  faqs: z.string().describe('Frequently asked questions about the product (MOQ, lead time, etc.)'),
  similarProducts: z
    .string()
    .describe('A list of similar products that might interest the buyer.'),
});
export type GenerateEnquiryResponseInput = z.infer<typeof GenerateEnquiryResponseInputSchema>;

const GenerateEnquiryResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the buyer inquiry.'),
});
export type GenerateEnquiryResponseOutput = z.infer<typeof GenerateEnquiryResponseOutputSchema>;

export async function generateEnquiryResponse(
  input: GenerateEnquiryResponseInput
): Promise<GenerateEnquiryResponseOutput> {
  return generateEnquiryResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEnquiryResponsePrompt',
  input: {schema: GenerateEnquiryResponseInputSchema},
  output: {schema: GenerateEnquiryResponseOutputSchema},
  prompt: `You are an AI assistant helping sellers respond to buyer inquiries on an e-commerce platform.

  Based on the following information, generate a comprehensive and helpful response to the buyer's inquiry. The response should address the buyer's questions, provide relevant product details, answer FAQs, and suggest similar products where appropriate.

  Product Specifications: {{{productSpecs}}}
  Buyer Inquiry: {{{buyerInquiry}}}
  FAQs: {{{faqs}}}
  Similar Products: {{{similarProducts}}}

  Response:`,
});

const generateEnquiryResponseFlow = ai.defineFlow(
  {
    name: 'generateEnquiryResponseFlow',
    inputSchema: GenerateEnquiryResponseInputSchema,
    outputSchema: GenerateEnquiryResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
