"use client";

import AppShell from "@/components/layout/AppShell";
import { useMe } from "@/hooks/useMe";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// --- Types ---

interface DashboardTicket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  ownerEmail: string;
}

// --- Components ---

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {value}
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-lg p-2 ${color} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ ticket, index }: { ticket: DashboardTicket; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group flex items-center justify-between border-b border-zinc-100 py-3 last:border-0 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
          <TicketIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground group-hover:underline">
            <Link href={`/tickets/${ticket.id}`}>{ticket.title}</Link>
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.ownerEmail}
          </p>
        </div>
      </div>
      <Badge variant="outline" className="text-xs">
        {ticket.status}
      </Badge>
    </motion.div>
  );
}

// --- Fetchers ---

import { AnalyticsCharts, AdminDashboardData } from "@/components/dashboard/AnalyticsCharts";

// ... existing imports

// --- Fetchers ---

const fetchStats = async () => {
  // Parallel fetch to get counts from metadata (page.totalElements)
  const [total, open, resolved] = await Promise.all([
    api.get("/api/tickets?page=0&size=1"),
    api.get("/api/tickets/search?status=OPEN&page=0&size=1"),
    api.get("/api/tickets/search?status=RESOLVED&page=0&size=1"),
  ]);

  return {
    total: total.data.totalElements,
    open: open.data.totalElements,
    resolved: resolved.data.totalElements,
  };
};

const fetchAdminStats = async () => {
  const res = await api.get("/api/tickets/admin/dashboard");
  return res.data as AdminDashboardData;
};

const fetchRecentActivity = async (): Promise<DashboardTicket[]> => {
  const res = await api.get("/api/tickets?page=0&size=5&sort=createdAt,desc");
  return res.data.content;
};

export default function DashboardPage() {
  const { data: user } = useMe();
  const isAdmin = user?.role === "ADMIN";

  // User/Agent Stats
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStats,
    enabled: !isAdmin,
    refetchInterval: 30000,
  });

  // Admin Stats
  const { data: adminStats, isLoading: adminStatsLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminStats,
    enabled: !!isAdmin,
    refetchInterval: 30000,
  });

  const stats = isAdmin ? {
    total: (adminStats?.totalActive || 0) + (adminStats?.totalDeleted || 0), // Estimate total
    open: adminStats?.statusCounts?.OPEN || 0,
    resolved: adminStats?.statusCounts?.RESOLVED || 0,
  } : userStats;

  const statsLoading = isAdmin ? adminStatsLoading : userStatsLoading;

  const { data: recentTickets, isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
  });

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your support ticketing system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Tickets"
          value={stats?.total || 0}
          icon={BarChart3}
          color="bg-primary"
          loading={statsLoading}
        />
        <StatCard
          title="Open Issues"
          value={stats?.open || 0}
          icon={Clock}
          color="bg-amber-500"
          loading={statsLoading}
        />
        <StatCard
          title="Resolved"
          value={stats?.resolved || 0}
          icon={CheckCircle2}
          color="bg-emerald-500"
          loading={statsLoading}
        />
      </div>

      {/* Admin Analytics */}
      {isAdmin && adminStats && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Analytics Overview</h2>
          <AnalyticsCharts data={adminStats} />
        </div>
      )}

      {/* Recent Activity */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {/* Main Feed */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h2>
            <Link
              href="/tickets"
              className="flex items-center text-sm text-primary hover:underline"
            >
              View all <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-1">
            {activityLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
              : recentTickets?.map((ticket, i) => (
                <ActivityItem key={ticket.id} ticket={ticket} index={i} />
              ))}
          </div>
        </div>

        {/* User Profile / Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="font-semibold text-foreground">Your Profile</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-medium text-foreground">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role?.toLowerCase().replace("role_", "") || "User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
