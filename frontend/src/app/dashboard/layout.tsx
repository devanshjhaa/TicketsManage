"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Ticket,
    LogOut,
    Menu,
    X,
    Shield,
    User,
    TicketCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useMe";
import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const NAVIGATION = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tickets', href: '/dashboard/tickets', icon: Ticket, roles: ['USER'] },
    { name: 'Assigned Tickets', href: '/dashboard/agent/tickets', icon: TicketCheck, roles: ['SUPPORT_AGENT'] },
    { name: 'Admin Panel', href: '/dashboard/admin', icon: Shield, roles: ['ADMIN'] },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: user } = useMe();
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await api.post("/api/auth/logout");
        },
        onSuccess: () => {
            localStorage.removeItem("accessToken");
            document.cookie = "accessToken=; path=/; max-age=0";
            queryClient.clear();
            router.push("/login");
        },
        onError: () => {
            localStorage.removeItem("accessToken");
            document.cookie = "accessToken=; path=/; max-age=0";
            router.push("/login");
        },
    });

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const filteredNav = NAVIGATION.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(user?.role || '');
    });

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white/80 backdrop-blur-xl transition-transform dark:border-zinc-800 dark:bg-zinc-950/80 lg:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                                <TicketCheck className="h-4 w-4" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">TicketsManage</span>
                        </div>
                        <button
                            className="ml-auto lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 p-4">
                        {filteredNav.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-primary/10 text-primary dark:bg-primary/20"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                                    )}
                                >
                                    <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-600")} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 h-full w-1 rounded-r-full bg-primary"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Footer */}
                    <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                        {user && (
                            <Link
                                href="/dashboard/profile"
                                className="mb-4 flex items-center gap-3 rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-900/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {user.email.split('@')[0]}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">{user.role}</p>
                                </div>
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                            className="w-full justify-start text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:text-red-400"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            {logoutMutation.isPending ? "Logging out..." : "Log out"}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col lg:pl-64">
                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 lg:hidden">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="-ml-2 p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="ml-2 font-semibold">TicketsManage</span>
                    </div>
                </div>

                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
