"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supportService } from "@/services/supportService";
import type { SupportTicket, SupportTicketMessage } from "@/types";
import { Button } from "@/components/ui";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof MessageSquare }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  waiting_reply: { label: "Waiting Reply", color: "bg-orange-100 text-orange-700", icon: MessageSquare },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600", icon: XCircle },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function AdminSupportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await supportService.getTicket(ticketId);
      if (res.success && res.data) {
        setTicket(res.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const res = await supportService.reply(ticketId, { message: replyText });
      if (res.success && res.data) {
        setTicket(res.data);
        setReplyText("");
      }
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: SupportTicket["status"]) => {
    setUpdating(true);
    try {
      const res = await supportService.updateStatus(ticketId, status);
      if (res.success && res.data) {
        setTicket(res.data);
      }
    } catch {
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (priority: SupportTicket["priority"]) => {
    setUpdating(true);
    try {
      const res = await supportService.updatePriority(ticketId, priority);
      if (res.success && res.data) {
        setTicket(res.data);
      }
    } catch {
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Link href="/admin/support">
          <Button variant="outline" className="mt-4">Back to Tickets</Button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusCfg.icon;
  const messages = ticket.messages || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/support" className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-mono">{ticket.ticket_number}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusCfg.label}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
              {ticket.priority}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            From: {ticket.user?.first_name} {ticket.user?.last_name} ({ticket.user?.email})
            &middot; {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value as SupportTicket["status"])}
          disabled={updating}
          className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
        >
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <select
          value={ticket.priority}
          onChange={(e) => handlePriorityChange(e.target.value as SupportTicket["priority"])}
          disabled={updating}
          className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
        >
          {Object.entries(PRIORITY_COLORS).map(([key]) => (
            <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-3 border-b border-border">
          <h2 className="font-semibold">Messages ({messages.length})</h2>
        </div>

        <div className="divide-y divide-border">
          {messages.map((msg: SupportTicketMessage) => (
            <div
              key={msg.id}
              className={`p-4 ${msg.is_admin ? "bg-blue-50/50" : "bg-background"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                  msg.is_admin ? "bg-primary" : "bg-gray-500"
                }`}>
                  {msg.is_admin ? "A" : (msg.user?.first_name?.charAt(0) || "U")}
                </div>
                <div>
                  <span className="text-sm font-semibold">
                    {msg.is_admin ? "Admin" : `${msg.user?.first_name} ${msg.user?.last_name}`}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                {msg.is_admin && (
                  <span className="ml-auto px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Staff</span>
                )}
              </div>

              <div className="ml-10">
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>

                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.attachments.map((att) => (
                      <div key={att.id}>
                        {att.type === "image" || att.url.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? (
                          <div className="inline-block">
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={att.url}
                                alt={att.name}
                                className="max-w-full md:max-w-md max-h-80 rounded-lg border border-border object-cover hover:opacity-90 transition-opacity cursor-pointer"
                              />
                            </a>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              {att.name}
                              <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </p>
                          </div>
                        ) : (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{att.name}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-muted/30">
          <form onSubmit={handleReply} className="space-y-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={sending || !replyText.trim()}>
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Reply
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
