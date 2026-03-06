"use client";

interface LessonSubmissionErrorProps {
  error: string | null;
}

export default function LessonSubmissionError({ error }: LessonSubmissionErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <div
      className="p-6 rounded-2xl border-l-4 shadow-lg"
      style={{
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        borderLeftColor: "var(--color-error)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "var(--color-error)", color: "white" }}>
          <span className="material-symbols-outlined text-xl">error</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-base mb-1" style={{ color: "var(--color-error)" }}>
            Unable to Submit
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-error)", opacity: 0.95 }}>
            {error}
          </p>
        </div>
      </div>
    </div>
  );
}
