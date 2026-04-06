// purpose: allow server actions on the client components

import { throwApiErrorFromResponse } from "@/lib/api/apiErrors";

export async function apiClientFetch<T>(
  endpoint: string,
  accessToken: string,
  options?: RequestInit,
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  if (!accessToken) {
    throw new Error("user not authenticated");
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
