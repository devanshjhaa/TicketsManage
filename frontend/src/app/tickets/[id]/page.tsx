"use client";

import { useParams } from "next/navigation";
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
import { FileText, Download, Send, Paperclip, History, UserPlus, Star } from "lucide-react";
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
  ownerEmail: string;
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
  authorEmail: string;
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
  const isAdminOrSupport = me?.role === "ADMIN" || me?.role === "SUPPORT_AGENT";

  // Query for users (Assignees) - only if admin/support
  interface User { id: string; email: string; }
  const { data: users } = useQuery<User[]>({
    queryKey: ["users-assign"],
    queryFn: async () => (await api.get("/api/users")).data,
    enabled: isAdminOrSupport,
  });

  const assignMutation = useMutation({
    mutationFn: async (assigneeId: string) => {
      await api.post(`/api/tickets/${id}/assign`, { assigneeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["ticket-activity", id] });
      toast({ title: "Ticket assigned" });
    },
    onError: () => toast({ title: "Failed to assign", variant: "destructive" }),
  });

  if (ticketLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!ticket) return <div className="p-6">Ticket not found</div>;

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-3">
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
                  <span>{ticket.ownerEmail}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={ticket.status === "OPEN" ? "default" : "secondary"}>
                  {ticket.status}
                </Badge>
                <Badge variant="outline">{ticket.priority}</Badge>

                {ticket.status === "RESOLVED" && me?.email === ticket.ownerEmail && !ticket.rating && (
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
                          {c.authorEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{c.authorEmail}</span>
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

        {/* Assignee Card */}
        {isAdminOrSupport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4" /> Assignee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                onValueChange={(val) => assignMutation.mutate(val)}
                disabled={assignMutation.isPending}
                defaultValue={ticket?.assignee?.id || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

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
  );
}
