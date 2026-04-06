"use client";

import { useMemo, useRef, useState } from "react";
import { Badge, Button, Text } from "@mantine/core";
import { createPortal } from "react-dom";
import type { AdminLessonReportEntry } from "@/interfaces/interfaces";
import { formatDateTime } from "@/lib/utils/formatDate";

interface ReportedLessonFloatingReportsWindowProps {
  pendingCount: number;
  reports: AdminLessonReportEntry[];
}

interface WindowPosition {
  x: number;
  y: number;
}

export default function ReportedLessonFloatingReportsWindow({
  pendingCount,
  reports,
}: ReportedLessonFloatingReportsWindowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  const [position, setPosition] = useState<WindowPosition>({ x: 64, y: 96 });
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const normalizedReports = useMemo(
    () => (Array.isArray(reports) ? reports : []),
    [reports],
  );

  const clampPosition = (nextX: number, nextY: number): WindowPosition => {
    if (typeof window === "undefined") {
      return { x: nextX, y: nextY };
    }

    const width = floatingRef.current?.offsetWidth ?? 520;
    const height = floatingRef.current?.offsetHeight ?? 460;
    const maxX = Math.max(12, window.innerWidth - width - 12);
    const maxY = Math.max(12, window.innerHeight - height - 12);

    return {
      x: Math.min(Math.max(12, nextX), maxX),
      y: Math.min(Math.max(12, nextY), maxY),
    };
  };

  const handleDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: position.x,
      startY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const start = dragStartRef.current;
      if (!start) {
        return;
      }

      const deltaX = moveEvent.clientX - start.pointerX;
      const deltaY = moveEvent.clientY - start.pointerY;
      setPosition(clampPosition(start.startX + deltaX, start.startY + deltaY));
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <Button
        color="blue"
        variant="light"
        onClick={() => setIsOpen(true)}
        rightSection={
          <Badge color="red" variant="filled" size="sm">
            {pendingCount}
          </Badge>
        }
      >
        Open Reports
      </Button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <>
        <div
          ref={floatingRef}
          className="fixed z-[9999] rounded-2xl border border-[var(--color-primary)]/70 bg-[var(--color-background)] shadow-2xl"
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: "520px",
            minWidth: "520px",
            height: "640px",
            minHeight: "640px",
            maxWidth: "520px",
            maxHeight: "min(72vh, calc(100vh - 24px))",
            resize: "vertical",
            overflow: "hidden",
          }}
        >
          <div
            role="button"
            tabIndex={0}
            onMouseDown={handleDragStart}
            onKeyDown={() => {}}
            className="flex cursor-move items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Text size="sm" className="font-semibold text-[var(--color-text)]">
                Reports ({normalizedReports.length})
              </Text>
              <Badge color="red" variant="light">
                {pendingCount} pending
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-overlay)]"
              aria-label="Close reports window"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div className="flex h-[calc(100%-57px)] flex-col p-3">
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
              {normalizedReports.length === 0 ? (
                <div className="px-2 py-3 text-sm text-[var(--color-text-secondary)]">
                  No individual report entries returned yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {normalizedReports.map((report, index) => (
                    <button
                      key={report.publicId ?? `${report.reason}-${index}`}
                      type="button"
                      onClick={() => setSelectedReportIndex(index)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                        index === selectedReportIndex
                          ? "border-red-500/50 bg-red-500/15"
                          : "border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-overlay)]"
                      }`}
                    >
                      <p className="line-clamp-2 text-sm text-[var(--color-text)]">{report.reason}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {report.createdAt ? formatDateTime(report.createdAt) : "Time unavailable"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
              <Button color="blue" variant="light" disabled title="Coming soon">
                Dismiss Reports
              </Button>
              <Button color="red" disabled title="Coming soon">
                Unpublish Lesson
              </Button>
            </div>
          </div>
        </div>
        </>,
        document.body,
      )}
    </>
  );
}
