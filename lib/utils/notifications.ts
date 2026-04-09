"use server";

import { apiFetch } from "@/lib/api/api";

export interface Notification {
    publicId: string;
    message: string;
    type?: string | null;
    metadata?: Record<string, unknown> | null;
    isRead: boolean;
    createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
    try {
        return await apiFetch<Notification[]>("/me/notifications");
    } catch {
        return [];
    }
}

export async function markNotificationRead(publicId: string): Promise<void> {
    try {
        await apiFetch<void>(`/me/notifications/${publicId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "READ" }),
        });
    } catch {

    }
}

export async function markAllNotificationsRead(): Promise<void> {
    try {
        await apiFetch<void>("/me/notifications", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "READ_ALL" }),
        });
    } catch {
        
    }
}
