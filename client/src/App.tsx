import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import Pcs from "@/pages/Pcs";
import Users from "@/pages/Users";
import Sessions from "@/pages/Sessions";
import Auth from "@/pages/Auth";
import { Loader2 } from "lucide-react";

function PrivateRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  return <Component {...rest} />;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto h-screen relative">
        <div className="max-w-7xl mx-auto p-6 md:p-10 pb-20">
          {children}
        </div>
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </main>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      
      {/* Protected Routes */}
      <Route path="/">
        <PrivateRoute component={() => <MainLayout><Dashboard /></MainLayout>} />
      </Route>
      <Route path="/pcs">
        <PrivateRoute component={() => <MainLayout><Pcs /></MainLayout>} />
      </Route>
      <Route path="/users">
        <PrivateRoute component={() => <MainLayout><Users /></MainLayout>} />
      </Route>
      <Route path="/sessions">
        <PrivateRoute component={() => <MainLayout><Sessions /></MainLayout>} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
