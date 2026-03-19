"use server";

import { apiFetch } from "@/lib/api";

export interface Notification {
    publicId: string;
    message: string;
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
        await apiFetch<void>(`/me/notifications/${publicId}/read`, {
            method: "PATCH",
        });
    } catch {
        // silently ignore — optimistic update already applied in hook
    }
}

export async function markAllNotificationsRead(): Promise<void> {
    try {
        await apiFetch<void>("/me/notifications/read-all", {
            method: "POST",
        });
    } catch {
        // silently ignore
    }
}
