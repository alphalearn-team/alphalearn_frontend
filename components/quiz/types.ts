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
    icon: string;
}[] = [
        {
            id: "multiple-choice",
            label: "Multiple Choice",
            description: "One or more correct answers from several options",
            icon: "checklist",
        },
        {
            id: "true-false",
            label: "True / False",
            description: "True or False",
            icon: "toggle_on",
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
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "var(--color-text)",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    marginBottom: 8,
};

export const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "7px 10px",
    border: "1px solid var(--color-border)",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 0,
    boxSizing: "border-box",
    color: "var(--color-text)",
    background: "var(--color-surface)",
    outline: "none",
};

export function btnStyle(disabled: boolean, danger = false): React.CSSProperties {
    return {
        padding: "4px 8px",
        fontSize: 12,
        borderRadius: 5,
        border: "1px solid",
        cursor: disabled ? "not-allowed" : "pointer",
        borderColor: danger ? "var(--color-error)" : "var(--color-border)",
        background: disabled ? "transparent" : danger ? "rgba(239,68,68,0.1)" : "var(--color-overlay)",
        color: disabled ? "var(--color-text-muted)" : danger ? "var(--color-error)" : "var(--color-primary)",
        opacity: disabled ? 0.4 : 1,
        transition: "background 0.2s",
    };
}

export const addBtnStyle: React.CSSProperties = {
    marginTop: 4,
    padding: "5px 10px",
    fontSize: 12,
    border: "1px dashed rgba(255,255,255,0.2)",
    borderRadius: 6,
    background: "transparent",
    cursor: "pointer",
    color: "var(--color-text-muted)",
    transition: "color 0.15s, border-color 0.15s",
};
