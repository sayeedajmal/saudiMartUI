
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react"; // Added Eye, EyeOff
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useDispatch } from 'react-redux';
import { setLoading, signupSuccess, authError, type SignupResponseData } from '@/lib/redux/slices/userSlice';
import { useRouter } from 'next/navigation';
import HeroSectionImg from "../../../assets/HeroSectionImage.png";
import { API_BASE_URL } from '@/lib/api';


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Min 1, as min 6 might be too strict for login page before API validation
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: LoginFormValues) => {
    dispatch(setLoading());
    try {
      const response = await fetch(`${API_BASE_URL}/authen/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Login failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      // Assuming login response data structure is the same as signup
      const loginData: SignupResponseData = responseData.data; 
      dispatch(signupSuccess(loginData)); // Reusing signupSuccess action
      
      toast({
        title: "Login Successful!",
        description: responseData.message || "Welcome back!",
      });

      // Redirect based on role
      if (loginData.myProfile.role === 'SELLER') {
        router.push('/seller/dashboard');
      } else if (loginData.myProfile.role === 'BUYER') {
        router.push('/buyer/dashboard');
      } else {
        router.push('/'); // Default redirect if role is not buyer or seller
      }

    } catch (error: any) {
      dispatch(authError(error.message || "An unexpected error occurred."));
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials or server error. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto flex items-center p-10 justify-center">
      <div className="w-full ">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
           {/* Left Column: Banner */}
          <div className="w-[80vw] flex flex-col justify-center order-1 md:order-none">
           <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src={HeroSectionImg}
                alt="SaudiMart B2B Platform - Professional Business Environment"
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
                <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to access your SaudiMart account.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="email">Email Address</Label>
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <FormControl>
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="current-password"
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
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                    Sign Up
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
