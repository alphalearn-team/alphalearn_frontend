export type QuestionType = "multiple-choice" | "single-choice" | "true-false";

export interface MCQOption {
    id: string;
    text: string;
}

export interface BaseQuestion {
    uid: string;
    type: QuestionType;
    prompt: string;
}

export interface MCQQuestion extends BaseQuestion {
    type: "multiple-choice";
    options: MCQOption[];
    correctOptionIds: string[];
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: "true-false";
    correctBoolean: boolean;
}

export interface SingleChoiceQuestion extends BaseQuestion {
    type: "single-choice";
    options: MCQOption[];
    correctOptionId: string;
}

export type Question = MCQQuestion | SingleChoiceQuestion | TrueFalseQuestion;
export type QuestionPatch = Partial<MCQQuestion> & Partial<SingleChoiceQuestion> & Partial<TrueFalseQuestion>;


export const SIDEBAR_TYPES: {
    id: QuestionType;
    label: string;
    description: string;
    icon: string;
}[] = [
        {
            id: "multiple-choice",
            label: "Multi-Select",
            description: "One or more correct answers from several options",
            icon: "checklist",
        },
        {
            id: "single-choice",
            label: "MCQ",
            description: "A single correct answer from several options",
            icon: "radio_button_checked",
        },
        {
            id: "true-false",
            label: "True / False",
            description: "True or False",
            icon: "toggle_on",
        },
    ];

export function makeQuestion(type: QuestionType): Question {
    if (type === "multiple-choice") {
        const opt1: MCQOption = { id: crypto.randomUUID(), text: "Option A" };
        const opt2: MCQOption = { id: crypto.randomUUID(), text: "Option B" };
        return {
            uid: crypto.randomUUID(),
            type: "multiple-choice",
            prompt: "",
            options: [opt1, opt2],
            correctOptionIds: [opt1.id],
        };
    }
    
    if (type === "single-choice") {
        const opt1: MCQOption = { id: crypto.randomUUID(), text: "Option A" };
        const opt2: MCQOption = { id: crypto.randomUUID(), text: "Option B" };
        return {
            uid: crypto.randomUUID(),
            type: "single-choice",
            prompt: "",
            options: [opt1, opt2],
            correctOptionId: opt1.id,
        };
    }
    
    return {
        uid: crypto.randomUUID(),
        type: "true-false",
        prompt: "",
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
