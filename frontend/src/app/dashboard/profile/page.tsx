"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Camera, Mail, Shield, ArrowLeft, Check, Loader2, AlertCircle, Star, Ticket, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

import { useMe } from "@/hooks/useMe";
import { api } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AgentStats = {
  totalAssignedTickets: number;
  resolvedTickets: number;
  openTickets: number;
  inProgressTickets: number;
  totalRatings: number;
  averageRating: number | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch agent stats if user is SUPPORT_AGENT
  const { data: agentStats } = useQuery<AgentStats>({
    queryKey: ["agent-stats"],
    queryFn: async () => {
      const res = await api.get("/api/users/me/stats");
      return res.data;
    },
    enabled: !!user && user.role === "SUPPORT_AGENT",
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadError(null);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/users/me/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setPreview(null);
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || error?.message || "Failed to upload profile picture";
      setUploadError(message);
      setPreview(null);
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      uploadMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const profilePictureUrl = user.profilePictureUrl
    ? `${API_URL}/api/users/${user.id}/profile-picture`
    : null;

  const displayImage = preview || profilePictureUrl;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
            Profile
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-12">
            Manage your account settings and profile picture.
          </p>

          {/* Profile Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />

            {/* Profile Content */}
            <div className="px-8 pb-8">
              {/* Avatar */}
              <div className="relative -mt-16 mb-6">
                <div className="relative inline-block">
                  <div className="h-32 w-32 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                        <span className="text-4xl font-semibold">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : uploadMutation.isSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Error Message */}
                {uploadError && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {uploadError}
                  </div>
                )}
              </div>

              {/* Name */}
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email.split("@")[0]}
              </h2>

              {/* Info Cards */}
              <div className="grid gap-4 mt-8">
                {/* Email */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium mb-0.5">
                      Email Address
                    </p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium mb-0.5">
                      Role
                    </p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                      {formatRole(user.role)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Agent Stats Section */}
              {user.role === "SUPPORT_AGENT" && agentStats && (
                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    Your Performance
                  </h3>
                  
                  {/* Rating Card */}
                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">
                          Average Rating
                        </p>
                        {agentStats.averageRating !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                              {agentStats.averageRating.toFixed(1)}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-5 w-5",
                                    star <= Math.round(agentStats.averageRating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-yellow-300 dark:text-yellow-700"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            No ratings yet
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Based on {agentStats.totalRatings} {agentStats.totalRatings === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-center">
                      <Ticket className="h-5 w-5 mx-auto mb-1 text-zinc-500" />
                      <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {agentStats.totalAssignedTickets}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Assigned</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center">
                      <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {agentStats.resolvedTickets}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Resolved</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                      <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                        {agentStats.inProgressTickets}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">In Progress</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
                      <Ticket className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {agentStats.openTickets}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Open</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Account Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Profile Tips
            </h3>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1.5">
              <li>• Click the camera icon to upload a new profile picture</li>
              <li>• Supported formats: JPG, PNG, GIF (max 5MB)</li>
              <li>• Your profile picture will be visible to others</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function formatRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "SUPPORT_AGENT":
      return "Support Agent";
    case "USER":
      return "User";
    default:
      return role.replace("_", " ");
  }
}
