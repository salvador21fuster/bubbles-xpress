import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import ShopDashboard from "@/pages/shop/Dashboard";
import ShopIntake from "@/pages/shop/Intake";
import ShopProcessing from "@/pages/shop/Processing";
import ShopOrders from "@/pages/shop/Orders";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminUsers from "@/pages/admin/Users";
import AdminPolicies from "@/pages/admin/Policies";
import AdminInvoices from "@/pages/admin/Invoices";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CustomerNewOrder from "@/pages/customer/NewOrder";
import CustomerOrderDetails from "@/pages/customer/OrderDetails";
import DriverDashboard from "@/pages/driver/Dashboard";
import DriverOrderDetails from "@/pages/driver/OrderDetails";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

function Router() {
  const { isAuthenticated, isLoading, isCustomer, isDriver, isShop, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Customer and Driver apps use mobile-first layout (no sidebar)
  if (isCustomer || isDriver) {
    return (
      <Switch>
        {/* Customer Routes */}
        {isCustomer && (
          <>
            <Route path="/customer" component={CustomerDashboard} />
            <Route path="/customer/new-order" component={CustomerNewOrder} />
            <Route path="/customer/orders/:id" component={CustomerOrderDetails} />
            <Route path="/" component={CustomerDashboard} />
          </>
        )}

        {/* Driver Routes */}
        {isDriver && (
          <>
            <Route path="/driver" component={DriverDashboard} />
            <Route path="/driver/orders/:id" component={DriverOrderDetails} />
            <Route path="/" component={DriverDashboard} />
          </>
        )}

        <Route component={NotFound} />
      </Switch>
    );
  }

  // Sidebar layout for Shop and Admin users
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
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              {/* Shop Routes */}
              {isShop && (
                <>
                  <Route path="/shop" component={ShopDashboard} />
                  <Route path="/shop/intake" component={ShopIntake} />
                  <Route path="/shop/processing" component={ShopProcessing} />
                  <Route path="/shop/orders" component={ShopOrders} />
                  <Route path="/" component={ShopDashboard} />
                </>
              )}
              
              {/* Admin Routes */}
              {isAdmin && (
                <>
                  <Route path="/admin" component={AdminDashboard} />
                  <Route path="/admin/transactions" component={AdminTransactions} />
                  <Route path="/admin/invoices" component={AdminInvoices} />
                  <Route path="/admin/users" component={AdminUsers} />
                  <Route path="/admin/policies" component={AdminPolicies} />
                  <Route path="/" component={AdminDashboard} />
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
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
