import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import logoImage from "@assets/1800302f-8921-4957-8c39-3059183e7401_1760066658468.jpg";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email, username, or phone is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["customer", "driver", "shop", "franchise", "admin"], { errorMap: () => ({ message: "Please select your role" }) }),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignIn() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
      role: undefined,
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInForm) => {
      const response = await apiRequest("POST", "/api/auth/signin", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      // Redirect based on role, then reload to update auth state
      const redirectPaths = {
        customer: '/customer',
        driver: '/driver',
        shop: '/shop',
        franchise: '/franchise',
        admin: '/admin'
      };
      window.location.href = redirectPaths[data.role as keyof typeof redirectPaths] || '/';
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignInForm) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={logoImage} 
            alt="Mr Bubbles Express" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email, Username, or Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email, username, or phone" 
                          {...field} 
                          data-testid="input-identifier"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer" data-testid="option-customer">Customer</SelectItem>
                          <SelectItem value="driver" data-testid="option-driver">Driver</SelectItem>
                          <SelectItem value="shop" data-testid="option-shop">Shop (Mr Bubbles Original)</SelectItem>
                          <SelectItem value="franchise" data-testid="option-franchise">Franchise Partner</SelectItem>
                          <SelectItem value="admin" data-testid="option-admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signInMutation.isPending}
                  data-testid="button-signin"
                >
                  {signInMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a href="/signup" className="text-primary hover:underline" data-testid="link-signup">
                  Sign up
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
