"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Search,
    CheckCircle2,
    Clock,
    Circle,
    LucideIcon,
    Eye,
    UserPlus,
    ArrowLeft
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { useMe } from "@/hooks/useMe";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    assignee?: { id: string; email: string } | null;
};

type User = {
    id: string;
    email: string;
    role: string;
};

const STATUS_CONFIG: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
    OPEN: { icon: Circle, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    IN_PROGRESS: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
    RESOLVED: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
};

const PRIORITY_CONFIG: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export default function AllTicketsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: user, isLoading: userLoading } = useMe();
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
    const [page, setPage] = React.useState(0);
    const pageSize = 20;
    const debouncedSearch = useDebounce(search, 300);

    // Reset page when filters change
    React.useEffect(() => {
        setPage(0);
    }, [debouncedSearch, statusFilter, priorityFilter]);

    // Redirect non-admins
    React.useEffect(() => {
        if (user && user.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, router]);

    const { data: ticketsData, isLoading } = useQuery({
        queryKey: ["all-tickets", debouncedSearch, statusFilter, priorityFilter, page],
        queryFn: async () => {
            const params: Record<string, string> = {
                page: page.toString(),
                size: pageSize.toString(),
                sort: "createdAt,desc"
            };
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
            if (statusFilter !== "all") params.status = statusFilter;
            if (priorityFilter !== "all") params.priority = priorityFilter;
            const res = await api.get("/api/tickets/search", { params });
            return res.data;
        },
        enabled: !!user && user.role === "ADMIN",
    });

    const { data: users } = useQuery<User[]>({
        queryKey: ["users-for-assign"],
        queryFn: async () => (await api.get("/api/users")).data,
    });

    const assignMutation = useMutation({
        mutationFn: async ({ ticketId, assigneeId }: { ticketId: string; assigneeId: string }) => {
            await api.post(`/api/tickets/${ticketId}/assign`, { assigneeId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
            toast({ title: "Ticket assigned successfully" });
        },
        onError: (error: unknown) => {
            // Check if this is actually a success disguised as error (network/parsing issue)
            console.error("Assign error:", error);
            // Refetch anyway in case it succeeded
            queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
            toast({ title: "Failed to assign ticket", variant: "destructive" });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
            await api.put(`/api/tickets/${ticketId}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
            toast({ title: "Status updated" });
        },
        onError: () => {
            toast({ title: "Failed to update status", variant: "destructive" });
        },
    });

    const tickets: Ticket[] = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.content || []);
    // Only SUPPORT_AGENT can be assigned to tickets (not ADMIN)
    const agents = users?.filter(u => u.role === "SUPPORT_AGENT") || [];

    // Show loading while checking role
    if (userLoading || (user && user.role !== "ADMIN")) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">All Tickets</h1>
                    <p className="text-muted-foreground">View and manage all tickets in the system</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tickets..."
                        className="pl-9"
                    />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
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
                    <SelectTrigger className="w-[150px]">
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
            </div>

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[300px]">Ticket</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))
                        ) : tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    No tickets found
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => {
                                const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                                return (
                                    <TableRow key={ticket.id} className="group">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground line-clamp-1">{ticket.title}</p>
                                                <p className="text-xs text-muted-foreground">#{ticket.id.slice(0, 8)}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {ticket.owner?.email}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                defaultValue={ticket.status}
                                                onValueChange={(val) => {
                                                    if (val !== ticket.status) {
                                                        updateStatusMutation.mutate({ ticketId: ticket.id, status: val });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className={cn("h-8 w-[130px] border-none text-xs font-medium", status.bgColor, status.color)}>
                                                    <status.icon className="mr-1.5 h-3 w-3" />
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
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={cn("text-xs", PRIORITY_CONFIG[ticket.priority])}>
                                                {ticket.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={ticket.assignee?.id || "unassigned"}
                                                onValueChange={(val) => {
                                                    // Don't assign if selecting same person or "unassigned"
                                                    if (val !== "unassigned" && val !== ticket.assignee?.id) {
                                                        assignMutation.mutate({ ticketId: ticket.id, assigneeId: val });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[160px] text-xs">
                                                    <UserPlus className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                                    <SelectValue>
                                                        {ticket.assignee ? ticket.assignee.email : "Unassigned"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned" disabled>Unassigned</SelectItem>
                                                    {agents.map(agent => (
                                                        <SelectItem key={agent.id} value={agent.id}>
                                                            {agent.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {ticketsData && (
                <div className="flex items-center justify-between px-2 py-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {ticketsData.content?.length || 0} of {ticketsData.totalElements || 0} tickets
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page + 1} of {ticketsData.totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= (ticketsData.totalPages || 1) - 1}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
