"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
    Search,
    CheckCircle2,
    Clock,
    Circle,
    LucideIcon,
    ArrowLeft,
    Inbox,
    ArrowRight,
    Filter,
    X,
    Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { useMe } from "@/hooks/useMe";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Ticket = {
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    owner: { id: string; email: string };
    rating?: number;
    assignee?: { id: string; email: string } | null;
};

const STATUS_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
    OPEN: { icon: Circle, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    IN_PROGRESS: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    RESOLVED: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};

const PRIORITY_CONFIG: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export default function AssignedTicketsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: user, isLoading: userLoading } = useMe();
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
    const [showFilters, setShowFilters] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const pageSize = 20;

    // Redirect non-agents
    React.useEffect(() => {
        if (user && user.role !== "SUPPORT_AGENT") {
            router.replace("/dashboard");
        }
    }, [user, router]);

    const { data: ticketsData, isLoading } = useQuery({
        queryKey: ["assigned-tickets", search, statusFilter, priorityFilter, page],
        queryFn: async () => {
            const params: Record<string, string> = { 
                assigned: "true",
                page: page.toString(),
                size: pageSize.toString(),
                sort: "createdAt,desc"
            };
            if (search) params.search = search;
            if (statusFilter !== "all") params.status = statusFilter;
            if (priorityFilter !== "all") params.priority = priorityFilter;
            const res = await api.get("/api/tickets/search", { params });
            return res.data;
        },
        enabled: !!user && user.role === "SUPPORT_AGENT",
    });

    // Reset page when filters change
    React.useEffect(() => {
        setPage(0);
    }, [search, statusFilter, priorityFilter]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
            await api.put(`/api/tickets/${ticketId}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assigned-tickets"] });
            toast({ title: "Status updated" });
        },
        onError: () => {
            toast({ title: "Failed to update status", variant: "destructive" });
        },
    });

    const tickets: Ticket[] = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.content || []);
    const totalElements = ticketsData?.totalElements || tickets.length;
    const totalPages = ticketsData?.totalPages || 1;
    const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all";

    if (userLoading || (user && user.role !== "SUPPORT_AGENT")) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
                {/* Header */}
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
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">Agent</p>
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Assigned Tickets</h1>
                        </div>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {totalElements} ticket{totalElements !== 1 ? "s" : ""} assigned to you
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
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex flex-wrap items-center gap-3"
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
                                    onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); }}
                                    className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                    Clear
                                </button>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {/* Tickets List */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-6">
                            <Inbox className="h-10 w-10 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {hasActiveFilters ? "No tickets match your filters" : "No assigned tickets"}
                        </h3>
                        <p className="mt-2 max-w-sm text-zinc-500 dark:text-zinc-400">
                            {hasActiveFilters
                                ? "Try adjusting your filters."
                                : "You don't have any tickets assigned to you yet."}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); }}
                                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                <X className="h-4 w-4" />
                                Clear Filters
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        {tickets.map((ticket, index) => {
                            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                            const StatusIcon = status.icon;

                            return (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", status.bg)}>
                                                <StatusIcon className={cn("h-5 w-5", status.color)} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 
                                                        className="font-medium text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                                        onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                                                    >
                                                        {ticket.title}
                                                    </h3>
                                                    {ticket.rating && (
                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star 
                                                                    key={i} 
                                                                    className={cn(
                                                                        "h-3 w-3",
                                                                        i < (ticket.rating || 0)
                                                                            ? "fill-yellow-500 text-yellow-500"
                                                                            : "text-zinc-300"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                    <span>#{ticket.id.slice(0, 8)}</span>
                                                    <span>•</span>
                                                    <span>{ticket.owner?.email}</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={cn("text-xs font-medium px-3 py-1.5 rounded-full", PRIORITY_CONFIG[ticket.priority])}>
                                                {ticket.priority}
                                            </span>
                                            
                                            {/* Status Dropdown */}
                                            <Select
                                                defaultValue={ticket.status}
                                                onValueChange={(val) => {
                                                    if (val !== ticket.status) {
                                                        updateStatusMutation.mutate({ ticketId: ticket.id, status: val });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className={cn("h-8 w-[130px] border-none text-xs font-medium rounded-full", status.bg, status.color)}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ticket.status === "OPEN" && (
                                                        <>
                                                            <SelectItem value="OPEN">Open</SelectItem>
                                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                        </>
                                                    )}
                                                    {ticket.status === "IN_PROGRESS" && (
                                                        <>
                                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                            <SelectItem value="OPEN">Reopen</SelectItem>
                                                        </>
                                                    )}
                                                    {ticket.status === "RESOLVED" && (
                                                        <>
                                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                            <SelectItem value="OPEN">Reopen</SelectItem>
                                                        </>
                                                    )}
                                                </SelectContent>
                                            </Select>

                                            <button
                                                onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <ArrowRight className="h-4 w-4 text-zinc-400" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800"
                    >
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
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
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages - 1}
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
