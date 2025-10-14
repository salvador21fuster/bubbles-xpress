import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import ShopDashboard from "@/pages/shop/Dashboard";
import ShopIntake from "@/pages/shop/Intake";
import ShopProcessing from "@/pages/shop/Processing";
import ShopOrders from "@/pages/shop/Orders";
import ShopProfile from "@/pages/shop/Profile";
import ShopTraining from "@/pages/shop/Training";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminOrders from "@/pages/admin/Orders";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminUsers from "@/pages/admin/Users";
import AdminPolicies from "@/pages/admin/Policies";
import AdminInvoices from "@/pages/admin/Invoices";
import CustomerHome from "@/pages/customer/Home";
import CustomerServices from "@/pages/customer/Services";
import CustomerCheckout from "@/pages/customer/Checkout";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CustomerNewOrder from "@/pages/customer/NewOrder";
import CustomerPayment from "@/pages/customer/Payment";
import CustomerOrderDetails from "@/pages/customer/OrderDetails";
import DriverDashboard from "@/pages/driver/Dashboard";
import DriverOrderDetails from "@/pages/driver/OrderDetails";
import DriverTraining from "@/pages/driver/Training";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import FranchiseSignUp from "@/pages/FranchiseSignUp";
import DriverAuth from "@/pages/DriverAuth";
import CustomerAuth from "@/pages/CustomerAuth";

function Router() {
  const { isAuthenticated, isLoading, isCustomer, isDriver, isShop, isFranchise, isAdmin, isSuperAdmin } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Always show clean landing page at root, regardless of auth status
  if (location === '/') {
    return <Landing />;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <Route path="/franchise-signup" component={FranchiseSignUp} />
        <Route path="/driver/signin" component={DriverAuth} />
        <Route path="/customer/signin" component={CustomerAuth} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Determine if we should use mobile or sidebar layout based on current route
  const isMobileRoute = location.startsWith('/customer') || location.startsWith('/driver');
  const shouldUseMobileLayout = (isCustomer || isDriver) && !isSuperAdmin ? true : isMobileRoute;

  // Mobile layout for Customer/Driver (or super admin viewing customer/driver)
  if (shouldUseMobileLayout) {
    return (
      <Switch>
        {/* Customer Routes */}
        {(isCustomer || isSuperAdmin) && (
          <>
            <Route path="/customer" component={CustomerHome} />
            <Route path="/customer/services" component={CustomerServices} />
            <Route path="/customer/checkout" component={CustomerCheckout} />
            <Route path="/customer/orders" component={CustomerDashboard} />
            <Route path="/customer/new-order" component={CustomerNewOrder} />
            <Route path="/customer/payment" component={CustomerPayment} />
            <Route path="/customer/orders/:id" component={CustomerOrderDetails} />
          </>
        )}

        {/* Driver Routes */}
        {(isDriver || isSuperAdmin) && (
          <>
            <Route path="/driver" component={DriverDashboard} />
            <Route path="/driver/orders" component={DriverDashboard} />
            <Route path="/driver/orders/:id" component={DriverOrderDetails} />
            <Route path="/driver/training" component={DriverTraining} />
          </>
        )}

        <Route component={NotFound} />
      </Switch>
    );
  }

  // Sidebar layout for Shop/Admin users (or super admin viewing shop/admin)
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <RoleSwitcher />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              {/* Shop Routes (Original Mr Bubbles Shop Only) */}
              {(isShop || isSuperAdmin) && (
                <>
                  <Route path="/shop" component={ShopDashboard} />
                  <Route path="/shop/orders" component={ShopOrders} />
                  <Route path="/shop/intake" component={ShopIntake} />
                  <Route path="/shop/processing" component={ShopProcessing} />
                  <Route path="/shop/profile" component={ShopProfile} />
                  <Route path="/shop/training" component={ShopTraining} />
                </>
              )}

              {/* Franchise Routes (Franchise Partners) */}
              {(isFranchise || isSuperAdmin) && (
                <>
                  <Route path="/franchise" component={ShopDashboard} />
                  <Route path="/franchise/orders" component={ShopOrders} />
                  <Route path="/franchise/intake" component={ShopIntake} />
                  <Route path="/franchise/processing" component={ShopProcessing} />
                  <Route path="/franchise/profile" component={ShopProfile} />
                  <Route path="/franchise/training" component={ShopTraining} />
                </>
              )}
              
              {/* Admin Routes */}
              {(isAdmin || isSuperAdmin) && (
                <>
                  <Route path="/admin" component={AdminDashboard} />
                  <Route path="/admin/orders" component={AdminOrders} />
                  <Route path="/admin/performance" component={AdminDashboard} />
                  <Route path="/admin/feedback" component={AdminDashboard} />
                  <Route path="/admin/payments" component={AdminInvoices} />
                  <Route path="/admin/transactions" component={AdminTransactions} />
                  <Route path="/admin/invoices" component={AdminInvoices} />
                  <Route path="/admin/users" component={AdminUsers} />
                  <Route path="/admin/policies" component={AdminPolicies} />
                </>
              )}

              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
