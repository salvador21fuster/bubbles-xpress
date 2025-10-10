import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isDriver: user?.role === 'driver',
    isShop: user?.role === 'shop',
    isAdmin: user?.role === 'admin',
  };
}
