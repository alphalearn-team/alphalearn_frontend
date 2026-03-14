"use client";

import { DragOverlay } from "@dnd-kit/react";
import { SIDEBAR_TYPES } from "../types";
//this is for the dragging animation when we drag a tile
export default function DraggableTileOverlay() {
  return (
    <DragOverlay dropAnimation={null}>
      {(source) => {
        const tile = SIDEBAR_TYPES.find((t) => t.id === source?.id);
        if (!tile) return null;
        return (
          <div
            style={{
              width: 212,
              padding: "12px",
              backgroundColor: "var(--color-card-bg)",
              border: "1px solid var(--color-primary)",
              borderRadius: 10,
              pointerEvents: "none",
              boxShadow:
                "0 8px 24px rgba(46,255,180,0.2), 0 2px 8px rgba(0,0,0,0.4)",
              cursor: "grabbing",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(46,255,180,0.15)",
                border: "1px solid rgba(46,255,180,0.3)",
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
                {tile.icon}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--color-primary)",
                }}
              >
                {tile.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                {tile.description}
              </div>
            </div>
          </div>
        );
      }}
    </DragOverlay>
  );
}
