// main function for fetching data

import { getServerSession } from "@/lib/auth/server/session";
import { throwApiErrorFromResponse } from "@/lib/api/apiErrors";

export { ApiError } from "@/lib/api/apiErrors";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const session = await getServerSession();

  if (!session) {
    throw new Error("user not authenticated");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  // console.log(session.access_token);
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    await throwApiErrorFromResponse(res);
  }

  const responseText = await res.text();
  if (!responseText) {
    return null as T;
  }

  return JSON.parse(responseText);
}
