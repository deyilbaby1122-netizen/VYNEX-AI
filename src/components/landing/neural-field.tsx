"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  z: number;
}

const NODE_COUNT = 148;
const CONNECTION_DISTANCE = 0.46;
const MAX_DEGREE = 4;

/**
 * A hand-rolled 3D renderer (Fibonacci sphere + nearest-neighbour lattice,
 * perspective projection, pointer parallax). Zero WebGL context, no extra
 * dependency, and it stays crisp on high-DPI displays.
 */
export function NeuralField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Topology ------------------------------------------------------
    const points: Point[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NODE_COUNT; i += 1) {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      points.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
    }

    const edges: Array<[number, number]> = [];
    const degree = new Array<number>(NODE_COUNT).fill(0);
    for (let a = 0; a < NODE_COUNT; a += 1) {
      for (let b = a + 1; b < NODE_COUNT; b += 1) {
        if (degree[a] >= MAX_DEGREE || degree[b] >= MAX_DEGREE) continue;
        const dx = points[a].x - points[b].x;
        const dy = points[a].y - points[b].y;
        const dz = points[a].z - points[b].z;
        if (dx * dx + dy * dy + dz * dz < CONNECTION_DISTANCE ** 2) {
          edges.push([a, b]);
          degree[a] += 1;
          degree[b] += 1;
        }
      }
    }

    // --- Sizing --------------------------------------------------------
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    // --- Interaction ---------------------------------------------------
    let pointerX = 0;
    let pointerY = 0;
    let rotY = 0.2;
    let rotX = -0.12;

    const onPointerMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
    };
    parent.addEventListener("pointermove", onPointerMove);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(parent);

    const project = (point: Point, spinY: number, spinX: number, scale: number) => {
      const cosY = Math.cos(spinY);
      const sinY = Math.sin(spinY);
      const cosX = Math.cos(spinX);
      const sinX = Math.sin(spinX);

      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y2 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;

      const camera = 3.1;
      const focal = camera / (camera - z2);
      return {
        x: width / 2 + x1 * focal * scale,
        y: height / 2 + y2 * focal * scale,
        depth: z2,
        focal,
      };
    };

    let frame = 0;
    let raf = 0;

    const draw = () => {
      const scale = Math.min(width, height) * 0.4;
      ctx.clearRect(0, 0, width, height);

      rotY += (pointerX * 1.1 - rotY) * 0.035 + 0.0016;
      rotX += (pointerY * 0.75 - rotX) * 0.035;

      const projected = points.map((point) => project(point, rotY, rotX, scale));

      // Connections
      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        const depth = (pa.depth + pb.depth) * 0.5;
        const alpha = 0.06 + ((depth + 1) / 2) * 0.26;
        ctx.strokeStyle = `rgba(${depth > 0.15 ? "34,211,238" : "124,92,255"},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // Nodes, painted back-to-front for correct overlap
      const order = projected
        .map((point, index) => ({ point, index }))
        .sort((a, b) => a.point.depth - b.point.depth);

      for (const { point, index } of order) {
        const t = (point.depth + 1) / 2;
        const pulse = 0.72 + Math.sin(frame * 0.02 + index) * 0.28;
        const radius = (1.1 + t * 2.6) * pulse;

        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          radius * 4,
        );
        const tint = index % 5 === 0 ? "255,92,200" : index % 3 === 0 ? "34,211,238" : "124,92,255";
        gradient.addColorStop(0, `rgba(${tint},${(0.28 + t * 0.6).toFixed(2)})`);
        gradient.addColorStop(1, `rgba(${tint},0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,255,255,${(0.35 + t * 0.55).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      frame += 1;
    };

    const loop = () => {
      if (visible && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      io.disconnect();
      parent.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block" }}
    />
  );
}
