import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Mail, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Back */}
        <div className="mb-8">
          <button 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          
          <div className="text-center">
            <img 
              src={logoImage} 
              alt="Mr Bubbles Express" 
              className="h-16 w-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold">Sign in to your account</h1>
            <p className="text-muted-foreground mt-2">Enter your details to continue</p>
          </div>
        </div>

        {/* Form Card - Uber Clean Style */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email, Phone or Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email, phone, or username" 
                        className="h-12 rounded-lg"
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
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        className="h-12 rounded-lg"
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
                    <FormLabel className="text-sm font-medium">I am a</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-lg" data-testid="select-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="customer" data-testid="option-customer">Customer</SelectItem>
                        <SelectItem value="driver" data-testid="option-driver">Driver</SelectItem>
                        <SelectItem value="shop" data-testid="option-shop">Shop (Mr Bubbles)</SelectItem>
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
                className="w-full h-12 text-base font-semibold rounded-lg" 
                disabled={signInMutation.isPending}
                data-testid="button-signin"
              >
                {signInMutation.isPending ? "Signing in..." : "Continue"}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-lg"
                type="button"
                disabled
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Email Link
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary font-medium hover:underline" data-testid="link-signup">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
