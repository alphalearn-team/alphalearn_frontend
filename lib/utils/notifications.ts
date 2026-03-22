"use server";

import { apiFetch } from "@/lib/api/api";

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

    }
}

export async function markAllNotificationsRead(): Promise<void> {
    try {
        await apiFetch<void>("/me/notifications/read-all", {
            method: "POST",
        });
    } catch {
        
    }
}
