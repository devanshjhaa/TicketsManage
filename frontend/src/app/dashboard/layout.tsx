"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Ticket,
    LogOut,
    Menu,
    X,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useMe";



const NAVIGATION = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tickets', href: '/tickets', icon: Ticket },
    { name: 'Users', href: '/admin/users', icon: Shield, adminOnly: true },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: user } = useMe();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                        <span className="text-lg font-semibold tracking-tight">TicketsManage</span>
                        <button
                            className="ml-auto lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 p-4">
                        {NAVIGATION.filter(item => !item.adminOnly || user?.role === 'ADMIN').map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                                    )}
                                >
                                    <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-500")} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 h-8 w-1 rounded-r-full bg-primary"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                        <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-destructive dark:text-zinc-400">
                            <LogOut className="mr-3 h-5 w-5" />
                            Log out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col lg:pl-64">
                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex h-16 items-center border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 lg:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="-ml-2 p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-2 font-semibold">TicketsManage</span>
                </div>

                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
