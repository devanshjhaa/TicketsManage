"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useMe } from "@/hooks/useMe";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    active: boolean;
};

export default function AdminUsersPage() {
    const router = useRouter();
    const { data: currentUser, isLoading: userLoading } = useMe();

    // Redirect non-admins
    useEffect(() => {
        if (currentUser && currentUser.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [currentUser, router]);

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["admin-users"],
        enabled: !!currentUser && currentUser.role === "ADMIN",
        queryFn: async () => {
            const res = await api.get("/api/users");
            return res.data;
        },
    });

    // Show loading while checking role
    if (userLoading || (currentUser && currentUser.role !== "ADMIN")) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        User Management
                    </h1>
                    <p className="text-muted-foreground">
                        View and manage system users.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            users?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{user.email}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {user.firstName} {user.lastName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.active ? "outline" : "secondary"} className={user.active ? "text-emerald-600 border-emerald-200" : ""}>
                                            {user.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
