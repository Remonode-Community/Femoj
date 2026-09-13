import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import type {
  SupportTicket,
  SupportTicketStats,
  ApiResponse,
} from "@/types";

export const supportService = {
  async getTickets(params?: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<{ data: SupportTicket[]; current_page: number; last_page: number; total: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.priority) searchParams.set("priority", params.priority);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.per_page) searchParams.set("per_page", String(params.per_page));
    const qs = searchParams.toString();
    return apiGet(`/admin/support${qs ? `?${qs}` : ""}`, { requiresAuth: true });
  },

  async getTicket(id: number): Promise<ApiResponse<SupportTicket>> {
    return apiGet(`/admin/support/${id}`, { requiresAuth: true });
  },

  async reply(
    id: number,
    payload: {
      message: string;
      attachments?: { url: string; type?: string; name: string }[];
    }
  ): Promise<ApiResponse<SupportTicket>> {
    return apiPost(`/admin/support/${id}/reply`, payload, { requiresAuth: true });
  },

  async updateStatus(
    id: number,
    status: SupportTicket["status"]
  ): Promise<ApiResponse<SupportTicket>> {
    return apiPut(`/admin/support/${id}/status`, { status }, { requiresAuth: true });
  },

  async updatePriority(
    id: number,
    priority: SupportTicket["priority"]
  ): Promise<ApiResponse<SupportTicket>> {
    return apiPut(`/admin/support/${id}/priority`, { priority }, { requiresAuth: true });
  },

  async getStats(): Promise<ApiResponse<SupportTicketStats>> {
    return apiGet("/admin/support/stats", { requiresAuth: true });
  },
};
