"use client";

import { useMemo, useRef, useState } from "react";
import { Badge, Button, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import type { AdminLessonReportEntry } from "@/interfaces/interfaces";
import { formatDateTime } from "@/lib/utils/formatDate";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
import {
  dismissAllLessonReportsForLesson,
  dismissSingleLessonReport,
  unpublishLessonAndResolveReports,
} from "@/app/(protected)/(admin)/admin/lessons/actions";
import { showError, showInfo, showSuccess } from "@/lib/utils/popUpNotifications";

interface ReportedLessonFloatingReportsWindowProps {
  lessonPublicId: string;
  pendingCount: number;
  reports: AdminLessonReportEntry[];
}

interface WindowPosition {
  x: number;
  y: number;
}

export default function ReportedLessonFloatingReportsWindow({
  lessonPublicId,
  pendingCount,
  reports,
}: ReportedLessonFloatingReportsWindowProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReportPublicIds, setSelectedReportPublicIds] = useState<string[]>([]);
  const [expandedReportKeys, setExpandedReportKeys] = useState<string[]>([]);
  const [isDismissingSelected, setIsDismissingSelected] = useState(false);
  const [isDismissingAll, setIsDismissingAll] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [unpublishModalOpened, setUnpublishModalOpened] = useState(false);
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
  const selectedCount = selectedReportPublicIds.length;

  const toggleSelectedReport = (reportPublicId: string | null) => {
    if (!reportPublicId || reportPublicId.startsWith("unknown-")) {
      return;
    }

    setSelectedReportPublicIds((current) =>
      current.includes(reportPublicId)
        ? current.filter((id) => id !== reportPublicId)
        : [...current, reportPublicId],
    );
  };

  const handleDismissSelected = async () => {
    if (selectedReportPublicIds.length === 0) {
      return;
    }

    setIsDismissingSelected(true);
    try {
      const results = await Promise.allSettled(
        selectedReportPublicIds.map((reportPublicId) =>
          dismissSingleLessonReport(lessonPublicId, reportPublicId),
        ),
      );

      let successCount = 0;
      let failureCount = 0;

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.success) {
          successCount += 1;
        } else {
          failureCount += 1;
        }
      }

      if (successCount > 0) {
        showSuccess(
          `Dismissed ${successCount} selected report${successCount === 1 ? "" : "s"}.`,
        );
      }

      if (failureCount > 0) {
        showError(
          `${failureCount} selected report${failureCount === 1 ? "" : "s"} failed to dismiss.`,
        );
      }

      setSelectedReportPublicIds([]);
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to dismiss selected reports.");
    } finally {
      setIsDismissingSelected(false);
    }
  };

  const handleDismissAll = async () => {
    setIsDismissingAll(true);
    try {
      const result = await dismissAllLessonReportsForLesson(lessonPublicId);
      if (!result.success) {
        showError(result.message ?? "Failed to dismiss all reports.");
        return;
      }

      if (typeof result.resolvedCount === "number") {
        if (result.resolvedCount === 0) {
          showInfo("No pending reports to dismiss.");
        } else {
          showSuccess(
            `Dismissed ${result.resolvedCount} report${result.resolvedCount === 1 ? "" : "s"}.`,
          );
        }
      } else {
        showSuccess("Dismissed all pending reports for this lesson.");
      }

      setSelectedReportPublicIds([]);
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to dismiss all reports.");
    } finally {
      setIsDismissingAll(false);
    }
  };

  const handleOpenUnpublishModal = () => {
    setUnpublishModalOpened(true);
  };

  const handleCloseUnpublishModal = () => {
    if (isUnpublishing) {
      return;
    }
    setUnpublishModalOpened(false);
  };

  const handleConfirmUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      const result = await unpublishLessonAndResolveReports(lessonPublicId);
      if (!result.success) {
        showError(result.message ?? "Failed to unpublish lesson.");
        return;
      }

      showSuccess("Lesson unpublished and all pending reports resolved.");
      setSelectedReportPublicIds([]);
      setUnpublishModalOpened(false);
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to unpublish lesson.");
    } finally {
      setIsUnpublishing(false);
    }
  };

  const toggleExpandedReport = (reportKey: string) => {
    setExpandedReportKeys((current) =>
      current.includes(reportKey)
        ? current.filter((key) => key !== reportKey)
        : [...current, reportKey],
    );
  };

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
          className="fixed z-[9999] rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-2xl"
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
                    (() => {
                      const reportKey = report.publicId ?? `${report.reason}-${index}`;
                      const isExpanded = expandedReportKeys.includes(reportKey);
                      const canExpand = report.reason.length > 120;

                      return (
                    <div
                      key={reportKey}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSelectedReport(report.publicId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleSelectedReport(report.publicId);
                        }
                      }}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                        report.publicId && selectedReportPublicIds.includes(report.publicId)
                          ? "border-red-500/50 bg-red-500/15"
                          : "border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-overlay)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(
                          report.publicId && selectedReportPublicIds.includes(report.publicId),
                        )}
                        onChange={() => toggleSelectedReport(report.publicId)}
                        onClick={(event) => event.stopPropagation()}
                        disabled={!report.publicId || report.publicId.startsWith("unknown-")}
                        className="mt-1 h-4 w-4 accent-red-500"
                      />
                      <div className="min-w-0 flex flex-1 flex-col items-start">
                        <p
                          className={`${isExpanded ? "" : "line-clamp-2"} w-full break-words text-sm text-[var(--color-text)]`}
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {report.reason}
                        </p>
                        {canExpand && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleExpandedReport(reportKey);
                            }}
                            className="mt-1 block w-fit text-xs font-semibold text-[var(--color-primary)] hover:underline"
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </button>
                        )}
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {report.createdAt ? formatDateTime(report.createdAt) : "Time unavailable"}
                        </p>
                      </div>
                    </div>
                      );
                    })()
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
              <div className="grid grid-cols-2 gap-2">
              <Button
                color="blue"
                variant="light"
                onClick={handleDismissSelected}
                loading={isDismissingSelected}
                disabled={selectedCount === 0 || isDismissingAll}
              >
                Dismiss ({selectedCount})
              </Button>
              <Button
                color="blue"
                onClick={handleDismissAll}
                loading={isDismissingAll}
                disabled={pendingCount === 0 || isDismissingSelected || isUnpublishing}
              >
                Dismiss All
              </Button>
              </div>
              <Button
                color="red"
                variant="light"
                onClick={handleOpenUnpublishModal}
                loading={isUnpublishing}
                disabled={isDismissingAll || isDismissingSelected}
                fullWidth
                className="justify-center"
              >
                Unpublish Lesson
              </Button>
            </div>
          </div>
        </div>
        <ConfirmModal
          opened={unpublishModalOpened}
          onClose={handleCloseUnpublishModal}
          onConfirm={handleConfirmUnpublish}
          title="Unpublish Lesson?"
          message="This will unpublish the lesson and resolve all pending reports for this lesson."
          confirmText="Unpublish & Resolve"
          cancelText="Cancel"
          confirmColor="red"
          icon="warning"
          loading={isUnpublishing}
        />
        </>,
        document.body,
      )}
    </>
  );
}
