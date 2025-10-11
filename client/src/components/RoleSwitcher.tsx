import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Truck, Building, Shield } from "lucide-react";

export function RoleSwitcher() {
  const { user, isSuperAdmin } = useAuth();
  const [location, navigate] = useLocation();

  if (!isSuperAdmin) return null;

  // Determine current dashboard based on URL
  const getCurrentDashboard = () => {
    if (location.startsWith('/customer')) return 'customer';
    if (location.startsWith('/driver')) return 'driver';
    if (location.startsWith('/shop')) return 'shop';
    if (location.startsWith('/admin')) return 'admin';
    return user?.role || 'customer';
  };

  const currentDashboard = getCurrentDashboard();

  const handleRoleChange = (role: string) => {
    const dashboardPaths = {
      customer: '/customer',
      driver: '/driver',
      shop: '/shop',
      admin: '/admin',
    };
    navigate(dashboardPaths[role as keyof typeof dashboardPaths] || '/');
  };

  const roleIcons = {
    customer: User,
    driver: Truck,
    shop: Building,
    admin: Shield,
  };

  const roleLabels = {
    customer: 'Customer',
    driver: 'Driver',
    shop: 'Shop',
    admin: 'Admin',
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-xs">
        Super Admin
      </Badge>
      <Select value={currentDashboard} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px]" data-testid="select-role-switcher">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(['customer', 'driver', 'shop', 'admin'] as const).map((role) => {
            const Icon = roleIcons[role];
            return (
              <SelectItem key={role} value={role} data-testid={`role-option-${role}`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{roleLabels[role]}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
