"use client";

import { MCQ, QuestionPatch, labelStyle, inputStyle, btnStyle, addBtnStyle, MCQOption } from "../types";

interface MCQEditorProps {
    question: MCQ;
    onUpdate: (uid: string, patch: QuestionPatch) => void;
}

export default function MCQEditor({ question, onUpdate }: MCQEditorProps) {
    const { uid, options, correctOptionId } = question;

    function setCorrect(optId: string) {
        onUpdate(uid, { correctOptionId: optId });
    }

    function updateOptionText(optId: string, text: string) {
        onUpdate(uid, {
            options: options.map((o: MCQOption) => (o.id === optId ? { ...o, text } : o)),
        });
    }

    function addOption() {
        const newOpt: MCQOption = { id: crypto.randomUUID(), text: "" };
        onUpdate(uid, { options: [...options, newOpt] });
    }

    function removeOption(optId: string) {
        const next = options.filter((o: MCQOption) => o.id !== optId);
        
        let nextCorrectId = correctOptionId;
        if (correctOptionId === optId && next.length > 0) {
            nextCorrectId = next[0].id;
        }

        onUpdate(uid, {
            options: next,
            correctOptionId: nextCorrectId,
        });
    }

    return (
        <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>
                Answer options{" "}
                <span style={{ color: "#6b7280", fontWeight: 400 }}>
                    (select the single correct answer)
                </span>
            </label>
            {options.map((opt: MCQOption) => (
                <div
                    key={opt.id}
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
                >
                    <input
                        type="radio"
                        name={`correct-option-${uid}`}
                        checked={correctOptionId === opt.id}
                        onChange={() => setCorrect(opt.id)}
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
