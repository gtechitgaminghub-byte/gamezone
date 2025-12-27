import { cn } from "@/lib/utils";

type StatusType = "online" | "offline" | "in_session" | "active" | "completed";

const variants: Record<StatusType, string> = {
  online: "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_-4px_#22c55e]",
  offline: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  in_session: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_-4px_#3b82f6]",
  active: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_-4px_var(--primary)]",
  completed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const labels: Record<StatusType, string> = {
  online: "Online",
  offline: "Offline",
  in_session: "In Session",
  active: "Active",
  completed: "Completed",
};

export function StatusBadge({ status, className }: { status: string, className?: string }) {
  // Safe cast or fallback
  const s = (status as StatusType) || "offline";
  const variantClass = variants[s] || variants.offline;
  
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider", variantClass, className)}>
      {labels[s] || status}
    </span>
  );
}
