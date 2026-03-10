"use client";

import { Question, labelStyle } from "../types";

interface TrueFalseEditorProps {
    question: Question;
    onUpdate: (uid: string, patch: Partial<Question>) => void;
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
                        style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
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
