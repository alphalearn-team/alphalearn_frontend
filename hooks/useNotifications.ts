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

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { notifications, unreadCount, markRead, markAllRead, refresh };
}
