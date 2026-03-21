"use client";

import { ActionIcon, TextInput, Tooltip } from "@mantine/core";
import { SectionBlock } from "@/app/(protected)/(user)/lessons/_components/LessonBuilder";
import type { LessonSectionInput } from "@/interfaces/interfaces";
import type { SectionWithId } from "./sectionEditorUtils";

interface SectionEditorCardProps {
  index: number;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onCancelEditing: () => void;
  onDelete: () => void;
  onDoubleClick: () => void;
  onMove: (direction: "up" | "down") => void;
  onSaveEditing: () => void;
  onStartEditing: () => void;
  onUpdateSection: (section: LessonSectionInput) => void;
  onUpdateTitle: (title: string) => void;
  onRegisterElement: (element: HTMLDivElement | null) => void;
  section: SectionWithId;
}

export default function SectionEditorCard({
  index,
  isEditing,
  isFirst,
  isLast,
  onCancelEditing,
  onDelete,
  onDoubleClick,
  onMove,
  onSaveEditing,
  onStartEditing,
  onUpdateSection,
  onUpdateTitle,
  onRegisterElement,
  section,
}: SectionEditorCardProps) {
  return (
    <div
      key={section._id}
      id={`section-${index}`}
      className="group relative"
      ref={onRegisterElement}
    >
      {!isEditing && (
        <div
          className="absolute -right-10 sm:-right-12 top-0 bottom-0 flex flex-col items-center justify-center gap-3 sm:gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ width: "40px" }}
        >
          <Tooltip label="Move up" position="right" withArrow>
            <button
              onClick={() => onMove("up")}
              disabled={isFirst}
              className="p-0 border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
              style={{ color: isFirst ? "var(--color-text-muted)" : "var(--color-primary)" }}
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontWeight: "300" }}>
                keyboard_arrow_up
              </span>
            </button>
          </Tooltip>

          <Tooltip label="Move down" position="right" withArrow>
            <button
              onClick={() => onMove("down")}
              disabled={isLast}
              className="p-0 border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
              style={{ color: isLast ? "var(--color-text-muted)" : "var(--color-primary)" }}
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontWeight: "300" }}>
                keyboard_arrow_down
              </span>
            </button>
          </Tooltip>
        </div>
      )}

      <div
        className="rounded-xl border transition-all duration-200 px-3 sm:px-5 py-4 sm:py-5"
        style={{
          backgroundColor: isEditing ? "rgba(156, 163, 175, 0.08)" : "rgba(156, 163, 175, 0.05)",
          borderColor: isEditing ? "var(--color-primary)" : "var(--color-border)",
          borderWidth: isEditing ? "2px" : "1px",
        }}
        onDoubleClick={() => !isEditing && onDoubleClick()}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <span
                className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] truncate"
                style={{ color: "var(--color-text-muted)" }}
              >
                Section {index + 1} · {section.sectionType}
              </span>
            </div>

            {!isEditing && (
              <ActionIcon
                size="sm"
                variant="light"
                onClick={onStartEditing}
                className="flex-shrink-0"
                styles={{
                  root: {
                    color: "var(--color-primary)",
                    backgroundColor: "var(--color-overlay)",
                  },
                }}
              >
                <span className="material-symbols-outlined text-base">edit</span>
              </ActionIcon>
            )}
          </div>

          {isEditing && (
            <TextInput
              label="Section Title (Optional)"
              placeholder="Enter a title for this section..."
              value={section.title || ""}
              onChange={(event) => onUpdateTitle(event.currentTarget.value)}
              styles={{
                label: {
                  color: "var(--color-text-muted)",
                  marginBottom: "8px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                },
                input: {
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                },
              }}
            />
          )}

          <SectionBlock
            section={section}
            isEditing={isEditing}
            onChange={onUpdateSection}
            showTitle={!isEditing}
          />

          {isEditing && (
            <div
              className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-2 mt-4 pt-4 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Tooltip label="Delete section">
                <ActionIcon
                  size="lg"
                  variant="default"
                  onClick={onDelete}
                  className="w-full sm:w-auto"
                  styles={{
                    root: {
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      borderColor: "var(--color-error)",
                      color: "var(--color-error)",
                    },
                  }}
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </ActionIcon>
              </Tooltip>

              <div className="flex gap-2 w-full sm:w-auto">
                <Tooltip label="Cancel editing">
                  <ActionIcon
                    size="lg"
                    variant="default"
                    onClick={onCancelEditing}
                    className="flex-1 sm:flex-initial"
                    styles={{
                      root: {
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-secondary)",
                      },
                    }}
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Save changes">
                  <ActionIcon
                    size="lg"
                    variant="filled"
                    onClick={onSaveEditing}
                    className="flex-1 sm:flex-initial"
                    styles={{
                      root: {
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-surface)",
                      },
                    }}
                  >
                    <span className="material-symbols-outlined text-xl">check</span>
                  </ActionIcon>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
