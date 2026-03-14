import { getServerSession } from "@/lib/auth/session";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const session = await getServerSession();

  if (!session) {
    throw new Error("user not authenticated");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  console.log(session.access_token);
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
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

  // Handle 204 No Content 
  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}
