"use server";

import { enrollInLesson as enrollApi } from "@/lib/api/enrollment";

export async function enrollInLessonAction(lessonId: string): Promise<void> {
  await enrollApi(lessonId);
}
