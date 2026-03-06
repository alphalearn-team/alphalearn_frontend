"use client";

interface LessonTitleInputProps {
  title: string;
  onChange: (value: string) => void;
}

export default function LessonTitleInput({ title, onChange }: LessonTitleInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="lesson-title"
        className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
      >
        Lesson Title
      </label>
      <input
        id="lesson-title"
        type="text"
        value={title}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Give your lesson a bold title..."
        className="w-full px-5 py-4 rounded-xl text-2xl font-bold
          bg-[var(--color-surface)] border border-[var(--color-border)]
          text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/40
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]
          transition-all duration-300"
      />
    </div>
  );
}
