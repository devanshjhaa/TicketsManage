"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FileText, Download, Send, Paperclip, History, UserPlus, Star, ArrowLeft, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityFeed } from "@/components/ticket/ActivityFeed";
import { RateTicketDialog } from "@/components/ticket/RateTicketDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMe } from "@/hooks/useMe";


// --- Types ---
export type TicketDetail = {
  id: string; // Changed to string UUID
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  owner: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  assignee?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  rating?: number;
  ratingComment?: string;
};

export type Comment = {
  id: number;
  content: string;
  author: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
};

export type Attachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
};

// --- Fetchers & Mutations ---
async function fetchTicket(id: string) {
  const res = await api.get(`/api/tickets/${id}`);
  return res.data;
}

async function fetchComments(id: string) {
  const res = await api.get(`/api/tickets/${id}/comments`);
  return res.data;
}

async function fetchAttachments(id: string) {
  const res = await api.get(`/api/tickets/${id}/attachments`);
  return res.data;
}

async function postComment({ id, content }: { id: string; content: string }) {
  await api.post(`/api/tickets/${id}/comments`, { content });
}

async function uploadAttachment({ id, file }: { id: string; file: File }) {
  const formData = new FormData();
  formData.append("file", file);
  await api.post(`/api/tickets/${id}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// --- Page Component ---
export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);

  // Queries
  const { data: ticket, isLoading: ticketLoading } = useQuery<TicketDetail>({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id),
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["ticket-comments", id],
    queryFn: () => fetchComments(id),
  });

  const { data: attachments, isLoading: attachmentsLoading } = useQuery<Attachment[]>({
    queryKey: ["ticket-attachments", id],
    queryFn: () => fetchAttachments(id),
  });

  // Mutations
  const commentMutation = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", id] });
      setComment("");
      toast({ title: "Comment added" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  const attachmentMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-attachments", id] });
      setUploading(false);
      toast({ title: "File uploaded" });
    },
    onError: () => {
      setUploading(false);
      toast({ title: "Upload failed", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.put(`/api/tickets/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["ticket-activity", id] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  // Handlers
  const handleAddComment = () => {
    if (!comment.trim()) return;
    commentMutation.mutate({ id, content: comment });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      attachmentMutation.mutate({ id, file: e.target.files[0] });
    }
  };


  const { data: me } = useMe();

  if (ticketLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!ticket) return <div className="mx-auto max-w-6xl px-4 py-6">Ticket not found</div>;

  const isResolved = ticket.status === "RESOLVED";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
      {/* Ticket Resolved Banner */}
      {isResolved && me?.email === ticket.owner?.email && !ticket.rating && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-emerald-900 dark:text-emerald-100">Your ticket has been resolved!</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Please rate your experience to help us improve our service.
              </p>
            </div>
          </div>
          <RateTicketDialog ticketId={id} />
        </div>
      )}

      {/* Agent Assigned Banner - Show when first assigned */}
      {ticket.assignee && ticket.status === "OPEN" && me?.email === ticket.owner?.email && (
        <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-purple-900 dark:text-purple-100">A support agent has been assigned</p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {ticket.assignee.firstName || ticket.assignee.email.split("@")[0]} is now handling your ticket.
            </p>
          </div>
        </div>
      )}

      {/* Page Header with Back Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ticket Details</h1>
            <p className="text-sm text-muted-foreground">View and manage your support request</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header & Desc */}
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {ticket.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>#{ticket.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>{ticket.owner?.email}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={ticket.status === "OPEN" ? "default" : "secondary"}>
                    {ticket.status}
                  </Badge>
                  <Badge variant="outline">{ticket.priority}</Badge>

                  {ticket.status === "RESOLVED" && me?.email === ticket.owner?.email && !ticket.rating && (
                    <RateTicketDialog ticketId={id} />
                  )}
                </div>
              </div>
              {ticket.rating && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                  <span className="font-semibold">Rated:</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < (ticket.rating || 0) ? "fill-current" : "text-yellow-800/20 dark:text-yellow-200/20")} />
                    ))}
                  </div>
                  {ticket.ratingComment && <span className="text-xs opacity-80">- {ticket.ratingComment}</span>}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs: Comments & Activity */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments" className="gap-2"><FileText className="h-4 w-4" /> Comments</TabsTrigger>
              <TabsTrigger value="activity" className="gap-2"><History className="h-4 w-4" /> Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Comments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {commentsLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : comments?.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">No comments yet. Start the conversation.</p>
                    ) : (
                      comments?.map((c) => (
                        <div key={c.id} className="group relative flex gap-4 rounded-lg border bg-muted/30 p-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {c.author?.email?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">{c.author?.email || "Unknown"}</span>
                              <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-foreground/80">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-4">
                    <Textarea
                      placeholder="Write a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={commentMutation.isPending || !comment.trim()}
                      className="gap-2"
                    >
                      {commentMutation.isPending ? "Posting..." : <><Send className="h-4 w-4" /> Post Comment</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" /> Activity History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed ticketId={id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar (Right Col) */}
        <div className="space-y-6">

          {/* Status Control Card - for ticket owner (only shows for RESOLVED to allow reopening) */}
          {me?.email === ticket.owner?.email && ticket.status === "RESOLVED" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Circle className="h-4 w-4" /> Update Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  defaultValue={ticket.status}
                  onValueChange={(val) => updateStatusMutation.mutate(val)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESOLVED">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Resolved
                      </div>
                    </SelectItem>
                    <SelectItem value="OPEN">
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3 text-blue-500" /> Reopen Ticket
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Reopen this ticket if the issue isn&apos;t fully resolved.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Assignee Card */}
          {/* Assignee Info with Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4" /> Assignee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticket.assignee ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {ticket.assignee.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {ticket.assignee.firstName && ticket.assignee.lastName 
                          ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
                          : ticket.assignee.email}
                      </p>
                      <p className="text-xs text-muted-foreground">{ticket.assignee.email}</p>
                    </div>
                  </div>
                  {/* Show ticket rating if exists - visible to assignee */}
                  {ticket.rating && (
                    <div className="mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">Customer Rating</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-4 w-4",
                              i < (ticket.rating || 0) 
                                ? "fill-yellow-500 text-yellow-500" 
                                : "text-yellow-300 dark:text-yellow-700"
                            )} 
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          {ticket.rating}/5
                        </span>
                      </div>
                      {ticket.ratingComment && (
                        <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300 italic">
                          &quot;{ticket.ratingComment}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Paperclip className="h-4 w-4" /> Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attachmentsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : attachments?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attachments.</p>
              ) : (
                <div className="space-y-2">
                  {attachments?.map((att) => (
                    <div key={att.id} className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{att.fileName}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${id}/attachments/${att.id}/download`} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative mt-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 py-4 text-sm font-medium text-muted-foreground hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900",
                    uploading && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Paperclip className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload File"}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Metadata / Actions */}
          {/* Can add more cards here for Status toggle, Assignee, etc. */}
        </div>
      </div>
    </div>
  );
}
