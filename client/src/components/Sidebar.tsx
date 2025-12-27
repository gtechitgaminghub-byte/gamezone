import { Link, useLocation } from "wouter";
import { LayoutDashboard, Monitor, Users, History, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Monitor, label: "PCs", href: "/pcs" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: History, label: "Sessions", href: "/sessions" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border/50 sticky top-0">
      <div className="p-6 border-b border-white/5">
        <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          GAMESYNC
        </h1>
        <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">Manager v2.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                ${isActive(item.href) 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_var(--primary)]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium tracking-wide">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-black">
            {user?.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground uppercase">{user?.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/50"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
