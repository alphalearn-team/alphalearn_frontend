"use client";

import { SIDEBAR_TYPES } from "../types";
import SidebarTile from "./SidebarTile";

export default function QuestionTypeSidebar() {
    return (
        <aside
            style={{
                width: 220,
                flexShrink: 0,
                borderRight: "1px solid #e5e7eb",
                padding: 16,
                overflowY: "auto",
                background: "#f9fafb",
            }}
        >
            <h2
                style={{
                    margin: "0 0 12px",
                    fontSize: 14,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                }}
            >
                Question Types
            </h2>
            {SIDEBAR_TYPES.map((t) => (
                <SidebarTile key={t.id} id={t.id} label={t.label} description={t.description} />
            ))}
        </aside>
    );
}
