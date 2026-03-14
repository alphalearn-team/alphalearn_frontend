"use client";

import { SIDEBAR_TYPES } from "../types";
import SidebarTile from "./SidebarTile";

export default function QuestionTypeSidebar() {
    return (
        <aside
            style={{
                width: "20vw",
                height:"100vh",
                flexShrink: 0,
                borderRight: "1px solid var(--color-border)",
                padding: "20px 16px",
                overflowY: "auto",
                background: "var(--color-surface)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <p
                style={{
                    margin: "0 0 12px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--color-text-muted)",
                }}
            >
                Question Types
            </p>
            {SIDEBAR_TYPES.map((t) => (
                <SidebarTile key={t.id} id={t.id} label={t.label} description={t.description} icon={t.icon} />
            ))}
        </aside>
    );
}
