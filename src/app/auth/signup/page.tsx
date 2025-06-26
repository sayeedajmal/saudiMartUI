
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from 'react-redux';
import { setLoading, signupSuccess, authError, type SignupResponseData } from '@/lib/redux/slices/userSlice';
import Image from "next/image";
import HeroSectionImg from "../../../assets/HeroSectionImage.png"
import { API_BASE_URL } from '@/lib/api';


const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone_number: z.string().min(10, { message: "Phone number must be at least 10 characters." }).max(20, { message: "Phone number seems too long."}),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["buyer", "seller"], { required_error: "Please select a role." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
      role: initialRole,
    },
  });

  useEffect(() => {
    const roleFromQuery = searchParams.get('role');
    if (roleFromQuery === 'buyer' || roleFromQuery === 'seller') {
      form.setValue('role', roleFromQuery);
    }
  }, [searchParams, form]);


  const onSubmit = async (values: SignupFormValues) => {
    dispatch(setLoading());
    try {
      const apiRequestBody = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        password: values.password,
        role: values.role.toUpperCase(), 
      };

      const response = await fetch(`${API_BASE_URL}/authen/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Signup failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const signupData: SignupResponseData = responseData.data;
      dispatch(signupSuccess(signupData));
      
      toast({
        title: "Signup Successful!",
        description: responseData.message || "You have successfully created an account.",
      });

      if (signupData.myProfile.role === 'SELLER') {
        router.push('/auth/setup-account');
      } else if (signupData.myProfile.role === 'BUYER') {
        router.push('/buyer/dashboard');
      } else {
        router.push('/'); 
      }

    } catch (error: any) {
      dispatch(authError(error.message || "An unexpected error occurred."));
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "Could not create your account. Please try again.",
      });
    }
  };
  
  const isLoading = form.formState.isSubmitting; 

  return (
    <div className="container mx-auto flex items-center p-10 justify-center">
      <div className="w-full ">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
           {/* Left Column: Banner */}
          <div className="w-[80vw] flex flex-col justify-center order-1 md:order-none">
            <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src={HeroSectionImg}
                alt="Join SaudiMart B2B Platform - Professional Business Network"
                layout="fill"
                objectFit="cover"
                data-ai-hint="saudi business team"
                priority
              />
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="w-full md:w-1/2 flex flex-col justify-center order-2 md:order-none">
            <Card className="shadow-2xl w-full">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Create Your Account</CardTitle>
                <CardDescription>Join SaudiMart as a {form.watch('role') || 'Buyer/Seller'}.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="name">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              id="name"
                              type="text"
                              placeholder="Your full name"
                              autoComplete="name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="email">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="phone_number">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              id="phone_number"
                              type="tel"
                              placeholder="+966123456789"
                              autoComplete="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="password">Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                {...field}
                                className="pr-10" 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                {...field}
                                className="pr-10"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I want to sign up as a:</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="buyer">Buyer</SelectItem>
                              <SelectItem value="seller">Seller</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-medium text-primary hover:underline">
                    Sign In
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
