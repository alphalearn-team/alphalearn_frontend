import { ApiError } from "@/lib/api";

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
    const statusFallback = `Request failed (${res.status}${res.statusText ? ` ${res.statusText}` : ""})`;
    const rawBody = await res.text();

    if (!rawBody) {
      throw new ApiError(res.status, statusFallback);
    }

    let message = statusFallback;
    try {
      const errbody = JSON.parse(rawBody) as { message?: string };
      message = errbody.message || statusFallback;
    } catch {
      message = rawBody || statusFallback;
    }

    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}
