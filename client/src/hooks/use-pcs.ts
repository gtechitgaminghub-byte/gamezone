import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertPc } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePcs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pcs, isLoading } = useQuery({
    queryKey: [api.pcs.list.path],
    queryFn: async () => {
      const res = await fetch(api.pcs.list.path);
      if (!res.ok) throw new Error("Failed to fetch PCs");
      return api.pcs.list.responses[200].parse(await res.json());
    },
  });

  const createPc = useMutation({
    mutationFn: async (data: InsertPc) => {
      const res = await fetch(api.pcs.create.path, {
        method: api.pcs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create PC");
      return api.pcs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pcs.list.path] });
      toast({ title: "Success", description: "PC added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePc = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertPc>) => {
      const url = buildUrl(api.pcs.update.path, { id });
      const res = await fetch(url, {
        method: api.pcs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update PC");
      return api.pcs.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pcs.list.path] });
      toast({ title: "Success", description: "PC updated successfully" });
    },
  });

  const deletePc = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.pcs.delete.path, { id });
      const res = await fetch(url, { method: api.pcs.delete.method });
      if (!res.ok) throw new Error("Failed to delete PC");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pcs.list.path] });
      toast({ title: "Success", description: "PC deleted successfully" });
    },
  });

  return { pcs, isLoading, createPc, updatePc, deletePc };
}
