import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const isSuperAdmin = user?.isSuperAdmin || false;
  // For super admins, use their active role; for regular users, use their actual role
  const activeRole = user?.role || '';

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin,
    // Use activeRole for role checks (works for both super admins and regular users)
    isCustomer: activeRole === 'customer',
    isDriver: activeRole === 'driver',
    isShop: activeRole === 'shop', // Original Mr Bubbles shop only
    isFranchise: activeRole === 'franchise', // Franchise partners
    isAdmin: activeRole === 'admin',
  };
}
