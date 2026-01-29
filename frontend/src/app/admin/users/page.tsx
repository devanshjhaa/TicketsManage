"use client";

import AppShell from "@/components/layout/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Upload, User as UserIcon } from "lucide-react";

type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    active: boolean;
    profilePictureUrl?: string; // Endpoint URL or null
};

export default function AdminUsersPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await api.get("/api/users"); // Ensure this endpoint returns all users for admin
            return res.data;
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ id, file }: { id: string; file: File }) => {
            const formData = new FormData();
            formData.append("file", file);
            await api.post(`/api/admin/users/${id}/photo`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast({ title: "Photo uploaded successfully" });
            setUploading(false);
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({ title: "Failed to upload photo", variant: "destructive" });
            setUploading(false);
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedUser) {
            setUploading(true);
            uploadMutation.mutate({ id: selectedUser.id, file: e.target.files[0] });
        }
    };

    return (
        <AppShell>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    User Management
                </h1>
                <p className="text-muted-foreground">
                    Manage system users and agents.
                </p>
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Photo</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            users?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                            {user.profilePictureUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${user.profilePictureUrl}`}
                                                    alt={user.email}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                    <UserIcon className="h-5 w-5" />
                                                </div>
                                            )}
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
                                    <TableCell className="text-right">
                                        <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                            setIsDialogOpen(open);
                                            if (open) setSelectedUser(user);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                                                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Upload Photo for {user.email}</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="flex items-center justify-center">
                                                        <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                                                            {user.profilePictureUrl ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}${user.profilePictureUrl}`} alt="Current" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <UserIcon className="h-12 w-12 text-zinc-300 m-auto mt-10" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        disabled={uploading}
                                                    />
                                                    {uploading && <p className="text-sm text-center text-muted-foreground">Uploading...</p>}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppShell>
    );
}
