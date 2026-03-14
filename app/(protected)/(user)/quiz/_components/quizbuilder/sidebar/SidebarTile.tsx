"use client";

import { useDraggable } from "@dnd-kit/react";

interface SidebarTileProps {
    id: string;
    label: string;
    description: string;
    icon: string;
}

export default function SidebarTile({ id, label, description, icon }: SidebarTileProps) {
    const { ref } = useDraggable({ id });

    return (
        <div
            ref={ref}
            style={{
                padding: "12px",
                marginBottom: 8,
                backgroundColor: "rgba(156, 163, 175, 0.05)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                cursor: "grab",
                userSelect: "none",
                transition: "border-color 0.2s, background-color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 12,
            }}
        >
            {/* Icon box */}
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(46,255,180,0.1)",
                    border: "1px solid rgba(46,255,180,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: "var(--color-primary)" }}
                >
                    {icon}
                </span>
            </div>

            {/* Text */}
            <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>
                    {label}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {description}
                </div>
            </div>
        </div>
    );
}
