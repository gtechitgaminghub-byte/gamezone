import { useSessions } from "@/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { StopCircle } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Sessions() {
  const [filter, setFilter] = useState<"all" | "active">("active");
  const { sessions, endSession, isLoading } = useSessions(filter === "active");

  const handleEndSession = (id: number) => {
    if (confirm("End this session immediately?")) {
      endSession.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-glow">SESSION LOGS</h2>
          <p className="text-muted-foreground">Monitor active and past gameplay</p>
        </div>
        
        <Tabs defaultValue="active" onValueChange={(v) => setFilter(v as "all" | "active")}>
          <TabsList className="bg-card border border-white/10">
            <TabsTrigger value="active">Active Now</TabsTrigger>
            <TabsTrigger value="all">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-card/50 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>PC Name</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading sessions...</TableCell>
              </TableRow>
            ) : sessions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No sessions found</TableCell>
              </TableRow>
            ) : (
              sessions?.map((session) => (
                <TableRow key={session.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-bold font-display">{session.pc?.name || "Unknown PC"}</TableCell>
                  <TableCell>{session.user?.username || "Unknown User"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {session.startTime && format(new Date(session.startTime), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{session.assignedMinutes} min</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={session.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {session.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20"
                        onClick={() => handleEndSession(session.id)}
                        disabled={endSession.isPending}
                      >
                        <StopCircle className="w-4 h-4 mr-1" /> End
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
