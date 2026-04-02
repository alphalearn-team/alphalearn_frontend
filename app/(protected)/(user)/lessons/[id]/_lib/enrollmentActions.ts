"use server";

import { enrollInLesson as enrollApi } from "@/app/(protected)/(user)/lessons/[id]/_lib/enrollment";

export async function enrollInLessonAction(lessonId: string): Promise<void> {
  await enrollApi(lessonId);
}
