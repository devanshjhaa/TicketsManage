"use client";

import { useMe } from "@/hooks/useMe";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
  ArrowRight,
  LucideIcon,
  Circle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// --- Types ---

interface DashboardTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  owner: { id: string; email: string };
}

// --- Status Config ---
const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  OPEN: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  IN_PROGRESS: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  RESOLVED: { color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};

// --- Components ---

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  loading,
  index,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  loading: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
    >
      <div className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10", gradient)} />
      <div className="relative">
        <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl", gradient)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {value}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ ticket, index }: { ticket: DashboardTicket; index: number }) {
  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link
        href={`/dashboard/tickets/${ticket.id}`}
        className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
            <TicketIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
              {ticket.title}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.owner?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusConfig.bg, statusConfig.color)}>
            {ticket.status.replace("_", " ")}
          </span>
          <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    </motion.div>
  );
}

// --- Fetchers ---

import { AnalyticsCharts, AdminDashboardData } from "@/components/dashboard/AnalyticsCharts";

const fetchUserStats = async () => {
  const [total, open, resolved] = await Promise.all([
    api.get("/api/tickets/search?mine=true&page=0&size=1"),
    api.get("/api/tickets/search?mine=true&status=OPEN&page=0&size=1"),
    api.get("/api/tickets/search?mine=true&status=RESOLVED&page=0&size=1"),
  ]);

  return {
    total: total.data.totalElements,
    open: open.data.totalElements,
    resolved: resolved.data.totalElements,
  };
};

const fetchAgentStats = async () => {
  const [total, open, resolved] = await Promise.all([
    api.get("/api/tickets/search?assigned=true&page=0&size=1"),
    api.get("/api/tickets/search?assigned=true&status=OPEN&page=0&size=1"),
    api.get("/api/tickets/search?assigned=true&status=RESOLVED&page=0&size=1"),
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

const fetchUserRecentActivity = async (): Promise<DashboardTicket[]> => {
  const res = await api.get("/api/tickets/search?mine=true&page=0&size=5&sort=createdAt,desc");
  return res.data.content;
};

const fetchAgentRecentActivity = async (): Promise<DashboardTicket[]> => {
  const res = await api.get("/api/tickets/search?assigned=true&page=0&size=5&sort=createdAt,desc");
  return res.data.content;
};

const fetchAdminRecentActivity = async (): Promise<DashboardTicket[]> => {
  const res = await api.get("/api/tickets?page=0&size=5&sort=createdAt,desc");
  return res.data.content;
};

export default function DashboardPage() {
  const { data: user } = useMe();
  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "SUPPORT_AGENT";

  // User Stats (regular users)
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ["dashboard-stats-user"],
    queryFn: fetchUserStats,
    enabled: !!user && !isAdmin && !isAgent,
    refetchInterval: 30000,
  });

  // Agent Stats
  const { data: agentStats, isLoading: agentStatsLoading } = useQuery({
    queryKey: ["dashboard-stats-agent"],
    queryFn: fetchAgentStats,
    enabled: !!isAgent,
    refetchInterval: 30000,
  });

  // Admin Stats
  const { data: adminStats, isLoading: adminStatsLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminStats,
    enabled: !!isAdmin,
    refetchInterval: 30000,
  });

  // Calculate stats based on role
  let stats;
  let statsLoading;
  if (isAdmin) {
    stats = {
      total: (adminStats?.totalActive || 0) + (adminStats?.totalDeleted || 0),
      open: adminStats?.statusCounts?.OPEN || 0,
      resolved: adminStats?.statusCounts?.RESOLVED || 0,
    };
    statsLoading = adminStatsLoading;
  } else if (isAgent) {
    stats = agentStats;
    statsLoading = agentStatsLoading;
  } else {
    stats = userStats;
    statsLoading = userStatsLoading;
  }

  // Recent activity based on role
  const { data: recentTickets, isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activity", user?.role],
    queryFn: () => {
      if (isAdmin) return fetchAdminRecentActivity();
      if (isAgent) return fetchAgentRecentActivity();
      return fetchUserRecentActivity();
    },
    enabled: !!user,
  });

  // Determine the "View all" link based on role
  const viewAllLink = isAdmin 
    ? "/dashboard/admin/tickets" 
    : isAgent 
    ? "/dashboard/agent/tickets" 
    : "/dashboard/tickets";

  const greeting = isAdmin 
    ? "Administrator Dashboard" 
    : isAgent 
    ? "Support Agent Dashboard" 
    : "My Dashboard";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="tracking-widest uppercase">{user?.role?.replace("_", " ")}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {greeting}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Welcome back, {user?.firstName || user?.email?.split("@")[0]}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard
            title="Total Tickets"
            value={stats?.total || 0}
            icon={BarChart3}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            loading={statsLoading}
            index={0}
          />
          <StatCard
            title="Open Issues"
            value={stats?.open || 0}
            icon={Clock}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            loading={statsLoading}
            index={1}
          />
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle2}
            gradient="bg-gradient-to-br from-emerald-500 to-green-500"
            loading={statsLoading}
            index={2}
          />
        </div>

        {/* Admin Analytics */}
        {isAdmin && adminStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Analytics Overview
            </h2>
            <AnalyticsCharts data={adminStats} />
          </motion.div>
        )}

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Recent Activity
              </h2>
              <Link
                href={viewAllLink}
                className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {activityLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              ) : recentTickets?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <TicketIcon className="h-6 w-6 text-zinc-400" />
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">No tickets yet</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                    {isAdmin || isAgent ? "All caught up!" : "Create your first ticket to get started"}
                  </p>
                </div>
              ) : (
                recentTickets?.map((ticket, i) => (
                  <ActivityItem key={ticket.id} ticket={ticket} index={i} />
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* User Profile Card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-4">
                Your Profile
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 text-zinc-600 dark:text-zinc-300 text-lg font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {user?.firstName || user?.email?.split("@")[0]}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/profile"
                className="mt-4 block w-full text-center py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                View Profile
              </Link>
            </div>

            {/* Quick Actions Card */}
            {!isAdmin && !isAgent && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-4">
                  Quick Actions
                </h3>
                <Link
                  href="/dashboard/tickets/new"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  <Circle className="h-4 w-4" />
                  Create New Ticket
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
