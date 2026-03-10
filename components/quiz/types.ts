export type QuestionType = "multiple-choice" | "true-false";

export interface MCQOption {
    id: string;
    text: string;
}

export interface Question {
    uid: string;
    type: QuestionType;
    prompt: string;
    options: MCQOption[];
    correctOptionIds: string[];
    correctBoolean: boolean;
}


export const SIDEBAR_TYPES: {
    id: QuestionType;
    label: string;
    description: string;
}[] = [
        {
            id: "multiple-choice",
            label: "Multiple Choice",
            description: "One correct answer from several options",
        },
        {
            id: "true-false",
            label: "True / False",
            description: "Student picks True or False",
        },
    ];

export function makeQuestion(type: QuestionType): Question {
    const opt1: MCQOption = { id: crypto.randomUUID(), text: "Option A" };
    const opt2: MCQOption = { id: crypto.randomUUID(), text: "Option B" };
    return {
        uid: crypto.randomUUID(),
        type,
        prompt: "",
        options: [opt1, opt2],
        correctOptionIds: [opt1.id],
        correctBoolean: true,
    };
}

export const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 4,
};

export const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "7px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 0,
    boxSizing: "border-box",
    color: "#111827",
    background: "#fff",
};

export function btnStyle(disabled: boolean, danger = false): React.CSSProperties {
    return {
        padding: "4px 8px",
        fontSize: 12,
        borderRadius: 5,
        border: "1px solid",
        cursor: disabled ? "not-allowed" : "pointer",
        borderColor: danger ? "#fca5a5" : "#d1d5db",
        background: disabled ? "#f3f4f6" : danger ? "#fee2e2" : "#f9fafb",
        color: disabled ? "#9ca3af" : danger ? "#dc2626" : "#374151",
        opacity: disabled ? 0.5 : 1,
    };
}

export const addBtnStyle: React.CSSProperties = {
    marginTop: 4,
    padding: "5px 10px",
    fontSize: 12,
    border: "1px dashed #d1d5db",
    borderRadius: 6,
    background: "transparent",
    cursor: "pointer",
    color: "#6b7280",
};
