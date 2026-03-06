"use server";

// server side logic that the client component can use

import { apiFetch } from "../api";
import { CreateLessonRequest, CreateLessonWithSectionsRequest, Lesson, LessonContent } from "@/interfaces/interfaces";
import { revalidatePath } from "next/cache";

const headers = { "Content-Type": "application/json" };

export type LessonActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

type CreateLessonResponse = Partial<Lesson> & {
  lessonPublicId?: string;
};

function getLessonPublicId(lesson: unknown): string | null {
  if (!lesson || typeof lesson !== "object") {
    return null;
  }

  const lessonPublicId = (lesson as { lessonPublicId?: unknown }).lessonPublicId;
  return typeof lessonPublicId === "string" && lessonPublicId.length > 0
    ? lessonPublicId
    : null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong";
}

async function handleRequest<T = void>(
  url: string,
  options: RequestInit,
  message = "Successfully saved",
): Promise<LessonActionResult<T>> {
  try {
    const data = await apiFetch<T>(url, options);
    return { success: true, message, data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function saveLesson({ id, title, content }: { id: string; title: string; content: LessonContent; }): Promise<LessonActionResult<Lesson>> {
  const response = await handleRequest<Lesson>(`/lessons/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ title, content }),
  }, "Successfully saved");

  if (response.success) {
    revalidatePath("/lessons/mine");
    revalidatePath(`/lessons/${id}`);
    revalidatePath(`/lessons/${id}/edit`);
  }

  return response;
}

export async function createLesson(inputs: CreateLessonRequest): Promise<LessonActionResult<CreateLessonResponse | Lesson>> {
  const response = await handleRequest<CreateLessonResponse>(`/lessons`, {
    method: "POST",
    headers,
    body: JSON.stringify(inputs),
  }, inputs.submit ? "Lesson submitted successfully" : "Draft saved successfully");

  if (response.success) {
    revalidatePath("/lessons");
    revalidatePath("/lessons/mine");

    const lessonPublicId = getLessonPublicId(response.data);

    if (lessonPublicId) {
      revalidatePath(`/lessons/${lessonPublicId}`);
      revalidatePath(`/lessons/${lessonPublicId}/edit`);
    }

    if (inputs.submit && lessonPublicId) {
      try {
        const lesson = await apiFetch<Lesson>(`/lessons/${lessonPublicId}`);
        return {
          success: true,
          message: response.message,
          data: lesson,
        };
      } catch {
        return response;
      }
    }
  }

  return response;
}

export async function createLessonWithSections(inputs: CreateLessonWithSectionsRequest): Promise<LessonActionResult<CreateLessonResponse | Lesson>> {
  const response = await handleRequest<CreateLessonResponse>(`/lessons`, {
    method: "POST",
    headers,
    body: JSON.stringify(inputs),
  }, inputs.submit ? "Lesson submitted successfully" : "Draft saved successfully");

  if (response.success) {
    revalidatePath("/lessons");
    revalidatePath("/lessons/mine");

    const lessonPublicId = getLessonPublicId(response.data);

    if (lessonPublicId) {
      revalidatePath(`/lessons/${lessonPublicId}`);
      revalidatePath(`/lessons/${lessonPublicId}/edit`);
    }

    if (inputs.submit && lessonPublicId) {
      try {
        const lesson = await apiFetch<Lesson>(`/lessons/${lessonPublicId}`);
        return {
          success: true,
          message: response.message,
          data: lesson,
        };
      } catch {
        return response;
      }
    }
  }

  return response;
}

export async function submitLesson(id: string): Promise<LessonActionResult<Lesson>> {
  const response = await handleRequest<Lesson>(`/lessons/${id}/submit`, {
    method: "POST",
    headers,
  }, "Successfully submitted for review");

  if (response.success) {
    revalidatePath("/lessons");
    revalidatePath("/lessons/mine");
    revalidatePath(`/lessons/${id}`);
    revalidatePath(`/lessons/${id}/edit`);

    try {
      const lesson = await apiFetch<Lesson>(`/lessons/${id}`);
      return {
        success: true,
        message: response.message,
        data: lesson,
      };
    } catch {
      return response;
    }
  }

  return response;
}

// Will be used after editLessonSections is implemented

// export async function submitLesson(id: string): Promise<LessonActionResult<Lesson>> {
//   const successMessage = "Successfully submitted for review";

//   try {
//     await apiFetch<void>(`/lessons/${id}/submit`, {
//       method: "POST",
//       headers,
//     });
//   } catch (error: unknown) {
//     if (error instanceof ApiError && error.status === 409) {
//       return {
//         success: false,
//         message: "Only UNPUBLISHED or REJECTED lessons can be submitted for review.",
//       };
//     }

//     return { success: false, message: getErrorMessage(error) };
//   }

//   revalidatePath("/lessons");
//   revalidatePath("/lessons/mine");
//   revalidatePath(`/lessons/${id}`);
//   revalidatePath(`/lessons/${id}/edit`);

//   try {
//     const lesson = await apiFetch<Lesson>(`/lessons/${id}`);
//     return {
//       success: true,
//       message: successMessage,
//       data: lesson,
//     };
//   } catch {
//     return { success: true, message: successMessage };
//   }
// }

export async function deleteLesson(id: string): Promise<LessonActionResult> {
  const response = await handleRequest(`/lessons/${id}`, {
    method: "DELETE",
    headers,
  }, "Lesson deleted successfully");

  if (response.success) {
    revalidatePath("/lessons");
    revalidatePath("/lessons/mine");
    revalidatePath(`/lessons/${id}`);
    revalidatePath(`/lessons/${id}/edit`);
    return response;
  }

  return { success: false, message: "Unable to delete lesson, check that the lesson is unpublished first" };
}

export async function unpublishLesson(id: string): Promise<LessonActionResult<Lesson>> {
  const response = await handleRequest<Lesson>(`/lessons/${id}/unpublish`, {
    method: "POST",
    headers,
  }, "Lesson unpublished successfully");

  if (response.success) {
    revalidatePath("/lessons");
    revalidatePath("/lessons/mine");
    revalidatePath(`/lessons/${id}`);
    revalidatePath(`/lessons/${id}/edit`);

    try {
      const lesson = await apiFetch<Lesson>(`/lessons/${id}`);
      return {
        success: true,
        message: response.message,
        data: lesson,
      };
    } catch {
      return response as LessonActionResult<Lesson>;
    }
  }

  return response as LessonActionResult<Lesson>;
}

export async function enrollLesson(lessonPublicId: string): Promise<LessonActionResult> {
  const response = await handleRequest(`/lessonenrollments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ lessonPublicId }),
  }, "Successfully enrolled in lesson");

  if (response.success) {
    revalidatePath("/lessons");
    revalidatePath(`/lessons/${lessonPublicId}`);
  }

  return response;
}

