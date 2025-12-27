import { Monitor, Wifi, Clock, MoreVertical, Play, Power, Edit, Trash } from "lucide-react";
import { type Pc, type User } from "@shared/schema";
import { StatusBadge } from "./StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSessions } from "@/hooks/use-sessions";
import { useUsers } from "@/hooks/use-users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { usePcs } from "@/hooks/use-pcs";
import { useToast } from "@/hooks/use-toast";

interface PcCardProps {
  pc: Pc;
}

const startSessionSchema = z.object({
  userId: z.coerce.number().min(1, "User is required"),
  assignedMinutes: z.coerce.number().min(15, "Minimum 15 minutes"),
});

export function PcCard({ pc }: PcCardProps) {
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { createSession } = useSessions();
  const { users } = useUsers();
  const { deletePc, updatePc } = usePcs();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof startSessionSchema>>({
    resolver: zodResolver(startSessionSchema),
    defaultValues: {
      assignedMinutes: 60,
    },
  });

  const onStartSession = (data: z.infer<typeof startSessionSchema>) => {
    createSession.mutate(
      {
        pcId: pc.id,
        userId: data.userId,
        assignedMinutes: data.assignedMinutes,
        status: "active",
      },
      {
        onSuccess: () => {
          setStartDialogOpen(false);
          form.reset();
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this PC?")) {
      deletePc.mutate(pc.id);
    }
  };

  const handleToggleStatus = () => {
    updatePc.mutate({
      id: pc.id,
      status: pc.status === "offline" ? "online" : "offline",
    });
  };

  return (
    <div className="group relative bg-card border border-white/10 rounded-xl p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            p-2.5 rounded-lg 
            ${pc.status === 'online' ? 'bg-green-500/10 text-green-500' : 
              pc.status === 'in_session' ? 'bg-blue-500/10 text-blue-500 animate-pulse' : 
              'bg-zinc-800 text-zinc-500'}
          `}>
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg leading-tight">{pc.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="font-mono">{pc.ipAddress || "NO IP"}</span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-white/10 text-foreground">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" /> Edit PC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              <Power className="w-4 h-4 mr-2" /> 
              {pc.status === 'offline' ? 'Wake Up' : 'Shutdown'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500 focus:text-red-400" onClick={handleDelete}>
              <Trash className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <StatusBadge status={pc.status} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Wifi className="w-3 h-3" /> Latency
          </span>
          <span className="font-mono text-xs">{Math.floor(Math.random() * 20) + 5}ms</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Last Seen
          </span>
          <span className="text-xs">
            {pc.lastPing ? formatDistanceToNow(new Date(pc.lastPing), { addSuffix: true }) : 'Never'}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        {pc.status === "in_session" ? (
          <Button className="w-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/20" disabled>
            Currently In Session
          </Button>
        ) : (
          <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                disabled={pc.status === "offline"}
              >
                <Play className="w-4 h-4 mr-2 fill-current" /> Start Session
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Start Session on {pc.name}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onStartSession)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((u) => (
                              <SelectItem key={u.id} value={String(u.id)}>
                                {u.username} ({u.balanceMinutes}m)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assignedMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={createSession.isPending}>
                      {createSession.isPending ? "Starting..." : "Start Session"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
