"use client";

import { MCQQuestion, QuestionPatch, labelStyle, inputStyle, btnStyle, addBtnStyle, MCQOption } from "../types";

interface MultiSelectEditorProps {
    question: MCQQuestion;
    onUpdate: (uid: string, patch: QuestionPatch) => void;
}

export default function MuliSelectEditor({ question, onUpdate }: MultiSelectEditorProps) {
    const { uid, options, correctOptionIds } = question;

    function toggleCorrect(optId: string, checked: boolean) {
        const next = checked
            ? [...correctOptionIds, optId]
            : correctOptionIds.filter((id) => id !== optId);
        onUpdate(uid, { correctOptionIds: next });
    }

    function updateOptionText(optId: string, text: string) {
        onUpdate(uid, {
            options: options.map((o) => (o.id === optId ? { ...o, text } : o)),
        });
    }

    function addOption() {
        const newOpt: MCQOption = { id: crypto.randomUUID(), text: "" };
        onUpdate(uid, { options: [...options, newOpt] });
    }

    function removeOption(optId: string) {
        const next = options.filter((o) => o.id !== optId);
        onUpdate(uid, {
            options: next,
            correctOptionIds: correctOptionIds.filter((id) => id !== optId).length > 0
                ? correctOptionIds.filter((id) => id !== optId)
                : next.length > 0 ? [next[0].id] : [],
        });
    }

    return (
        <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>
                Answer options{" "}
                <span style={{ color: "#6b7280", fontWeight: 400 }}>
                    (check all correct answers)
                </span>
            </label>
            {options.map((opt) => (
                <div
                    key={opt.id}
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
                >
                    <input
                        type="checkbox"
                        checked={correctOptionIds.includes(opt.id)}
                        onChange={(e) => toggleCorrect(opt.id, e.target.checked)}
                        title="Mark as correct answer"
                    />
                    <input
                        type="text"
                        value={opt.text}
                        placeholder="Option text…"
                        onChange={(e) => updateOptionText(opt.id, e.target.value)}
                        style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                    />
                    <button
                        onClick={() => removeOption(opt.id)}
                        disabled={options.length <= 2}
                        style={btnStyle(options.length <= 2, true)}
                        title="Remove option"
                    >
                        ✕
                    </button>
                </div>
            ))}
            <button onClick={addOption} style={addBtnStyle}>
                + Add option
            </button>
        </div>
    );
}
