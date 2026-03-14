"use client";

import { useState } from "react";
import {
  Question,
  QuestionPatch,
  QuestionType,
  SIDEBAR_TYPES,
  makeQuestion,
} from "./types";

export function useQuizState() {
  const [questions, setQuestions] = useState<Question[]>([]);

  type DragEvent = {
    canceled?: boolean;
    operation: {
      source?: { id: string | number } | null;
      target?: { id: string | number } | null;
    };
  };

  function addQuestion(type: QuestionType) {
    setQuestions((prev) => [...prev, makeQuestion(type)]);
  }

  function updateQuestion(uid: string, patch: QuestionPatch) {
    setQuestions((prev) =>
      prev.map((q) => (q.uid === uid ? ({ ...q, ...patch } as Question) : q)),
    );
  }

  function deleteQuestion(uid: string) {
    setQuestions((prev) => prev.filter((q) => q.uid !== uid));
  }

  function handleDragStart(_event: DragEvent) {
    // Optional drag visual setup here
    void _event;
  }

  function handleDragMove(event: DragEvent) {
    const { source, target } = event.operation;
    if (!source || !target) return;

    setQuestions((prev) => {
      const fromIdx = prev.findIndex((q) => q.uid === source.id);
      const toIdx = prev.findIndex((q) => q.uid === target.id);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

  function handleDragEnd(event: DragEvent) {
    if (event.canceled) return;

    const { source, target } = event.operation;
    if (!source || !target) return;

    // Only handle sidebar tile drops
    if (!SIDEBAR_TYPES.some((t) => t.id === source.id)) return;

    const type = source.id as QuestionType;

    if (typeof target.id === "string" && target.id.startsWith("gap-")) {
      const insertAt = parseInt(target.id.split("-")[1], 10);
      setQuestions((prev) => {
        const next = [...prev];
        next.splice(insertAt, 0, makeQuestion(type));
        return next;
      });
      return;
    }

    if (target.id === "canvas") {
      setQuestions((prev) => [...prev, makeQuestion(type)]);
    }
  }

  return {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
