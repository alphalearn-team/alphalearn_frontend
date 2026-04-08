import { useCallback, useEffect, useRef, useState } from "react";
import {
    type Notification,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "@/lib/utils/notifications";

const POLL_INTERVAL_MS = 30_000;

export function useNotifications(enabled: boolean) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const refresh = useCallback(async () => {
        const data = await getNotifications();
        setNotifications(data);
    }, []);

    useEffect(() => {
        if (!enabled) return;
        
        const timeoutId = setTimeout(() => {
            refresh();
        }, 0);
        intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
        
        return () => {
            clearTimeout(timeoutId);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [enabled, refresh]);

    const markRead = useCallback(
        async (publicId: string) => {
            await markNotificationRead(publicId);
            setNotifications((prev) =>
                prev.map((n) => (n.publicId === publicId ? { ...n, isRead: true } : n))
            );
        },
        []
    );

    const markAllRead = useCallback(async () => {
        await markAllNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }, []);

    const markSelectedRead = useCallback(async (publicIds: string[]) => {
        const uniqueIds = Array.from(new Set(publicIds));
        if (uniqueIds.length === 0) {
            return;
        }

        await Promise.all(uniqueIds.map((publicId) => markNotificationRead(publicId)));
        const selectedSet = new Set(uniqueIds);
        setNotifications((prev) =>
            prev.map((notification) =>
                selectedSet.has(notification.publicId)
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    }, []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { notifications, unreadCount, markRead, markAllRead, markSelectedRead, refresh };
}
