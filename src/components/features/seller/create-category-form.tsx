
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';

const createCategorySchema = z.object({
  name: z.string().min(3, { message: "Category name must be at least 3 characters." }).max(100, { message: "Category name must be 100 characters or less." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description must be 500 characters or less." }).optional().nullable(),
  isActive: z.boolean().default(true),
});

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

interface CreateCategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCategoryForm({ onSuccess, onCancel }: CreateCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const accessToken = useSelector(selectAccessToken);

  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: CreateCategoryFormValues) => {
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You are not logged in. Please log in to create a category.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || null, 
        isActive: values.isActive,
        parentCategory: null, 
      };

      const response = await fetch('http://localhost:8080/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Failed to create category. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      toast({
        title: "Category Created!",
        description: responseData.message || `Category "${values.name}" has been successfully created.`,
      });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Creating Category",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Category Name</FormLabel>
              <FormControl>
                <Input id="name" placeholder="e.g., Electronics, Construction Materials" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="description">Category Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  id="description"
                  placeholder="Provide a brief description for this category..."
                  className="min-h-[100px]"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Parent Category</FormLabel>
          <Input value="None (Creates a Top-level category)" disabled className="bg-muted/50" />
          <FormDescription>
            This form creates top-level categories. Sub-category creation can be managed via editing a category (future feature).
          </FormDescription>
        </FormItem>
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Activate Category</FormLabel>
                <FormDescription>
                  Make this category visible and usable on the platform immediately.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
