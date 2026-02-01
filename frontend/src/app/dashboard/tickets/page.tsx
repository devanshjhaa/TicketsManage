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
  RefreshCw,
  CheckCircle2,
  Clock,
  Circle,
  LucideIcon,
  X,
  ArrowLeft
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { useMe } from "@/hooks/useMe";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  description?: string;
};

// --- API Call ---
async function fetchMyTickets(search: string, status: string, priority: string, page: number, size: number) {
  const params: Record<string, string | number> = { mine: "true", page, size, sort: "createdAt,desc" };
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  if (priority && priority !== "all") params.priority = priority;

  const res = await api.get("/api/tickets/search", { params });
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
  OPEN: { icon: Circle, color: "text-blue-500", label: "Open" },
  IN_PROGRESS: { icon: Clock, color: "text-amber-500", label: "In Progress" },
  RESOLVED: { icon: CheckCircle2, color: "text-emerald-500", label: "Resolved" },
};

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  LOW: { color: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400" },
  MEDIUM: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  HIGH: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  URGENT: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};


export default function MyTicketsPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useMe();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [showFilters, setShowFilters] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const pageSize = 20;
  const debouncedSearch = useDebounce(search, 300);

  // Redirect ADMIN users away from My Tickets page
  React.useEffect(() => {
    if (user && user.role === "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["my-tickets", debouncedSearch, statusFilter, priorityFilter, page],
    queryFn: () => fetchMyTickets(debouncedSearch, statusFilter, priorityFilter, page, pageSize),
    enabled: !!user && user.role !== "ADMIN",
  });

  // Show loading while checking user role
  if (userLoading || (user && user.role === "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Extract list from Page response or Array
  const tickets: Ticket[] = Array.isArray(data) ? data : (data?.content || []);

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all";

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
  };

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </button>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">Support</p>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">My Tickets</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              title="Refresh tickets"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push("/dashboard/tickets/new")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="border-none bg-transparent pl-11 focus-visible:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
            <Button
              variant={showFilters ? "secondary" : "ghost"}
              size="sm"
              className="text-zinc-600 dark:text-zinc-400"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-xs text-zinc-100 dark:text-zinc-900">
                  {(statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          {/* Filter Dropdowns */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-3 overflow-hidden"
              >
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] rounded-xl border-zinc-200 dark:border-zinc-700">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px] rounded-xl border-zinc-200 dark:border-zinc-700">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-6">
              <TicketIcon className="h-10 w-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {hasActiveFilters ? "No tickets match your filters" : "No tickets yet"}
            </h3>
            <p className="mt-2 max-w-sm text-zinc-500 dark:text-zinc-400">
              {hasActiveFilters
                ? "Try adjusting your filters or create a new ticket."
                : "Create your first support ticket to get started."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => router.push("/dashboard/tickets/new")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create First Ticket
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={containerAnimations}
            initial="hidden"
            animate="show"
          >
            {tickets.map((ticket) => {
              const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;

              return (
                <motion.div
                  key={ticket.id}
                  variants={itemAnimations}
                  onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                  className="group cursor-pointer rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", status.color.replace("text-", "bg-").replace("500", "100"), "dark:" + status.color.replace("text-", "bg-").replace("500", "900/30"))}>
                        <status.icon className={cn("h-5 w-5", status.color)} />
                      </div>
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          {ticket.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <span>#{ticket.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-full",
                        PRIORITY_CONFIG[ticket.priority]?.color
                      )}>
                        {ticket.priority}
                      </span>
                      <span className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-full",
                        status.color.replace("text-", "bg-").replace("500", "100"),
                        status.color
                      )}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {data && !Array.isArray(data) && data.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Showing {data.content?.length || 0} of {data.totalElements || 0} tickets
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 px-3">
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.totalPages - 1}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
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
