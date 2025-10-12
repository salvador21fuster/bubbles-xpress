import { Home, Package, Users, Settings, BarChart3, ShoppingBag, Scan, FileText, Receipt, Building2, GraduationCap, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/1800302f-8921-4957-8c39-3059183e7401_1760066658468.jpg";

export function AppSidebar() {
  const { user, isShop, isFranchise, isAdmin } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const shopItems = [
    { title: "Dashboard", url: "/shop", icon: Home },
    { title: "Orders", url: "/shop/orders", icon: ShoppingBag },
    { title: "Intake", url: "/shop/intake", icon: Scan },
    { title: "Processing", url: "/shop/processing", icon: Package },
    { title: "Profile", url: "/shop/profile", icon: Building2 },
    { title: "Training", url: "/shop/training", icon: GraduationCap },
  ];

  const franchiseItems = [
    { title: "Dashboard", url: "/franchise", icon: Home },
    { title: "Orders", url: "/franchise/orders", icon: ShoppingBag },
    { title: "Intake", url: "/franchise/intake", icon: Scan },
    { title: "Processing", url: "/franchise/processing", icon: Package },
    { title: "Profile", url: "/franchise/profile", icon: Building2 },
    { title: "Training", url: "/franchise/training", icon: GraduationCap },
  ];

  const adminItems = [
    { title: "Dashboard", url: "/admin", icon: Home },
    { title: "Transactions", url: "/admin/transactions", icon: BarChart3 },
    { title: "Invoices", url: "/admin/invoices", icon: Receipt },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Policies", url: "/admin/policies", icon: FileText },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const items = isAdmin ? adminItems : isFranchise ? franchiseItems : isShop ? shopItems : [];

  return (
    <Sidebar className="border-r bg-background">
      {/* Uber Eats Manager Style Header */}
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="Mr Bubbles" 
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-bold text-lg">Mr Bubbles</h2>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Manager Portal' : isFranchise ? 'Franchise' : 'Shop'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`${isActive ? 'bg-muted font-medium' : 'hover-elevate'} rounded-lg`}
                      isActive={isActive}
                    >
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Uber Style User Footer */}
      <SidebarFooter className="p-4 border-t">
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.username || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
