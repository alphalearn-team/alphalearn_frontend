"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/confirmModal/ConfirmModal";
import { deleteLesson } from "@/app/(protected)/(user)/lessons/_actions/lesson";
import { showError, showSuccess } from "@/lib/utils/popUpNotifications";

interface LessonDetailOwnerActionsProps {
  lessonId: string;
  canEdit: boolean;
  canDelete: boolean;
  showBackToMine?: boolean;
}

export default function LessonDetailOwnerActions({
  lessonId,
  canEdit,
  canDelete,
  showBackToMine = false,
}: LessonDetailOwnerActionsProps) {
  const router = useRouter();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteLesson(lessonId);
      if (response.success) {
        showSuccess(response.message);
        router.replace("/lessons/mine");
      } else {
        showError(response.message);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete lesson");
    } finally {
      setLoading(false);
      setDeleteModalOpened(false);
    }
  };

  if (!canEdit && !canDelete && !showBackToMine) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {showBackToMine && (
          <Link
            href="/lessons/mine"
            className="inline-flex h-10 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-overlay)] hover:text-[var(--color-text)]"
          >
            Back to My Lessons
          </Link>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={() => setDeleteModalOpened(true)}
            className="inline-flex h-10 items-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            Delete
          </button>
        )}

        {canEdit && (
          <Link
            href={`/lessons/${lessonId}/edit`}
            className="inline-flex h-10 items-center rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            Edit Lesson
          </Link>
        )}
      </div>

      <ConfirmModal
        opened={deleteModalOpened}
        onClose={() => !loading && setDeleteModalOpened(false)}
        onConfirm={handleDelete}
        title="Delete Lesson?"
        message="You can delete unpublished, pending, rejected, or approved lessons. This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
        icon="delete_forever"
        loading={loading}
      />
    </>
  );
}
