
"use client";

import React, { useState } from "react";
import { enrollLesson } from "@/lib/actions/lesson";
import { showError, showSuccess } from "@/lib/actions/notifications";

export default function EnrollLessonButton({ lessonPublicId }: { lessonPublicId: string }) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const handleEnroll = async (e?: React.MouseEvent) => {
    // prevent link navigation when button is inside a clickable card
    if (e) {
      e.stopPropagation();
    }

    if (loading || enrolled) return;
    setLoading(true);
    try {
      const res = await enrollLesson(lessonPublicId);
      if (res.success) {
        setEnrolled(true);
        showSuccess(res.message);
      } else {
        showError(res.message);
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to enroll");
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) return null;

  return (
    <button
      type="button"
      onClick={(e) => handleEnroll(e)}
      disabled={loading || enrolled}
      className="inline-flex h-10 items-center rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Enrolling..." : enrolled ? "Enrolled" : "Enroll"}
    </button>
  );
}
