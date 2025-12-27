import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSession } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSessions(activeOnly = false) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sessions, isLoading } = useQuery({
    queryKey: [api.sessions.list.path, activeOnly],
    queryFn: async () => {
      const url = activeOnly 
        ? `${api.sessions.list.path}?active=true` 
        : api.sessions.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return api.sessions.list.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s to update timers
  });

  const createSession = useMutation({
    mutationFn: async (data: InsertSession) => {
      const res = await fetch(api.sessions.create.path, {
        method: api.sessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to start session");
      return api.sessions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.pcs.list.path] });
      toast({ title: "Session Started", description: "PC is now active" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const endSession = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.sessions.end.path, { id });
      const res = await fetch(url, { method: api.sessions.end.method });
      if (!res.ok) throw new Error("Failed to end session");
      return api.sessions.end.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.pcs.list.path] });
      toast({ title: "Session Ended", description: "PC is now available" });
    },
  });

  return { sessions, isLoading, createSession, endSession };
}
