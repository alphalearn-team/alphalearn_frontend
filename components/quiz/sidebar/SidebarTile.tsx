"use client";

import { useDraggable } from "@dnd-kit/react";

interface SidebarTileProps {
    id: string;
    label: string;
    description: string;
}

export default function SidebarTile({ id, label, description }: SidebarTileProps) {
    const { ref, isDragging } = useDraggable({ id });

    return (
        <div
            ref={ref}
            style={{
                padding: "10px 12px",
                marginBottom: 10,
                background: isDragging ? "#dbeafe" : "#fff",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                cursor: "grab",
                opacity: isDragging ? 0.5 : 1,
                userSelect: "none",
            }}
        >
            <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{description}</div>
        </div>
    );
}
