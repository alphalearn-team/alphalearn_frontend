"use client";

interface LessonEditorActionBarProps {
  currentStatus: string;
  isCreateMode: boolean;
  loading: boolean;
  loadingAction: "save" | "submit" | null;
  onCreateSubmit: () => void;
  onOpenDelete: () => void;
  onOpenDiscard: () => void;
  onSave: () => void;
  onSubmitForReview: () => void;
  onUnpublish: () => void;
}

export default function LessonEditorActionBar({
  currentStatus,
  isCreateMode,
  loading,
  loadingAction,
  onCreateSubmit,
  onOpenDelete,
  onOpenDiscard,
  onSave,
  onSubmitForReview,
  onUnpublish,
}: LessonEditorActionBarProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onOpenDiscard}
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
            onClick={onOpenDelete}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold
              text-red-400 hover:text-red-300
              bg-transparent hover:bg-red-500/10
              border border-red-500/20 hover:border-red-500/40
              transition-all duration-200 cursor-pointer
              flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete Lesson
          </button>
        )}
      </div>

      <div className="flex gap-3">
        {isCreateMode && (
          <button
            type="button"
            disabled={loading}
            onClick={onCreateSubmit}
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
            <span className="material-symbols-outlined text-base">send</span>
            Submit for Review
          </button>
        )}

        {!isCreateMode &&
          (currentStatus === "PENDING" ? (
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
              <span className="material-symbols-outlined text-base">hourglass_top</span>
              Submitted for Review
            </button>
          ) : currentStatus === "APPROVED" ? (
            <button
              type="button"
              disabled={loading}
              onClick={onUnpublish}
              className="px-6 py-3 rounded-xl text-sm font-bold
                bg-transparent hover:bg-[var(--color-overlay)]
                text-[var(--color-primary)] border border-[var(--color-primary)]
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
                flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">visibility_off</span>
              Unpublish
            </button>
          ) : currentStatus === "UNPUBLISHED" || currentStatus === "REJECTED" ? (
            <button
              type="button"
              disabled={loading}
              onClick={onSubmitForReview}
              className="px-6 py-3 rounded-xl text-sm font-bold
                bg-transparent hover:bg-[var(--color-overlay)]
                text-[var(--color-primary)] border border-[var(--color-primary)]
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
                flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Submit for Review
            </button>
          ) : null)}

        <button
          type="button"
          disabled={loading}
          onClick={onSave}
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
  );
}
