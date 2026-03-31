"use client";

import { Card, Text, Group } from "@mantine/core";
import { enrollInLessonAction } from "./enrollmentActions";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

export default function EnrollmentGate({ lessonId }: { lessonId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setLoading(true);
    try {
      await enrollInLessonAction(lessonId);
      notifications.show({
        title: "Enrolled Successfully!",
        message: "You now have access to this lesson's content and quizzes.",
        color: "green",
      });
      router.refresh();
    } catch {
      notifications.show({
        title: "Enrollment Failed",
        message: "Something went wrong. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      padding="xl"
      radius="md"
      withBorder
      className="text-center py-16 bg-[var(--color-surface)] border-[var(--color-border)]"

    >
      <span className="material-symbols-outlined text-5xl mb-4 text-[var(--color-text-muted)] opacity-50 block ">
        lock
      </span>
      <Text size="xl" fw={600} mb="sm" className="text-[var(--color-text)]">
        Content Locked
      </Text>
      <Text size="sm" c="dimmed" mb="xl" className="max-w-full">
        Enroll in this lesson to unlock all sections and attempt the quizzes.
      </Text>
      <Group justify="center">
        <GlowButton onClick={handleEnroll} size="lg">
          Enroll Now
        </GlowButton>
      </Group>
    </Card>
  );
}
