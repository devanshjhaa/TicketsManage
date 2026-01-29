"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
    CheckCircle2,
    FileEdit,
    MessageSquare,
    PlusCircle,
    Trash2,
    UserPlus,
    ArrowRightCircle,
    Star,
    LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
    id: string;
    action: string;
    details: string;
    actorEmail: string;
    createdAt: string;
}

const actionIcons: Record<string, LucideIcon> = {
    CREATED: PlusCircle,
    STATUS_CHANGED: ArrowRightCircle,
    ASSIGNED: UserPlus,
    COMMENTED: MessageSquare,
    SOFT_DELETED: Trash2,
    RESTORED: CheckCircle2,
    RATED: Star,
};

const actionColors: Record<string, string> = {
    CREATED: "text-blue-500",
    STATUS_CHANGED: "text-orange-500",
    ASSIGNED: "text-purple-500",
    COMMENTED: "text-gray-500",
    SOFT_DELETED: "text-red-500",
    RESTORED: "text-green-500",
    RATED: "text-yellow-500",
};

export function ActivityFeed({ ticketId }: { ticketId: string }) {
    const { data: activities, isLoading } = useQuery<Activity[]>({
        queryKey: ["ticket-activity", ticketId],
        queryFn: async () => {
            const res = await api.get(`/api/tickets/${ticketId}/activities`);
            return res.data;
        },
    });

    if (isLoading) {
        return <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            ))}
        </div>;
    }

    if (!activities || activities.length === 0) {
        return <p className="text-sm text-muted-foreground">No activity recorded.</p>;
    }

    return (
        <div className="relative space-y-8 pl-4 before:absolute before:inset-0 before:left-[19px] before:view-height before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
            {activities.map((activity) => {
                const Icon = actionIcons[activity.action] || FileEdit;
                const colorClass = actionColors[activity.action] || "text-zinc-500";

                return (
                    <div key={activity.id} className="relative flex gap-4">
                        <div className={cn("relative z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-white dark:bg-zinc-950", colorClass)}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col pt-2">
                            <span className="text-sm font-medium text-foreground">
                                {activity.details}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                by {activity.actorEmail} • {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
