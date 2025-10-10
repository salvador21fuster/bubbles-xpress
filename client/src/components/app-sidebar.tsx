import { Home, Package, Users, Settings, BarChart3, ShoppingBag, Scan, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const { user, isShop, isAdmin } = useAuth();
  const [location] = useLocation();

  const shopItems = [
    { title: "Dashboard", url: "/shop", icon: Home },
    { title: "Intake", url: "/shop/intake", icon: Scan },
    { title: "Processing", url: "/shop/processing", icon: Package },
    { title: "Orders", url: "/shop/orders", icon: ShoppingBag },
  ];

  const adminItems = [
    { title: "Dashboard", url: "/admin", icon: Home },
    { title: "Transactions", url: "/admin/transactions", icon: BarChart3 },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Policies", url: "/admin/policies", icon: FileText },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const items = isAdmin ? adminItems : isShop ? shopItems : [];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">MB</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Mr Bubbles</h2>
            <p className="text-xs text-muted-foreground capitalize">{user?.role} Portal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{user?.firstName?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
          onClick={() => window.location.href = '/api/logout'}
          data-testid="button-logout"
        >
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
