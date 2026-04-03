import type { CanvasStroke } from "../../_lib/gameSetup";

export function parseDrawingSnapshot(snapshot: string | null): CanvasStroke[] {
  if (!snapshot) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCanvasStroke);
  } catch {
    return [];
  }
}

export function stringifyDrawingSnapshot(strokes: CanvasStroke[]): string {
  return JSON.stringify(strokes);
}

function isCanvasStroke(value: unknown): value is CanvasStroke {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as CanvasStroke;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.playerId === "string" &&
    typeof candidate.color === "string" &&
    typeof candidate.width === "number" &&
    Array.isArray(candidate.points) &&
    candidate.points.every(
      (point) =>
        Boolean(point) &&
        typeof point === "object" &&
        typeof (point as { x: unknown }).x === "number" &&
        typeof (point as { y: unknown }).y === "number",
    )
  );
}
