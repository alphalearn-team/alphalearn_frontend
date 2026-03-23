"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { CanvasPoint, CanvasStroke } from "../_lib/gameSetup";

interface SharedCanvasProps {
  strokes: CanvasStroke[];
  activePlayerId?: string | null;
  readOnly?: boolean;
  onStrokeCommit?: (stroke: CanvasStroke) => void;
  className?: string;
}

const CANVAS_HEIGHT = 360;
const DEFAULT_STROKE_COLOR = "#111111";
const DEFAULT_STROKE_WIDTH = 4;

export default function SharedCanvas({
  strokes,
  activePlayerId,
  readOnly = false,
  onStrokeCommit,
  className,
}: SharedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [draftPoints, setDraftPoints] = useState<CanvasPoint[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: CANVAS_HEIGHT });

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const updateSize = () => {
      const nextWidth = Math.max(Math.round(canvas.getBoundingClientRect().width), 1);
      setCanvasSize({ width: nextWidth, height: CANVAS_HEIGHT });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);

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
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    context.fillStyle = "#f8f6f1";
    context.fillRect(0, 0, canvasSize.width, canvasSize.height);

    for (const stroke of strokes) {
      drawStroke(context, stroke.points, stroke.color, stroke.width);
    }

    if (draftPoints.length > 0) {
      drawStroke(context, draftPoints, DEFAULT_STROKE_COLOR, DEFAULT_STROKE_WIDTH);
    }
  }, [canvasSize.height, canvasSize.width, draftPoints, strokes]);

  const isInteractive = !readOnly && Boolean(activePlayerId) && Boolean(onStrokeCommit);

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive || pointerIdRef.current !== null) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraftPoints([getCanvasPoint(event)]);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive || pointerIdRef.current !== event.pointerId) {
      return;
    }

    setDraftPoints((currentPoints) => [...currentPoints, getCanvasPoint(event)]);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive || pointerIdRef.current !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    pointerIdRef.current = null;

    setDraftPoints((currentPoints) => {
      if (currentPoints.length > 0 && activePlayerId && onStrokeCommit) {
        onStrokeCommit({
          id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          playerId: activePlayerId,
          color: DEFAULT_STROKE_COLOR,
          width: DEFAULT_STROKE_WIDTH,
          points: currentPoints,
        });
      }

      return [];
    });
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerIdRef.current = null;
    setDraftPoints([]);
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        width: "100%",
        height: `${CANVAS_HEIGHT}px`,
        touchAction: isInteractive ? "none" : "auto",
        cursor: isInteractive ? "crosshair" : "default",
      }}
    />
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
