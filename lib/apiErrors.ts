export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function throwApiErrorFromResponse(res: Response): Promise<never> {
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
