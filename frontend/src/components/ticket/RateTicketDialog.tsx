"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RateTicketDialogProps {
    ticketId: string;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function RateTicketDialog({ ticketId, trigger }: RateTicketDialogProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            await api.post(`/api/tickets/${ticketId}/rating`, {
                rating,
                comment,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
            queryClient.invalidateQueries({ queryKey: ["ticket-activity", ticketId] });
            toast({ title: "Ticket rated successfully" });
            setOpen(false);
        },
        onError: () => {
            toast({ title: "Failed to submit rating", variant: "destructive" });
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Rate Resolution</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rate Ticket Resolution</DialogTitle>
                    <DialogDescription>
                        How satisfied are you with the resolution of this ticket?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors",
                                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    <Textarea
                        placeholder="Additional comments (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={rating === 0 || mutation.isPending}
                    >
                        {mutation.isPending ? "Submitting..." : "Submit Rating"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
