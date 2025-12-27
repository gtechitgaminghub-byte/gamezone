import { usePcs } from "@/hooks/use-pcs";
import { useStats } from "@/hooks/use-stats";
import { PcCard } from "@/components/PcCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Monitor, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { pcs, isLoading: pcsLoading } = usePcs();
  const { data: stats } = useStats();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-glow">DASHBOARD</h2>
          <p className="text-muted-foreground">System Overview & Status</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-primary">System Online</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">$ {stats?.totalRevenue || "0.00"}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-glow-cyan">{stats?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Currently playing</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total PCs</CardTitle>
            <Monitor className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{stats?.totalPcs || 0}</div>
            <p className="text-xs text-muted-foreground">{pcs?.filter(pc => pc.status === 'online').length} Online</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+2 since yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-white/80">Active Units</h3>
        {pcsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
               <div key={i} className="h-48 rounded-xl bg-card/30 animate-pulse" />
             ))}
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pcs?.map((pc) => (
              <motion.div key={pc.id} variants={item}>
                <PcCard pc={pc} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
