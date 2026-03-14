"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { Question, QuestionPatch, MCQQuestion, SingleChoiceQuestion, TrueFalseQuestion, SIDEBAR_TYPES, labelStyle, inputStyle, btnStyle } from "../types";
import MuliSelectEditor from "./MultiSelectEditor";
import MCQEditor from "./MCQEditor";
import TrueFalseEditor from "./TrueFalseEditor";

interface QuestionCardProps {
    question: Question;
    index: number;
    onUpdate: (uid: string, patch: QuestionPatch) => void;
    onDelete: (uid: string) => void;
}

export default function QuestionCard({
    question,
    index,
    onUpdate,
    onDelete,
}: QuestionCardProps) {
    const { uid, type } = question;
    const typeLabel = SIDEBAR_TYPES.find((t) => t.id === type)?.label ?? type;
    const { ref, handleRef, isDragging } = useSortable({ id: uid, index });

    return (
        <div
            ref={ref}
            style={{
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 16,
                backgroundColor: "rgba(156, 163, 175, 0.05)",
                border: "1px solid var(--color-border)",
                transition: "border-color 0.2s, opacity 0.2s",
                opacity: isDragging ? 0.4 : 1,
            }}
        >
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16, gap: 8 }}>
                {/* Drag handle */}
                <span
                    ref={handleRef}
                    className="material-symbols-outlined"
                    title="Drag to reorder"
                    style={{
                        fontSize: 20,
                        color: "var(--color-text-muted)",
                        cursor: "grab",
                        userSelect: "none",
                        flexShrink: 0,
                    }}
                >
                    drag_indicator
                </span>

                <span
                    style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        color: "var(--color-text)",
                    }}
                >
                    Q{index + 1} · {typeLabel}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    <button onClick={() => onDelete(uid)} title="Delete" style={btnStyle(false, true)}>
                        ✕
                    </button>
                </div>
            </div>

            {/* Prompt */}
            <label style={labelStyle}>Question prompt</label>
            <input
                type="text"
                value={question.prompt}
                placeholder="Enter your question here…"
                onChange={(e) => onUpdate(uid, { prompt: e.target.value })}
                style={inputStyle}
            />

            {/* Type-specific body */}
            {type === "multiple-choice" && (
                <MuliSelectEditor question={question as MCQQuestion} onUpdate={onUpdate} />
            )}
            {type === "single-choice" && (
                <MCQEditor question={question as SingleChoiceQuestion} onUpdate={onUpdate} />
            )}
            {type === "true-false" && (
                <TrueFalseEditor question={question as TrueFalseQuestion} onUpdate={onUpdate} />
            )}
        </div>
    );
}
