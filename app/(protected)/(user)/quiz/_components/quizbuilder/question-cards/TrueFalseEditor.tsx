"use client";

import { TrueFalseQuestion, QuestionPatch, labelStyle } from "../types";

interface TrueFalseEditorProps {
    question: TrueFalseQuestion;
    onUpdate: (uid: string, patch: QuestionPatch) => void;
}

export default function TrueFalseEditor({ question, onUpdate }: TrueFalseEditorProps) {
    const { uid, correctBoolean } = question;

    return (
        <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Correct answer</label>
            <div style={{ display: "flex", gap: 16 }}>
                {([true, false] as const).map((val) => (
                    <label
                        key={String(val)}
                        style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--color-text)" }}
                    >
                        <input
                            type="radio"
                            name={`tf-${uid}`}
                            checked={correctBoolean === val}
                            onChange={() => onUpdate(uid, { correctBoolean: val })}
                        />
                        {val ? "True" : "False"}
                    </label>
                ))}
            </div>
        </div>
    );
}
