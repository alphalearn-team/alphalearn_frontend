"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { CanvasPoint, CanvasStroke } from "../_lib/gameSetup";

interface SharedCanvasProps {
  strokes: CanvasStroke[];
  activePlayerId?: string | null;
  readOnly?: boolean;
  onStrokeCommit?: (stroke: CanvasStroke) => void;
  selectedColor?: string;
  onSelectedColorChange?: (color: string) => void;
  availableColors?: string[];
  selectedWidth?: number;
  onSelectedWidthChange?: (width: number) => void;
  availableWidths?: number[];
  className?: string;
}

const CANVAS_HEIGHT = 360;
const DEFAULT_STROKE_COLOR = "#111111";
const DEFAULT_STROKE_WIDTH = 4;
const DEFAULT_PALETTE_COLORS = [
  "#111111",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
];
const DEFAULT_PEN_WIDTHS = [2, 4, 6, 8];

export default function SharedCanvas({
  strokes,
  activePlayerId,
  readOnly = false,
  onStrokeCommit,
  selectedColor,
  onSelectedColorChange,
  availableColors = DEFAULT_PALETTE_COLORS,
  selectedWidth,
  onSelectedWidthChange,
  availableWidths = DEFAULT_PEN_WIDTHS,
  className,
}: SharedCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const draftPointsRef = useRef<CanvasPoint[]>([]);
  const [draftPoints, setDraftPoints] = useState<CanvasPoint[]>([]);
  const [internalSelectedColor, setInternalSelectedColor] = useState(DEFAULT_STROKE_COLOR);
  const [internalSelectedWidth, setInternalSelectedWidth] = useState(DEFAULT_STROKE_WIDTH);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: CANVAS_HEIGHT });
  const activeStrokeColor = selectedColor ?? internalSelectedColor;
  const activeStrokeWidth = selectedWidth ?? internalSelectedWidth;

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const updateSize = () => {
      const nextWidth = Math.max(Math.round(container.getBoundingClientRect().width), 1);
      setCanvasSize({ width: nextWidth, height: CANVAS_HEIGHT });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * ratio;
    canvas.height = canvasSize.height * ratio;
    canvas.style.width = "100%";
    canvas.style.height = `${canvasSize.height}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    context.fillStyle = "#f8f6f1";
    context.fillRect(0, 0, canvasSize.width, canvasSize.height);

    for (const stroke of strokes) {
      drawStroke(context, stroke.points, stroke.color, stroke.width);
    }

    if (draftPoints.length > 0) {
      drawStroke(context, draftPoints, activeStrokeColor, activeStrokeWidth);
    }
  }, [activeStrokeColor, activeStrokeWidth, canvasSize.height, canvasSize.width, draftPoints, strokes]);

  const isInteractive = !readOnly && Boolean(activePlayerId) && Boolean(onStrokeCommit);

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive || pointerIdRef.current !== null) {
      return;
    }

    const point = getCanvasPoint(event);
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    draftPointsRef.current = [point];
    setDraftPoints(draftPointsRef.current);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive || pointerIdRef.current !== event.pointerId) {
      return;
    }

    const point = getCanvasPoint(event);
    draftPointsRef.current = [...draftPointsRef.current, point];
    setDraftPoints(draftPointsRef.current);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive || pointerIdRef.current !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    pointerIdRef.current = null;

    const completedPoints = draftPointsRef.current;

    if (completedPoints.length > 0 && activePlayerId && onStrokeCommit) {
      onStrokeCommit({
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        playerId: activePlayerId,
        color: activeStrokeColor,
        width: activeStrokeWidth,
        points: completedPoints,
      });
    }

    draftPointsRef.current = [];
    setDraftPoints([]);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerIdRef.current = null;
    draftPointsRef.current = [];
    setDraftPoints([]);
  };

  const handleColorSelect = (color: string) => {
    if (!isInteractive) {
      return;
    }

    if (selectedColor === undefined) {
      setInternalSelectedColor(color);
    }

    onSelectedColorChange?.(color);
  };

  const handleWidthSelect = (width: number) => {
    if (!isInteractive) {
      return;
    }

    if (selectedWidth === undefined) {
      setInternalSelectedWidth(width);
    }

    onSelectedWidthChange?.(width);
  };

  return (
    <div ref={containerRef} className={className}>
      {isInteractive ? (
        <div className="flex flex-wrap items-start gap-3 p-3">
          <div role="toolbar" aria-label="Brush colors" className="flex flex-wrap items-center gap-2">
            {availableColors.map((paletteColor) => {
              const isSelected = paletteColor.toLowerCase() === activeStrokeColor.toLowerCase();

              return (
                <button
                  key={paletteColor}
                  type="button"
                  aria-label={`Select ${paletteColor} brush color`}
                  aria-pressed={isSelected}
                  onClick={() => handleColorSelect(paletteColor)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white p-1 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden
                    className="block h-full w-full rounded-full border border-black/10"
                    style={{ backgroundColor: paletteColor }}
                  />
                  {isSelected ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute h-10 w-10 rounded-full ring-2 ring-offset-2 ring-[var(--color-primary)]"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Pen size
            </p>
            <div role="toolbar" aria-label="Pen sizes" className="flex flex-wrap items-center gap-2">
              {availableWidths.map((width) => {
                const isSelected = width === activeStrokeWidth;
                const previewDotSize = Math.max(6, Math.min(20, width * 2));

                return (
                  <button
                    key={width}
                    type="button"
                    aria-label={`Select pen size ${width} pixels`}
                    aria-pressed={isSelected}
                    onClick={() => handleWidthSelect(width)}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-white p-1 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                  >
                    <span
                      aria-hidden
                      className="block rounded-full bg-black"
                      style={{ width: `${previewDotSize}px`, height: `${previewDotSize}px` }}
                    />
                    {isSelected ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-offset-2 ring-[var(--color-primary)]"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          display: "block",
          width: "100%",
          height: `${CANVAS_HEIGHT}px`,
          touchAction: isInteractive ? "none" : "auto",
          cursor: isInteractive ? "crosshair" : "default",
        }}
      />
    </div>
  );
}

function drawStroke(
  context: CanvasRenderingContext2D,
  points: CanvasPoint[],
  color: string,
  width: number,
) {
  if (points.length === 0) {
    return;
  }

  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.lineJoin = "round";

  if (points.length === 1) {
    context.beginPath();
    context.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.restore();
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    context.lineTo(points[index].x, points[index].y);
  }

  context.stroke();
  context.restore();
}

function getCanvasPoint(event: ReactPointerEvent<HTMLCanvasElement>): CanvasPoint {
  const bounds = event.currentTarget.getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}
