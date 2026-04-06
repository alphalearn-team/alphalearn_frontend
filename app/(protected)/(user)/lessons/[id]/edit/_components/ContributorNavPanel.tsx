"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { LessonQuiz } from "@/interfaces/interfaces";

interface ContributorNavPanelProps {
  lessonId: string;
  quizzes: LessonQuiz[];
}

export default function ContributorNavPanel({ lessonId, quizzes }: ContributorNavPanelProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 24 });
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    hasDragged.current = true;
    setPos({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    hasDragged.current = false;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [pos, onMouseMove, onMouseUp]);

  const handleButtonClick = () => {
    if (hasDragged.current) return; // ignore click if it was a drag
    setOpen((prev) => !prev);
  };

  return (
    <div
      ref={ref}
      className="fixed z-50"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Circle button */}
      <button
        onMouseDown={onMouseDown}
        onClick={handleButtonClick}
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-background)",
          cursor: dragging.current ? "grabbing" : "grab",
        }}
        title="Lesson navigation"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>map</span>
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute w-52 flex flex-col gap-3 py-4 px-3 shadow-xl"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            top: pos.y > window.innerHeight / 2 ? "auto" : 48,
            bottom: pos.y > window.innerHeight / 2 ? 48 : "auto",
            left: pos.x > window.innerWidth / 2 ? "auto" : 0,
            right: pos.x > window.innerWidth / 2 ? 0 : "auto",
          }}
        >
          {/* Lesson */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 mb-1" style={{ color: "var(--color-text-muted)" }}>
              Lesson
            </span>
            <Link
              href={`/lessons/${lessonId}/edit`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: "var(--color-text)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-overlay)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base" style={{ color: "var(--color-primary)" }}>description</span>
                Edit Lesson
              </div>
              <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-text-muted)" }}>arrow_forward</span>
            </Link>
          </div>

          <div style={{ height: 1, backgroundColor: "var(--color-border)" }} />

          {/* Quizzes */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 mb-1" style={{ color: "var(--color-text-muted)" }}>
              Quizzes
            </span>

            {quizzes.length === 0 && (
              <p className="text-xs px-2 py-1" style={{ color: "var(--color-text-muted)" }}>No quizzes yet</p>
            )}

            {quizzes.map((quiz, idx) => (
              <Link
                key={quiz.quizPublicId}
                href={`/quiz/edit?quizId=${quiz.quizPublicId}&lessonId=${lessonId}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "var(--color-text)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-overlay)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base" style={{ color: "var(--color-primary)" }}>quiz</span>
                  Quiz {idx + 1}
                </div>
                <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-text-muted)" }}>arrow_forward</span>
              </Link>
            ))}

            <Link
              href={`/quiz/edit?lessonId=${lessonId}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: "var(--color-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-overlay)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span className="material-symbols-outlined text-base">add</span>
              Create Quiz
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
