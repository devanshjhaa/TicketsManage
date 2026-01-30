"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Users, ArrowLeft, ArrowRight } from "lucide-react";

import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
    const router = useRouter();
    const { data: user, isLoading } = useMe();

    // Redirect non-admins
    useEffect(() => {
        if (user && user.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, router]);

    if (isLoading || (user && user.role !== "ADMIN")) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Panel</h1>
                    <p className="text-muted-foreground">Manage tickets and users</p>
                </div>
            </div>

            {/* Admin Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* All Tickets Card */}
                <button
                    onClick={() => router.push("/dashboard/admin/tickets")}
                    className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                    <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                            <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-4">
                        <h2 className="text-xl font-semibold text-foreground">All Tickets</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View and manage all tickets in the system. Assign agents, update status, and monitor progress.
                        </p>
                    </div>
                </button>

                {/* User Management Card */}
                <button
                    onClick={() => router.push("/dashboard/admin/users")}
                    className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                    <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
                            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-4">
                        <h2 className="text-xl font-semibold text-foreground">User Management</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage user accounts, update roles, upload profile photos, and control access.
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
}
