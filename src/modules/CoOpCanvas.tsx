"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/context/SessionContext";
import { useVowThread } from "@/context/VowThreadContext";
import type { StrokePayload, RealtimeMessage } from "@/types";
import { Button } from "@/components/ui/Button";

const THROTTLE_MS = 100;
const STROKE_COLORS = ["#2d4a3e", "#7b9b8a", "#c1121f", "#e9c46a"];

interface Point {
  x: number;
  y: number;
}

export default function CoOpCanvasModule() {
  const { realtime, session } = useSession();
  const { contribute, completeModule } = useVowThread();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [localStrokes, setLocalStrokes] = useState<Array<{ points: Point[]; color: string; width: number }>>([]);
  const [remoteStrokes, setRemoteStrokes] = useState<Array<{ points: Point[]; color: string; width: number }>>([]);
  const lastSendRef = useRef(0);
  const currentStrokeRef = useRef<Point[]>([]);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (!realtime) return;
    const unsub = realtime.subscribe((msg: RealtimeMessage) => {
      if (msg.type === "stroke") {
        setRemoteStrokes((prev) => [
          ...prev,
          {
            points: msg.payload.points,
            color: msg.payload.color,
            width: msg.payload.width,
          },
        ]);
      }
      if (msg.type === "canvas_clear") {
        setRemoteStrokes([]);
      }
    });
    return unsub;
  }, [realtime]);

  const getCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const drawPoint = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, width: number) => {
      ctx.beginPath();
      ctx.arc(x, y, width / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
    []
  );

  const drawStroke = useCallback(
    (ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) => {
      if (points.length < 2) {
        if (points.length === 1) drawPoint(ctx, points[0].x, points[0].y, color, width);
        return;
      }
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    },
    [drawPoint]
  );

  const sendStroke = useCallback(
    (points: Point[]) => {
      if (!realtime || points.length === 0) return;
      const now = Date.now();
      if (now - lastSendRef.current < THROTTLE_MS) return;
      lastSendRef.current = now;
      const payload: StrokePayload = {
        points,
        color: STROKE_COLORS[colorIndex],
        width: 4,
        userId: session?.id ?? "local",
      };
      realtime.send({ type: "stroke", payload });
    },
    [realtime, session?.id, colorIndex]
  );

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const { x, y } = getCoords(e);
      currentStrokeRef.current = [{ x, y }];
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawPoint(ctx, x, y, STROKE_COLORS[colorIndex], 4);
    },
    [getCoords, colorIndex, drawPoint]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const { x, y } = getCoords(e);
      currentStrokeRef.current.push({ x, y });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pts = currentStrokeRef.current;
      drawStroke(ctx, pts, STROKE_COLORS[colorIndex], 4);
    },
    [isDrawing, getCoords, colorIndex, drawStroke]
  );

  const handleEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const pts = [...currentStrokeRef.current];
      if (pts.length > 0) {
        setLocalStrokes((prev) => [
          ...prev,
          { points: pts, color: STROKE_COLORS[colorIndex], width: 4 },
        ]);
        sendStroke(pts);
      }
      currentStrokeRef.current = [];
      setIsDrawing(false);
    },
    [isDrawing, sendStroke, colorIndex]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const dpr = window.devicePixelRatio ?? 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "var(--surface)";
      ctx.fillRect(0, 0, rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "var(--surface)";
    ctx.fillRect(0, 0, rect.width, rect.height);
    [...localStrokes, ...remoteStrokes].forEach((s) =>
      drawStroke(ctx, s.points, s.color, s.width)
    );
  }, [localStrokes, remoteStrokes, drawStroke]);

  const handleClear = useCallback(() => {
    realtime?.send({ type: "canvas_clear", payload: {} });
    setLocalStrokes([]);
    setRemoteStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = "var(--surface)";
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    }
  }, [realtime]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    contribute("coop-canvas", { canvasImageURL: dataUrl });
    const link = document.createElement("a");
    link.download = "the-vow-canvas.png";
    link.href = dataUrl;
    link.click();
  }, [contribute]);

  return (
    <div className="py-4 space-y-4">
      <h1 className="text-xl font-bold">Co-Op Canvas</h1>
      <p className="text-muted text-sm">Draw together. Strokes sync in realtime.</p>

      <div className="flex gap-2 flex-wrap">
        {STROKE_COLORS.map((c, i) => (
          <button
            key={c}
            onClick={() => setColorIndex(i)}
            className={`w-8 h-8 rounded-full border-2 ${
              i === colorIndex ? "border-foreground" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
            aria-label={`Select color ${i + 1}`}
          />
        ))}
      </div>

      <div className="relative rounded-[var(--radius)] overflow-hidden border border-border bg-surface">
        <canvas
          ref={canvasRef}
          className="w-full h-64 touch-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          style={{ width: "100%", height: "16rem" }}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
        <Button variant="primary" onClick={handleExport}>
          Export PNG
        </Button>
      </div>
      <button
        onClick={() => completeModule("coop-canvas")}
        className="text-sm text-primary underline mt-2"
      >
        Done with canvas
      </button>
    </div>
  );
}
