"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/lib/utils/popUpNotifications";
import {
  createLesson,
  deleteLesson,
  saveLesson,
  submitLesson,
  unpublishLesson,
} from "@/app/(protected)/(user)/lessons/_actions/lesson";
import { CreateLessonRequest, LessonContent } from "@/interfaces/interfaces";
import {
  getLessonModerationSubmitToast,
  normalizeLessonModerationStatus,
} from "@/lib/utils/lessonModeration";

type LoadingAction = "save" | "submit" | null;

export interface UseLessonEditorActionsParams {
  id?: string;
  initialTitle: string;
  initialContent: LessonContent;
  initialConceptPublicIds: string[];
  initialStatus: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong";
}

export function useLessonEditorActions({
  id,
  initialTitle,
  initialContent,
  initialConceptPublicIds,
  initialStatus,
}: UseLessonEditorActionsParams) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedConceptPublicIds, setSelectedConceptPublicIds] = useState<string[]>(
    initialConceptPublicIds,
  );
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const [discardModalOpened, setDiscardModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    normalizeLessonModerationStatus(initialStatus),
  );

  const isCreateMode = !id;

  useEffect(() => {
    setCurrentStatus(normalizeLessonModerationStatus(initialStatus));
  }, [initialStatus]);

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
    if (isCreateMode) {
      await createLessonWithMode(false);
      return;
    }

    if (!id) return;

    setLoading(true);
    setLoadingAction("save");

    try {
      const response = await saveLesson({ id, title, content });

      if (response.success) {
        const moderationStatus = response.data?.moderationStatus;
        if (moderationStatus) {
          setCurrentStatus(normalizeLessonModerationStatus(moderationStatus));
        }
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

  const handleDiscard = () => {
    router.back();
  };

  return {
    content,
    createLessonWithMode,
    currentStatus,
    deleteModalOpened,
    discardModalOpened,
    handleDelete,
    handleDiscard,
    handleSave,
    handleSubmitForReview,
    handleUnpublish,
    isCreateMode,
    loading,
    loadingAction,
    selectedConceptPublicIds,
    setContent,
    setDeleteModalOpened,
    setDiscardModalOpened,
    setSelectedConceptPublicIds,
    setTitle,
    title,
  };
}
