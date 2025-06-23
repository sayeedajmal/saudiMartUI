
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
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/lib/redux/slices/userSlice';
import type { SellerCategory } from '@/app/seller/dashboard/category-management/page';

const editCategorySchema = z.object({
  name: z.string().min(3, { message: "Category name must be at least 3 characters." }).max(100, { message: "Category name must be 100 characters or less." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).min(1, "Image URL is required."),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description must be 500 characters or less." }).optional().nullable(),
  isActive: z.boolean().default(true),
});

type EditCategoryFormValues = z.infer<typeof editCategorySchema>;

interface EditCategoryFormProps {
  initialData: SellerCategory;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditCategoryForm({ initialData, onSuccess, onCancel }: EditCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const accessToken = useSelector(selectAccessToken);

  const form = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: initialData.name || "",
      imageUrl: initialData.imageUrl || "",
      description: initialData.description || "",
      isActive: initialData.isActive === undefined ? true : initialData.isActive,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialData.name || "",
      imageUrl: initialData.imageUrl || "",
      description: initialData.description || "",
      isActive: initialData.isActive === undefined ? true : initialData.isActive,
    });
  }, [initialData, form]);


  const onSubmit = async (values: EditCategoryFormValues) => {
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You are not logged in. Please log in to update a category.",
      });
      return;
    }
    if (!initialData || !initialData.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Category ID is missing. Cannot update.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        id: initialData.id,
        name: values.name,
        imageUrl: values.imageUrl,
        description: values.description || null,
        isActive: values.isActive,
        parentCategory: initialData.parentCategory ? { id: initialData.parentCategory.id } : null,
        childCategories: initialData.childCategories || [],
        createdAt: initialData.createdAt,
      };
      
      const response = await fetch(`http://localhost:8080/categories/${initialData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Failed to update category. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      toast({
        title: "Category Updated!",
        description: responseData.message || `Category "${values.name}" has been successfully updated.`,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Updating Category",
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="imageUrl">Image URL</FormLabel>
              <FormControl>
                <Input id="imageUrl" placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} />
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
            <Input value={initialData.parentCategory ? initialData.parentCategory.name : 'None (Top-level category)'} disabled className="bg-muted/50" />
            <FormDescription>
                Changing parent category is not supported in this form.
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
                  Make this category visible and usable on the platform.
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
