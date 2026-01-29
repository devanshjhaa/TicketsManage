"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Circle,
  LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type Ticket = {
  id: string; // Changed to string UUID based on entity
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  description?: string;
};

// --- Mock Data or API Calls ---

async function fetchMyTickets(search: string) {
  // Pass search param as 'q' or 'search' to match backend specification
  const res = await api.get("/api/tickets/my", {
    params: search ? { q: search } : {},
  });
  // Handle Page<TicketResponse> structure: { content: [], ... }
  return res.data;
}

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

// --- Status & Priority Config ---

const STATUS_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  OPEN: { icon: Circle, color: "text-zinc-500", label: "Open" },
  IN_PROGRESS: { icon: Clock, color: "text-amber-500", label: "In Progress" },
  RESOLVED: { icon: CheckCircle2, color: "text-emerald-500", label: "Resolved" },
  CLOSED: { icon: CheckCircle2, color: "text-zinc-400", label: "Closed" },
};

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  LOW: { color: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400" },
  MEDIUM: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  HIGH: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  URGENT: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};


export default function MyTicketsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["my-tickets", debouncedSearch],
    queryFn: () => fetchMyTickets(debouncedSearch),
  });

  // Extract list from Page response or Array
  const tickets: Ticket[] = Array.isArray(data) ? data : (data?.content || []);

  const containerAnimations = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemAnimations = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Tickets</h1>
          <p className="text-muted-foreground">Manage and track your support requests</p>
        </div>
        <Button onClick={() => router.push("/tickets/new")} className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="border-none bg-transparent pl-9 focus-visible:ring-0"
          />
        </div>
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Filter className="mr-2 h-3.5 w-3.5" />
          Filter
        </Button>
      </div>

      {/* List View */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          ))}
        </div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={containerAnimations}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {tickets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground"
              >
                <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                  <TicketIcon className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">No tickets found</h3>
                <p className="text-sm">Create a new ticket or adjust your filters.</p>
              </motion.div>
            ) : (
              tickets.map((ticket) => {
                const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;

                return (
                  <motion.div
                    key={ticket.id}
                    variants={itemAnimations}
                    layoutId={ticket.id}
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                    className="group relative flex cursor-pointer items-center justify-between rounded-xl border border-transparent bg-white p-4 shadow-sm transition-all hover:border-zinc-200 hover:shadow-md dark:bg-zinc-950/40 dark:hover:border-zinc-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900", status.color)}>
                        <status.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{ticket.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{ticket.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className={cn("rounded-md px-2 py-0.5 font-normal", PRIORITY_CONFIG[ticket.priority]?.color)}>
                        {ticket.priority}
                      </Badge>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function TicketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  )
}
