import { Group } from "@mantine/core";

export function CreateLessonHeaderMeta() {
  return (
    <Group gap="xs" align="center">
      <div className="w-5 h-px bg-[var(--color-primary)]" />
      <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
        Lesson Creator
      </span>
    </Group>
  );
}

export function CreateLessonShellTitle() {
  return (
    <>
      Create a New <span className="text-[var(--color-primary)]">Lesson</span>
    </>
  );
}
