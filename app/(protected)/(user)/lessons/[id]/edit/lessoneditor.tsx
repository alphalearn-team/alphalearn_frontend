"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/texteditor/textEditor").then(m => m.RichTextEditor), { ssr: false });
import { MultiSelect } from "@mantine/core";
import { showSuccess, showError } from "@/lib/actions/notifications";
import { createLesson, saveLesson, submitLesson, deleteLesson, unpublishLesson } from "@/lib/actions/lesson";
import { Concept, CreateLessonRequest, LessonContent } from "@/interfaces/interfaces";
import ConfirmModal from "@/components/common/confirmModal";
import { getLessonModerationSubmitToast } from "@/lib/lessonModeration";

export interface LessonEditorProps {
  id?: string;
  initialTitle: string;
  initialContent: LessonContent;
  availableConcepts?: Concept[];
  initialConceptPublicIds?: string[];
  initialStatus?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong";
}

export default function LessonEditor({
  id,
  initialTitle,
  initialContent,
  availableConcepts = [],
  initialConceptPublicIds = [],
  initialStatus = "UNPUBLISHED",
}: LessonEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedConceptPublicIds, setSelectedConceptPublicIds] = useState<string[]>(
    initialConceptPublicIds,
  );
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"save" | "submit" | null>(null);
  const [discardModalOpened, setDiscardModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const isCreateMode = !id;

  const createLessonWithMode = async (submitForReview: boolean) => {
    if (selectedConceptPublicIds.length === 0) {
      showError("Please select at least one concept");
      return;
    }

    setLoading(true);
    setLoadingAction(submitForReview ? "submit" : "save");

    try {
      const response = await createLesson({
        title,
        content,
        conceptPublicIds: selectedConceptPublicIds,
        submit: submitForReview,
      } satisfies CreateLessonRequest);

      if (response.success) {
        if (submitForReview) {
          showSuccess(getLessonModerationSubmitToast(response.data?.moderationStatus));

          const lessonPublicId = response.data?.lessonPublicId;
          router.replace(lessonPublicId ? `/lessons/${lessonPublicId}` : "/lessons/mine");
        } else {
          showSuccess("Draft saved successfully.");
          router.replace("/lessons/mine");
        }
      } else {
        showError(response.message || "Failed");
      }
    } catch (error: unknown) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleSave = async () => {
    if (isCreateMode && selectedConceptPublicIds.length === 0) {
      showError("Please select at least one concept");
      return;
    }

    if (isCreateMode) {
      await createLessonWithMode(false);
      return;
    }

    setLoading(true);
    setLoadingAction("save");

    try {
      const response = await saveLesson({ id: id!, title, content });

      if (response.success) {
        showSuccess(response.message || "Saved!");
        router.refresh();
      } else {
        showError(response.message || "Failed");
      }

    } catch (error: unknown) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setLoading(true);
    setLoadingAction("save");
    try {
      const response = await deleteLesson(id);
      if (response.success) {
        showSuccess(response.message);
        router.replace("/lessons/mine");
      } else {
        showError(response.message);
      }
    } catch (error: unknown) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingAction(null);
      setDeleteModalOpened(false);
    }
  };

  const handleUnpublish = async () => {
    if (!id) return;

    setLoading(true);
    setLoadingAction("submit");
    try {
      const response = await unpublishLesson(id);
      if (response.success) {
        showSuccess(response.message);
        router.refresh();
      } else {
        showError(response.message);
      }
    } catch (error: unknown) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleSubmitForReview = async () => {
    if (!id) return;

    setLoading(true);
    setLoadingAction("submit");
    try {
      const saveResponse = await saveLesson({ id, title, content });

      if (!saveResponse.success) {
        showError(saveResponse.message || "Failed to save changes");
        return;
      }

      const response = await submitLesson(id);
      if (response.success) {
        showSuccess(getLessonModerationSubmitToast(response.data?.moderationStatus));
        router.replace(`/lessons/${id}`);
      } else {
        showError(response.message);
      }
    } catch (error: unknown) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Title Input ── */}
      <div className="space-y-2">
        <label
          htmlFor="lesson-title"
          className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
        >
          Lesson Title
        </label>
        <input
          id="lesson-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your lesson a bold title..."
          className="w-full px-5 py-4 rounded-xl text-2xl font-bold
            bg-[var(--color-surface)] border border-[var(--color-border)]
            text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/40
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]
            transition-all duration-300"
        />
      </div>

      {/* ── Concept Selector (Create mode only) ── */}
      {isCreateMode && (
        <MultiSelect
          label="Concepts"
          placeholder="Select one or more concepts"
          data={availableConcepts.map((concept) => ({
            value: concept.publicId,
            label: concept.title,
          }))}
          value={selectedConceptPublicIds}
          onChange={setSelectedConceptPublicIds}
          searchable
          clearable
          nothingFoundMessage="No concepts found"
          styles={{
            root: {
              marginBottom: "var(--mantine-spacing-md)",
            },
            input: {
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              borderRadius: "12px",
              minHeight: "54px",
              padding: "8px 16px",
              color: "var(--color-text)",
              "&:focus-within": {
                borderColor: "var(--color-primary)",
                boxShadow: "0 0 0 2px var(--color-primary-overlay)",
              }
            },
            label: {
              color: "var(--color-text-muted)",
              marginBottom: "8px",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
            },
            dropdown: {
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "8px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            },
            option: {
              borderRadius: "8px",
              padding: "10px 12px",
              "&[dataSelected]": {
                backgroundColor: "var(--color-primary)",
              },
              "&[dataComboboxSelected]": {
                backgroundColor: "var(--color-primary)",
              },
              "&[dataComboboxActive]":{
                BackgroundColor:"var(--color-primary-hover)",
              },
            },
            pill: {
              backgroundColor: "var(--color-primary)",
              color: "white",
              fontWeight: 600,
              borderRadius: "6px",
            },
            inputField: {
              color: "var(--color-text)",
            }
          }}
        />
      )}

      {/* ── Rich Text Editor ── */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Content
        </label>
        <div
          className="rounded-xl border border-[var(--color-border)]
            focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 focus-within:border-[var(--color-primary)]
            transition-all duration-300"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <RichTextEditor
            value={content}
            onChange={setContent}
            isEditing
          />
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setDiscardModalOpened(true)}
            className="px-8 py-3 rounded-xl text-sm font-semibold
              text-[var(--color-text-muted)] hover:text-[var(--color-text)]
              bg-transparent hover:bg-[var(--color-overlay)]
              border border-[var(--color-border)]
              transition-all duration-200 cursor-pointer"
          >
            Discard
          </button>

          {!isCreateMode && (
            <button
              type="button"
              onClick={() => setDeleteModalOpened(true)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold
              text-red-400 hover:text-red-300
              bg-transparent hover:bg-red-500/10
              border border-red-500/20 hover:border-red-500/40
              transition-all duration-200 cursor-pointer
              flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Delete Lesson
            </button>
          )}
        </div>

        <ConfirmModal
          opened={discardModalOpened}
          onClose={() => setDiscardModalOpened(false)}
          onConfirm={() => router.back()}
          title="Discard Changes?"
          message="Are you sure you want to discard your changes? This action cannot be undone."
          confirmText="Discard"
          confirmColor="red"
          icon="delete"
        />

        <ConfirmModal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          onConfirm={handleDelete}
          title="Delete Lesson?"
          message="This action is permanent and cannot be undone. All content in this lesson will be lost."
          confirmText="Delete Permanently"
          confirmColor="red"
          icon="delete_forever"
        />

        <div className="flex gap-3">
          {isCreateMode && (
            <button
              type="button"
              disabled={loading}
              onClick={() => createLessonWithMode(true)}
              className="px-6 py-3 rounded-xl text-sm font-bold
                bg-transparent hover:bg-[var(--color-overlay)]
                text-[var(--color-primary)] border border-[var(--color-primary)]
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
                flex items-center gap-2"
            >
              {loading && loadingAction === "submit" && (
                <span className="material-symbols-outlined text-base animate-spin">
                  progress_activity
                </span>
              )}
              <span className="material-symbols-outlined text-base">
                send
              </span>
              Submit for Review
            </button>
          )}

          {!isCreateMode && (
            initialStatus === "PENDING" ? (
              <button
                type="button"
                disabled
                className="px-6 py-3 rounded-xl text-sm font-bold
                  bg-transparent
                  text-[var(--color-text-muted)] border border-[var(--color-border)]
                  disabled:opacity-70 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center gap-2"
                title="This lesson is currently in manual review."
              >
                <span className="material-symbols-outlined text-base">
                  hourglass_top
                </span>
                Submitted for Review
              </button>
            ) : initialStatus === "APPROVED" ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleUnpublish}
                className="px-6 py-3 rounded-xl text-sm font-bold
                  bg-transparent hover:bg-[var(--color-overlay)]
                  text-[var(--color-primary)] border border-[var(--color-primary)]
                  active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 cursor-pointer
                  flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  visibility_off
                </span>
                Unpublish
              </button>
            ) : initialStatus === "UNPUBLISHED" || initialStatus === "REJECTED" ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmitForReview}
                className="px-6 py-3 rounded-xl text-sm font-bold
                  bg-transparent hover:bg-[var(--color-overlay)]
                  text-[var(--color-primary)] border border-[var(--color-primary)]
                  active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 cursor-pointer
                  flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  send
                </span>
                Submit for Review
              </button>
            ) : null
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-8 py-3 rounded-xl text-sm font-bold
              bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
              active:bg-[var(--color-primary-active)]
              text-white shadow-[0_0_20px_var(--color-shadow)]
              hover:shadow-[0_0_30px_var(--color-shadow-hover)]
              hover:-translate-y-0.5 active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              transition-all duration-200 cursor-pointer
              flex items-center gap-2"
          >
            {loading && loadingAction === "save" && (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            )}
            {loading
              ? loadingAction === "save"
                ? "Saving..."
                : isCreateMode
                  ? "Save Draft"
                  : "Save Changes"
              : isCreateMode
                ? "Save Draft"
                : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
