"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import Link from "next/link";

import { api } from "@/lib/axios";
import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Low", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
    { value: "MEDIUM", label: "Medium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
    { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" },
    { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
];

interface CreateTicketPayload {
    title: string;
    description: string;
    priority: string;
}

async function createTicket(data: CreateTicketPayload) {
    const res = await api.post("/api/tickets", data);
    return res.data;
}

export default function NewTicketPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: user, isLoading: userLoading } = useMe();

    // Redirect ADMIN users away from New Ticket page
    useEffect(() => {
        if (user && user.role === "ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, router]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const mutation = useMutation({
        mutationFn: createTicket,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
            queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
            toast({
                title: "Ticket Created",
                description: "Your support ticket has been submitted successfully.",
            });
            router.push(`/dashboard/tickets/${data.id}`);
        },
        onError: () => {
            toast({
                title: "Failed to create ticket",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        },
    });

    // Show loading while checking user role
    if (userLoading || (user && user.role === "ADMIN")) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.length < 20) {
            newErrors.description = "Description must be at least 20 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            mutation.mutate(formData);
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/tickets"
                    className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Tickets
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Create New Ticket
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Describe your issue and we&apos;ll get back to you as soon as possible.
                </p>
            </div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
                {/* Title */}
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-foreground">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="title"
                        placeholder="Brief summary of your issue"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                        <p className="flex items-center text-xs text-red-500">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-foreground">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description"
                        rows={6}
                        placeholder="Please provide as much detail as possible about your issue..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`w-full rounded-lg border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.description ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                            }`}
                    />
                    {errors.description && (
                        <p className="flex items-center text-xs text-red-500">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {errors.description}
                        </p>
                    )}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Priority</label>
                    <div className="flex flex-wrap gap-2">
                        {PRIORITY_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, priority: option.value })}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${formData.priority === option.value
                                        ? `${option.color} ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-950`
                                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="min-w-[120px]"
                    >
                        {mutation.isPending ? (
                            <span className="flex items-center">
                                <svg
                                    className="mr-2 h-4 w-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Ticket
                            </>
                        )}
                    </Button>
                </div>
            </motion.form>
        </div>
    );
}
