import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const isSuperAdmin = user?.isSuperAdmin || false;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin,
    // For super admins, allow access to all roles
    isCustomer: isSuperAdmin || user?.role === 'customer',
    isDriver: isSuperAdmin || user?.role === 'driver',
    isShop: isSuperAdmin || user?.role === 'shop',
    isAdmin: isSuperAdmin || user?.role === 'admin',
  };
}
