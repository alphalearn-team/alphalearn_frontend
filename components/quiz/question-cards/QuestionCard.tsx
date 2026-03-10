"use client";

import { Question, SIDEBAR_TYPES, labelStyle, inputStyle, btnStyle } from "../types";
import MCQEditor from "./MCQEditor";
import TrueFalseEditor from "./TrueFalseEditor";

interface QuestionCardProps {
    question: Question;
    index: number;
    total: number;
    onUpdate: (uid: string, patch: Partial<Question>) => void;
    onDelete: (uid: string) => void;
    onMove: (uid: string, direction: "up" | "down") => void;
}

export default function QuestionCard({
    question,
    index,
    total,
    onUpdate,
    onDelete,
    onMove,
}: QuestionCardProps) {
    const { uid, type } = question;
    const typeLabel = SIDEBAR_TYPES.find((t) => t.id === type)?.label ?? type;

    return (
        <div
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
        >
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 8 }}>
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        color: "#6b7280",
                    }}
                >
                    Q{index + 1} · {typeLabel}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    <button
                        disabled={index === 0}
                        onClick={() => onMove(uid, "up")}
                        title="Move up"
                        style={btnStyle(index === 0)}
                    >
                        ↑
                    </button>
                    <button
                        disabled={index === total - 1}
                        onClick={() => onMove(uid, "down")}
                        title="Move down"
                        style={btnStyle(index === total - 1)}
                    >
                        ↓
                    </button>
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
                <MCQEditor question={question} onUpdate={onUpdate} />
            )}
            {type === "true-false" && (
                <TrueFalseEditor question={question} onUpdate={onUpdate} />
            )}

        </div>
    );
}
