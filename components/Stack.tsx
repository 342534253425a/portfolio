"use client";

import { useRef, useState } from "react";
import { finePointer, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DockerIcon, GraphqlIcon, NextIcon, NodeIcon, PostgresIcon, ReactIcon, TailwindIcon, TsIcon } from "./icons";

const planets = [
  {
    name: "React",
    Icon: ReactIcon,
    size: 5.6,
    ring: true,
    years: "6 лет",
    text: "Сердце моего стека: архитектура компонентов, Server Components и бескомпромиссная производительность.",
    tags: ["RSC", "Hooks", "Suspense"],
  },
  {
    name: "Next.js",
    Icon: NextIcon,
    size: 5,
    years: "4 года",
    text: "App Router, SSR и ISR — быстрые продукты, которые любят и пользователи, и поисковики.",
    tags: ["App Router", "SSR / ISR", "Edge"],
  },
  {
    name: "TypeScript",
    Icon: TsIcon,
    size: 4.8,
    years: "5 лет",
    text: "Строгая типизация как страховка: меньше багов в проде, смелее рефакторинг.",
    tags: ["Strict", "Generics", "Zod"],
  },
  {
    name: "Node.js",
    Icon: NodeIcon,
    size: 5.4,
    years: "6 лет",
    text: "API, BFF и real-time сервисы — от прототипа за вечер до нагруженного продакшена.",
    tags: ["REST", "WebSocket", "BFF"],
  },
  {
    name: "GraphQL",
    Icon: GraphqlIcon,
    size: 4.6,
    years: "3 года",
    text: "Гибкие схемы и Apollo: интерфейс получает ровно те данные, которые ему нужны.",
    tags: ["Apollo", "Schema", "Codegen"],
  },
  {
    name: "PostgreSQL",
    Icon: PostgresIcon,
    size: 5.2,
    years: "5 лет",
    text: "Надёжные данные: моделирование, индексы, транзакции и Prisma поверх.",
    tags: ["Prisma", "Индексы", "SQL"],
  },
  {
    name: "Tailwind CSS",
    Icon: TailwindIcon,
    size: 4.8,
    years: "4 года",
    text: "Дизайн-системы и UI-киты, которые масштабируются вместе с продуктом.",
    tags: ["Tokens", "UI-кит", "A11y"],
  },
  {
    name: "Docker",
    Icon: DockerIcon,
    size: 5.6,
    ring: true,
    years: "3 года",
    text: "Контейнеры и CI/CD — одинаково стабильно от ноутбука до продакшена.",
    tags: ["CI/CD", "Compose", "Deploy"],
  },
];

type V3 = [number, number, number];

const N = planets.length;
const TAU = Math.PI * 2;
const NEAR = 40;
const R0 = 1500;
const DR = 560;
const RMAX = R0 + DR * (N - 1);
const PER_CHAPTER = 1.7;
const clamp01 = gsap.utils.clamp(0, 1);
/** Pacing per chapter: a short settle at each planet, the longer middle part is the flight. */
const pace = (u: number) => 0.12 * u + 0.88 * (0.5 - 0.5 * Math.cos(Math.PI * clamp01((u - 0.08) / 0.84)));
const NEBULA = ["255, 43, 61", "214, 28, 92", "255, 104, 70", "150, 36, 120", "255, 70, 110"];
const radii = planets.map((_, i) => R0 + DR * i);
const phases = planets.map((_, i) => 0.6 + i * 2.39996);
/**
 * Per-planet camera: elevation (negative is from below), swing around the planet (0 is outside the orbit,
 * ±π is between planet and sun) and roll. Rolls accumulate, so a 2π step is a full barrel roll on that flight.
 */
const SHOTS: [number, number, number][] = [
  [0.2, -0.45, 0.08],
  [-0.5, 0.65, -0.22],
  [0.68, -0.2, TAU + 0.16],
  [0.06, 1.15, TAU - 0.28],
  [-0.38, -1.05, TAU + 0.2],
  [0.42, 2.45, 0.1],
  [-0.62, 0.35, -0.2],
  [0.3, -0.75, -TAU + 0.12],
];
const ROLLS: V3[] = [[0, 0, 0], ...SHOTS.map(([, , r]): V3 => [r, 0, 0])];

export default function Stack() {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);

  useGSAP(
    () => {
      const section = root.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const canvas = section.querySelector<HTMLCanvasElement>(".sys__canvas")!;
      const ctx = canvas.getContext("2d")!;
      const fxCanvas = section.querySelector<HTMLCanvasElement>(".sys__fx")!;
      const fx2 = fxCanvas.getContext("2d")!;
      const sun = section.querySelector<HTMLElement>(".sun")!;
      const nodes = gsap.utils.toArray<HTMLElement>(".planet", section);
      const tags = gsap.utils.toArray<HTMLElement>(".planet-tag", section);
      const chapters = gsap.utils.toArray<HTMLElement>(".chapter", section);
      const link = section.querySelector<SVGPathElement>(".sys__link path")!;
      const dot = section.querySelector<SVGCircleElement>(".sys__link circle")!;
      const reticle = section.querySelector<HTMLElement>(".sys__reticle")!;
      const bar = section.querySelector<HTMLElement>(".sys__bar i")!;
      const dist = section.querySelector<HTMLElement>(".sys__dist")!;

      const rnd = (a: number, b: number) => a + Math.random() * (b - a);
      const dust: V3[] = Array.from({ length: 700 }, () => [rnd(-1.6, 1.6) * RMAX, rnd(-0.45, 0.45) * RMAX, rnd(-1.6, 1.6) * RMAX]);
      const sky: V3[] = Array.from({ length: 420 }, () => {
        const th = Math.random() * TAU;
        const ph = Math.acos(rnd(-1, 1));
        const r = RMAX * 30;
        return [Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r];
      });
      const belt: V3[] = Array.from({ length: 520 }, () => {
        const th = Math.random() * TAU;
        const r = (radii[3] + radii[4]) / 2 + rnd(-0.3, 0.3) * DR;
        return [Math.cos(th) * r, rnd(-40, 40), Math.sin(th) * r];
      });
      const SKY = RMAX * 30;
      const norm = (v: V3): V3 => {
        const l = Math.hypot(v[0], v[1], v[2]) || 1;
        return [v[0] / l, v[1] / l, v[2] / l];
      };
      const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const bandN = norm([0.35, 1, 0.45]);
      const bandU = norm([bandN[1], -bandN[0], 0]);
      const bandV: V3 = [
        bandN[1] * bandU[2] - bandN[2] * bandU[1],
        bandN[2] * bandU[0] - bandN[0] * bandU[2],
        bandN[0] * bandU[1] - bandN[1] * bandU[0],
      ];
      const onBand = (th: number, spread: number): V3 => {
        const g = gauss() * spread;
        const d = norm([
          bandU[0] * Math.cos(th) + bandV[0] * Math.sin(th) + bandN[0] * g,
          bandU[1] * Math.cos(th) + bandV[1] * Math.sin(th) + bandN[1] * g,
          bandU[2] * Math.cos(th) + bandV[2] * Math.sin(th) + bandN[2] * g,
        ]);
        return [d[0] * SKY, d[1] * SKY, d[2] * SKY];
      };
      const band: V3[] = Array.from({ length: 700 }, () => onBand(Math.random() * TAU, 0.14));

      const points = [...dust, ...sky, ...band, ...belt];
      const farFrom = dust.length;
      const farTo = dust.length + sky.length + band.length;
      const tint = points.map((_, i) => (i >= farTo ? 2 : Math.random() < 0.14 ? 1 : 0));
      const amp = points.map((_, i) => (i >= farFrom + sky.length && i < farTo ? 0.3 + Math.random() * 0.3 : 1));
      const prevX = new Float32Array(points.length);
      const prevY = new Float32Array(points.length);
      const prevOk = new Uint8Array(points.length);

      const sprite = (size: number, draw: (g: CanvasRenderingContext2D, s: number) => void) => {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        draw(c.getContext("2d")!, size);
        return c;
      };
      const radial = (stops: [number, string][]) =>
        sprite(128, (g, s) => {
          const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
          stops.forEach(([o, c]) => gr.addColorStop(o, c));
          g.fillStyle = gr;
          g.fillRect(0, 0, s, s);
        });
      const glow = (rgb: string) =>
        radial([
          [0, `rgba(${rgb}, 1)`],
          [0.2, `rgba(${rgb}, 0.42)`],
          [0.55, `rgba(${rgb}, 0.1)`],
          [1, `rgba(${rgb}, 0)`],
        ]);
      const soft = (rgb: string) =>
        radial([
          [0, `rgba(${rgb}, 0.9)`],
          [0.45, `rgba(${rgb}, 0.32)`],
          [1, `rgba(${rgb}, 0)`],
        ]);
      const glowRed = glow("255, 60, 70");
      const glowWarm = glow("255, 170, 140");
      const glowWhite = glow("255, 240, 235");
      const ring = radial([
        [0, "rgba(255, 80, 90, 0)"],
        [0.74, "rgba(255, 80, 90, 0)"],
        [0.86, "rgba(255, 110, 110, 0.55)"],
        [0.95, "rgba(255, 80, 90, 0)"],
      ]);
      const blobs = NEBULA.map(soft);
      const sparkle = sprite(128, (g, s) => {
        g.drawImage(glowWhite, s * 0.3, s * 0.3, s * 0.4, s * 0.4);
        g.globalCompositeOperation = "lighter";
        for (const vertical of [false, true]) {
          const gr = vertical ? g.createLinearGradient(0, 0, 0, s) : g.createLinearGradient(0, 0, s, 0);
          gr.addColorStop(0, "rgba(255, 190, 190, 0)");
          gr.addColorStop(0.5, "rgba(255, 245, 240, 0.95)");
          gr.addColorStop(1, "rgba(255, 190, 190, 0)");
          g.fillStyle = gr;
          if (vertical) g.fillRect(s / 2 - 1, 0, 2, s);
          else g.fillRect(0, s / 2 - 1, s, 2);
        }
      });
      const galaxy = sprite(512, (g, s) => {
        g.globalCompositeOperation = "lighter";
        g.drawImage(glowWarm, s * 0.34, s * 0.34, s * 0.32, s * 0.32);
        for (let k = 0; k < 3200; k++) {
          const arm = k % 2;
          const t = Math.pow(Math.random(), 0.75);
          const a = arm * Math.PI + t * 3.4 * Math.PI + gauss() * 0.35;
          const r = t * s * 0.46 + gauss() * s * 0.02;
          const x = s / 2 + Math.cos(a) * r;
          const y = s / 2 + Math.sin(a) * r;
          g.fillStyle = t < 0.25 ? "#ffe2d6" : Math.random() < 0.6 ? "#ff5a66" : "#ffb0b0";
          g.globalAlpha = 0.25 + Math.random() * 0.5 * (1 - t * 0.6);
          const d = Math.random() < 0.08 ? 2.4 : 1.3;
          g.fillRect(x, y, d, d);
        }
        g.globalAlpha = 0.5;
        for (let k = 0; k < 40; k++) {
          const t = Math.random();
          const a = (k % 2) * Math.PI + t * 3.4 * Math.PI;
          const r = t * s * 0.44;
          const d = s * (0.06 + Math.random() * 0.06);
          g.drawImage(blobs[k % 2 ? 0 : 1], s / 2 + Math.cos(a) * r - d / 2, s / 2 + Math.sin(a) * r - d / 2, d, d);
        }
      });

      const blackHole = sprite(512, (g, s) => {
        const c = s / 2;
        const disk = (front: boolean) => {
          g.save();
          g.translate(c, c);
          g.rotate(-0.18);
          g.beginPath();
          g.rect(-c, front ? 0 : -c, s, c);
          g.clip();
          g.scale(1, 0.24);
          for (let k = 0; k < 50; k++) {
            const t = k / 50;
            g.strokeStyle = `rgba(255, ${Math.round(200 - t * 150)}, ${Math.round(150 - t * 110)}, ${0.85 * (1 - t) ** 1.3})`;
            g.lineWidth = s * 0.009;
            g.beginPath();
            g.arc(0, 0, s * (0.15 + t * 0.3), 0, TAU);
            g.stroke();
          }
          g.restore();
        };
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = 0.55;
        g.drawImage(glow("255, 80, 60"), s * 0.1, s * 0.1, s * 0.8, s * 0.8);
        g.globalAlpha = 1;
        disk(false);
        g.shadowColor = "rgba(255, 150, 110, 0.9)";
        g.shadowBlur = s * 0.03;
        g.strokeStyle = "rgba(255, 180, 140, 0.8)";
        g.lineWidth = s * 0.008;
        g.beginPath();
        g.arc(c, c, s * 0.125, 0, TAU);
        g.stroke();
        g.shadowBlur = 0;
        g.globalCompositeOperation = "source-over";
        g.fillStyle = "#000";
        g.beginPath();
        g.arc(c, c, s * 0.112, 0, TAU);
        g.fill();
        g.globalCompositeOperation = "lighter";
        g.strokeStyle = "rgba(255, 235, 220, 0.9)";
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(c, c, s * 0.114, 0, TAU);
        g.stroke();
        disk(true);
      });
      const wormhole = sprite(512, (g, s) => {
        const c = s / 2;
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = 0.4;
        g.drawImage(glow("214, 28, 92"), 0, 0, s, s);
        const hues = ["255, 74, 106", "255, 160, 170", "184, 50, 122"];
        for (let k = 0; k < 36; k++) {
          const t = k / 36;
          const r = s * 0.44 * Math.pow(0.9, k);
          g.strokeStyle = `rgba(${hues[k % 3]}, ${0.12 + 0.6 * t})`;
          g.lineWidth = Math.max(1, s * 0.012 * (1 - t));
          for (let a = 0; a < 3; a++) {
            const st = k * 0.45 + (a * TAU) / 3;
            g.globalAlpha = 1;
            g.beginPath();
            g.arc(c, c, r, st, st + 1.3);
            g.stroke();
          }
        }
        g.globalAlpha = 0.9;
        g.drawImage(glowWhite, c - s * 0.06, c - s * 0.06, s * 0.12, s * 0.12);
      });
      const rays = sprite(512, (g, s) => {
        const c = s / 2;
        g.globalCompositeOperation = "lighter";
        for (let k = 0; k < 42; k++) {
          const a = (k / 42) * TAU + rnd(-0.05, 0.05);
          const wd = rnd(0.012, 0.045);
          const len = c * rnd(0.55, 1);
          const gr = g.createRadialGradient(c, c, 0, c, c, len);
          gr.addColorStop(0, "rgba(255, 90, 90, 0.5)");
          gr.addColorStop(1, "rgba(255, 43, 61, 0)");
          g.fillStyle = gr;
          g.beginPath();
          g.moveTo(c, c);
          g.arc(c, c, len, a - wd, a + wd);
          g.closePath();
          g.fill();
        }
      });
      /** Pins an object into planet j's shot: screen position (sx, sy) as viewport fractions, z depth in RMAX. */
      type Anchor = { j: number; sx: number; sy: number; z: number };
      const holes = [
        { p: [-1.9 * RMAX, 0.45 * RMAX, 1.1 * RMAX] as V3, r: 0.34 * RMAX },
        { p: [0, 0, 0] as V3, r: 0.42 * RMAX, at: { j: 2, sx: 0.9, sy: 0.2, z: 2.4 } as Anchor },
        { p: [0, 0, 0] as V3, r: 0.36 * RMAX, at: { j: 6, sx: 0.88, sy: 0.8, z: 2.6 } as Anchor },
      ];
      const portals = [
        { p: [0, 0, 0] as V3, r: 0.3 * RMAX, at: { j: 4, sx: 0.9, sy: 0.24, z: 2.2 } as Anchor },
        { p: [0, 0, 0] as V3, r: 0.26 * RMAX, at: { j: 7, sx: 0.88, sy: 0.22, z: 2.4 } as Anchor },
      ];
      const pulsars = [
        { p: [0, 0, 0] as V3, ph: 0.4, sp: 1.7, at: { j: 1, sx: 0.88, sy: 0.18, z: 2 } as Anchor },
        { p: [0, 0, 0] as V3, ph: 2.1, sp: -1.2, at: { j: 3, sx: 0.9, sy: 0.78, z: 2 } as Anchor },
        { p: [0, 0, 0] as V3, ph: 4, sp: 2.3, at: { j: 5, sx: 0.86, sy: 0.2, z: 2 } as Anchor },
        { p: [0, 0, 0] as V3, ph: 1.2, sp: 1.4, at: { j: 0, sx: 0.58, sy: 0.12, z: 2.2 } as Anchor },
      ];
      const anchored = [...holes, ...portals, ...pulsars];

      const clouds = Array.from({ length: 9 }, (_, k) => {
        const th = (k / 9) * TAU + rnd(-0.3, 0.3);
        const d = RMAX * rnd(1.4, 2.6);
        const c: V3 = [Math.cos(th) * d, rnd(-0.5, 0.5) * RMAX, Math.sin(th) * d];
        const r = RMAX * rnd(0.5, 0.9);
        return Array.from({ length: 8 }, (_, b) => ({
          p: [c[0] + gauss() * r, c[1] + gauss() * r * 0.4, c[2] + gauss() * r] as V3,
          r: r * rnd(0.25, 0.7),
          img: blobs[(k + (b % 3)) % blobs.length],
          a: rnd(0.06, 0.13),
        }));
      }).flat();
      const bandGlow = Array.from({ length: 16 }, (_, k) => ({ p: onBand((k / 16) * TAU, 0.05), img: blobs[k % 3 ? 0 : 4] }));
      const galaxies = [
        { p: norm([-0.7, 0.35, 0.6]), rot: 0.6, tilt: 0.42, size: 0.34 },
        { p: norm([0.8, -0.1, -0.55]), rot: -0.9, tilt: 0.3, size: 0.2 },
      ];
      const glints = Array.from({ length: 36 }, () => ({
        p: onBand(Math.random() * TAU, 0.9),
        s: rnd(14, 34),
        ph: Math.random() * TAU,
        sp: rnd(0.8, 2.2),
      }));
      const comets = Array.from({ length: 3 }, (_, k) => ({
        a: RMAX * rnd(0.9, 1.3),
        b: RMAX * rnd(0.45, 0.7),
        ph: rnd(0, TAU),
        sp: rnd(0.035, 0.06) * (k % 2 ? 1 : -1),
        rot: (k / 3) * TAU + rnd(-0.4, 0.4),
        lift: rnd(-0.35, 0.35),
      }));
      const shoots: { x: number; y: number; vx: number; vy: number; t: number; d: number }[] = [];
      let nextShoot = 1.5;
      let last = 0;

      const state = { target: 0, t: 0, mx: 0, my: 0, enter: 0, e: 0 };
      let w = 0;
      let h = 0;
      let F = 1;
      let px0 = 0;
      let py0 = 0;
      let ax = 0;
      let ay = 0;
      let tb = 0;
      let phone = false;
      let widths: number[] = [];
      let sunW = 200;
      let current = -1;

      let C: V3 = [0, 0, 0];
      let fw: V3 = [0, 0, 1];
      let rt: V3 = [1, 0, 0];
      let up: V3 = [0, 1, 0];
      let PX = 0;
      let PY = 0;
      let PZ = 0;
      let PS = 0;
      const proj = (x: number, y: number, z: number) => {
        const dx = x - C[0];
        const dy = y - C[1];
        const dz = z - C[2];
        PZ = dx * fw[0] + dy * fw[1] + dz * fw[2];
        PS = F / Math.max(PZ, NEAR);
        PX = px0 + (dx * rt[0] + dy * rt[1] + dz * rt[2]) * PS;
        PY = py0 - (dx * up[0] + dy * up[1] + dz * up[2]) * PS;
      };

      const planetAt = (i: number, time: number): V3 => {
        const th = phases[i] + (reduced ? 0 : time * 0.006 * Math.sqrt(RMAX / radii[i]));
        return [Math.cos(th) * radii[i], 0, Math.sin(th) * radii[i]];
      };

      /** Camera shot for chapter i: 0 is the wide establishing shot, i > 0 frames planet i - 1. */
      const shot = (i: number, time: number): [V3, V3] => {
        if (i === 0) {
          const d = RMAX * (phone ? 3.3 : 2.5) * (1 + (1 - state.e) * 0.9);
          const az = -1.05 + (1 - state.e) * 0.5;
          const el = 0.5 + (1 - state.e) * 0.25;
          return [
            [Math.cos(az) * Math.cos(el) * d, Math.sin(el) * d, Math.sin(az) * Math.cos(el) * d],
            [0, 0, 0],
          ];
        }
        const j = i - 1;
        const p = planetAt(j, time);
        const n: V3 = [p[0] / radii[j], 0, p[2] / radii[j]];
        const t: V3 = [-n[2], 0, n[0]];
        const D = ((widths[j] || 240) * F) / (phone ? w * 0.36 : Math.min(w * 0.24, h * 0.38));
        const [e, s] = SHOTS[j];
        const ce = Math.cos(e) * D;
        return [
          [
            p[0] + n[0] * ce * Math.cos(s) + t[0] * ce * Math.sin(s),
            Math.sin(e) * D,
            p[2] + n[2] * ce * Math.cos(s) + t[2] * ce * Math.sin(s),
          ],
          p,
        ];
      };

      const layout = () => {
        w = section.clientWidth;
        h = section.clientHeight;
        phone = w <= 600;
        F = phone ? w * 1.35 : h * 1.25;
        px0 = phone ? w * 0.5 : w * 0.66;
        py0 = phone ? h * 0.64 : h * 0.52;
        widths = nodes.map((n) => n.offsetWidth);
        sunW = sun.offsetWidth;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        for (const [cv, c2] of [
          [canvas, ctx],
          [fxCanvas, fx2],
        ] as const) {
          const cw = Math.round(w * dpr);
          const ch = Math.round(h * dpr);
          if (cv.width === cw && cv.height === ch) continue;
          cv.width = cw;
          cv.height = ch;
          c2.setTransform(dpr, 0, 0, dpr, 0, 0);
          prevOk.fill(0);
        }
        const head = section.querySelector<HTMLElement>(".chapters")!.getBoundingClientRect();
        const box = section.getBoundingClientRect();
        ax = head.right - box.left + 24;
        ay = head.top - box.top + head.height * 0.42;
        tb = head.bottom - box.top;
      };

      const place = (el: HTMLElement, scale: number, z: number, visible: boolean) => {
        if (!visible) {
          el.style.visibility = "hidden";
          return;
        }
        el.style.visibility = "visible";
        el.style.transform = `translate(${PX}px, ${PY}px) translate(-50%, -50%) scale(${scale})`;
        el.style.zIndex = String(Math.max(1, 900000 - Math.round(z)));
      };

      /** Hermite spline through the shots with tangents capped to the shorter neighbour hop, so it never overshoots. */
      const spline = (pts: V3[], s: number): V3 => {
        const i = Math.min(N - 1, Math.max(0, Math.floor(s)));
        const u = clamp01(s - i);
        const at = (k: number): V3 => {
          if (k < 0) return [2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1], 2 * pts[0][2] - pts[1][2]];
          if (k > N) return [2 * pts[N][0] - pts[N - 1][0], 2 * pts[N][1] - pts[N - 1][1], 2 * pts[N][2] - pts[N - 1][2]];
          return pts[k];
        };
        const tangent = (k: number): V3 => {
          const a = at(k - 1);
          const b = at(k);
          const c = at(k + 1);
          const m: V3 = [(c[0] - a[0]) / 2, (c[1] - a[1]) / 2, (c[2] - a[2]) / 2];
          const ml = Math.hypot(m[0], m[1], m[2]) || 1;
          const cap = Math.min(Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]), Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
          const f = Math.min(1, cap / ml);
          return [m[0] * f, m[1] * f, m[2] * f];
        };
        const p0 = at(i);
        const p1 = at(i + 1);
        const m0 = tangent(i);
        const m1 = tangent(i + 1);
        const u2 = u * u;
        const u3 = u2 * u;
        const h00 = 2 * u3 - 3 * u2 + 1;
        const h10 = u3 - 2 * u2 + u;
        const h01 = -2 * u3 + 3 * u2;
        const h11 = u3 - u2;
        return [0, 1, 2].map((k) => h00 * p0[k] + h10 * m0[k] + h01 * p1[k] + h11 * m1[k]) as V3;
      };

      const render = (time = 0) => {
        state.t += (state.target - state.t) * 0.07;
        state.e += (state.enter - state.e) * 0.08;
        const T = state.t;
        const i = Math.min(N - 1, Math.floor(T));
        const u = T - i;
        const shots = Array.from({ length: N + 1 }, (_, k) => shot(k, time));
        const cams = shots.map((s) => s[0]);
        const cam = spline(cams, T);
        const hop = Math.hypot(cams[i + 1][0] - cams[i][0], cams[i + 1][1] - cams[i][1], cams[i + 1][2] - cams[i][2]);
        cam[1] += Math.sin(Math.PI * u) ** 2 * hop * 0.08 * (i % 2 ? -1 : 1);
        const L = spline(
          shots.map((s) => s[1]),
          T + 0.22 * Math.sin(Math.PI * u),
        );

        let f: V3 = [L[0] - cam[0], L[1] - cam[1], L[2] - cam[2]];
        const fl = Math.hypot(f[0], f[1], f[2]) || 1;
        f = [f[0] / fl, f[1] / fl, f[2] / fl];
        let r: V3 = [-f[2], 0, f[0]];
        const rl = Math.hypot(r[0], r[2]) || 1;
        r = [r[0] / rl, 0, r[2] / rl];
        let v: V3 = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
        const roll = spline(ROLLS, T)[0] + (reduced ? 0 : Math.sin(time * 0.3) * 0.01);
        const cr = Math.cos(roll);
        const sr = Math.sin(roll);
        [r, v] = [
          [r[0] * cr + v[0] * sr, r[1] * cr + v[1] * sr, r[2] * cr + v[2] * sr],
          [v[0] * cr - r[0] * sr, v[1] * cr - r[1] * sr, v[2] * cr - r[2] * sr],
        ];
        const sway = fl * 0.05;
        C = [
          cam[0] + (r[0] * state.mx + v[0] * state.my) * sway,
          cam[1] + (r[1] * state.mx + v[1] * state.my) * sway,
          cam[2] + (r[2] * state.mx + v[2] * state.my) * sway,
        ];
        fw = f;
        rt = r;
        up = v;

        const dt = Math.min(0.1, Math.max(0, time - last));
        last = time;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";
        const blit = (img: CanvasImageSource, x: number, y: number, r: number, a: number) => {
          if (a < 0.004 || x + r < 0 || x - r > w || y + r < 0 || y - r > h) return;
          ctx.globalAlpha = a;
          ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
        };

        for (const g of bandGlow) {
          proj(g.p[0], g.p[1], g.p[2]);
          if (PZ > 0) blit(g.img, PX, PY, F * 0.3, 0.07);
        }
        for (const g of galaxies) {
          proj(g.p[0] * SKY, g.p[1] * SKY, g.p[2] * SKY);
          if (PZ <= 0) continue;
          const r = F * g.size;
          if (PX + r < 0 || PX - r > w || PY + r < 0 || PY - r > h) continue;
          ctx.save();
          ctx.globalAlpha = 0.75;
          ctx.translate(PX, PY);
          ctx.rotate(g.rot);
          ctx.scale(1, g.tilt);
          ctx.drawImage(galaxy, -r, -r, r * 2, r * 2);
          ctx.restore();
        }
        for (const c of clouds) {
          proj(c.p[0], c.p[1], c.p[2]);
          if (PZ < NEAR * 4) continue;
          blit(c.img, PX, PY, Math.min(c.r * PS, 4000), c.a * clamp01((PZ - c.r * 0.5) / c.r));
        }
        for (const g of glints) {
          proj(g.p[0], g.p[1], g.p[2]);
          if (PZ <= 0) continue;
          const tw = 0.55 + 0.45 * Math.sin(time * g.sp + g.ph);
          blit(sparkle, PX, PY, g.s * (0.6 + 0.4 * tw), 0.35 + 0.55 * tw);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        ctx.lineWidth = 1;
        radii.forEach((R, j) => {
          const fo = clamp01(1 - Math.abs(T - (j + 1)) / 0.5);
          ctx.strokeStyle = `rgba(255, ${255 - 212 * fo}, ${255 - 194 * fo}, ${0.1 + 0.4 * fo})`;
          ctx.beginPath();
          let open = false;
          for (let k = 0; k <= 180; k++) {
            const th = (k / 180) * TAU;
            proj(Math.cos(th) * R, 0, Math.sin(th) * R);
            if (PZ < NEAR * 2) {
              open = false;
              continue;
            }
            if (open) ctx.lineTo(PX, PY);
            else ctx.moveTo(PX, PY);
            open = true;
          }
          ctx.stroke();
        });

        ctx.lineCap = "round";
        const colors = ["#ffffff", "#ff4a5a", "#ffb4aa"];
        for (let k = 0; k < points.length; k++) {
          const p = points[k];
          proj(p[0], p[1], p[2]);
          if (PZ < NEAR * 2 || PX < -50 || PX > w + 50 || PY < -50 || PY > h + 50) {
            prevOk[k] = 0;
            continue;
          }
          const far = k >= farFrom && k < farTo;
          const size = far ? 1.1 : Math.min(3.2, Math.max(0.7, PS * 5));
          const a = far ? 0.55 * amp[k] : Math.min(0.85, 0.2 + PS * 3);
          ctx.globalAlpha = a;
          const dx = PX - prevX[k];
          const dy = PY - prevY[k];
          const len = Math.hypot(dx, dy);
          if (prevOk[k] && len > 2 && !reduced) {
            const cap = Math.min(1, 240 / len) * 1.4;
            ctx.strokeStyle = colors[tint[k]];
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(PX, PY);
            ctx.lineTo(PX - dx * cap, PY - dy * cap);
            ctx.stroke();
          } else {
            ctx.fillStyle = colors[tint[k]];
            ctx.fillRect(PX - size / 2, PY - size / 2, size, size);
          }
          prevX[k] = PX;
          prevY[k] = PY;
          prevOk[k] = 1;
        }
        ctx.globalAlpha = 1;

        for (const o of anchored) {
          if (!("at" in o) || !o.at) continue;
          const { j, sx, sy, z } = o.at;
          const [Cj, Lj] = shots[j + 1];
          const df = norm([Lj[0] - Cj[0], Lj[1] - Cj[1], Lj[2] - Cj[2]]);
          const dr = norm([-df[2], 0, df[0]]);
          const du: V3 = [dr[1] * df[2] - dr[2] * df[1], dr[2] * df[0] - dr[0] * df[2], dr[0] * df[1] - dr[1] * df[0]];
          const Z = z * RMAX;
          const a = ((sx * w - px0) * Z) / F;
          const b = ((py0 - sy * h) * Z) / F;
          o.p = [0, 1, 2].map((k) => Cj[k] + df[k] * Z + dr[k] * a + du[k] * b) as V3;
        }
        for (const b of holes) {
          proj(b.p[0], b.p[1], b.p[2]);
          if (PZ < NEAR * 4) continue;
          blit(blackHole, PX, PY, Math.min(b.r * PS, 3000), clamp01((PZ - b.r) / b.r));
        }
        ctx.globalCompositeOperation = "lighter";
        for (const o of portals) {
          proj(o.p[0], o.p[1], o.p[2]);
          const r = Math.min(o.r * PS, 3000);
          const a = clamp01((PZ - o.r) / o.r) * (0.8 + 0.2 * Math.sin(time * 1.3));
          if (PZ < NEAR * 4 || a < 0.01 || PX + r < 0 || PX - r > w || PY + r < 0 || PY - r > h) continue;
          ctx.save();
          ctx.globalAlpha = a;
          ctx.translate(PX, PY);
          ctx.rotate(reduced ? 0 : -time * 0.35);
          ctx.drawImage(wormhole, -r, -r, r * 2, r * 2);
          ctx.rotate(reduced ? 0 : time * 0.6);
          ctx.globalAlpha = a * 0.5;
          ctx.drawImage(wormhole, -r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
          ctx.restore();
        }
        for (const p of pulsars) {
          proj(p.p[0], p.p[1], p.p[2]);
          if (PZ < NEAR * 4 || PX < -200 || PX > w + 200 || PY < -200 || PY > h + 200) continue;
          const q = h / 900;
          const a = p.ph + (reduced ? 0 : time * p.sp);
          const len = 150 * q;
          const bx = Math.cos(a) * len;
          const by = Math.sin(a) * len * 0.5;
          const gr = ctx.createLinearGradient(PX - bx, PY - by, PX + bx, PY + by);
          gr.addColorStop(0, "rgba(255, 70, 90, 0)");
          gr.addColorStop(0.5, "rgba(255, 220, 220, 0.8)");
          gr.addColorStop(1, "rgba(255, 70, 90, 0)");
          ctx.strokeStyle = gr;
          for (const [wd, al] of [
            [7 * q, 0.2],
            [1.6 * q, 0.9],
          ]) {
            ctx.globalAlpha = al;
            ctx.lineWidth = wd;
            ctx.beginPath();
            ctx.moveTo(PX - bx, PY - by);
            ctx.lineTo(PX + bx, PY + by);
            ctx.stroke();
          }
          blit(glowWhite, PX, PY, 16 * q * (0.8 + 0.3 * Math.abs(Math.sin(a * 2))), 1);
        }
        for (const c of comets) {
          const th = c.ph + (reduced ? 0 : time * c.sp);
          const x0 = Math.cos(th) * c.a;
          const z0 = Math.sin(th) * c.b;
          const head: V3 = [x0 * Math.cos(c.rot) - z0 * Math.sin(c.rot), x0 * c.lift, x0 * Math.sin(c.rot) + z0 * Math.cos(c.rot)];
          const away = norm(head);
          const tail: V3 = [head[0] + away[0] * 1400, head[1] + away[1] * 1400, head[2] + away[2] * 1400];
          proj(tail[0], tail[1], tail[2]);
          if (PZ < NEAR * 2) continue;
          const tx = PX;
          const ty = PY;
          proj(head[0], head[1], head[2]);
          if (PZ < NEAR * 2) continue;
          const lw = Math.min(10, Math.max(1, PS * 26));
          const gr = ctx.createLinearGradient(PX, PY, tx, ty);
          gr.addColorStop(0, "rgba(255, 225, 215, 0.9)");
          gr.addColorStop(0.3, "rgba(255, 90, 100, 0.4)");
          gr.addColorStop(1, "rgba(255, 43, 61, 0)");
          ctx.strokeStyle = gr;
          for (const [wd, al] of [
            [lw * 4, 0.18],
            [lw, 0.9],
          ]) {
            ctx.globalAlpha = al;
            ctx.lineWidth = wd;
            ctx.beginPath();
            ctx.moveTo(PX, PY);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
          blit(glowWhite, PX, PY, Math.min(70, Math.max(6, PS * 180)), 0.95);
        }

        if (!reduced && (nextShoot -= dt) <= 0) {
          nextShoot = rnd(2.2, 5);
          const ang = rnd(0.25, 0.6) * (Math.random() < 0.5 ? 1 : -1) + Math.PI / 2;
          const v = rnd(900, 1500);
          shoots.push({
            x: rnd(0.1, 0.9) * w,
            y: rnd(0, 0.35) * h,
            vx: Math.cos(ang) * v,
            vy: Math.sin(ang) * v * 0.6,
            t: 0,
            d: rnd(0.6, 1),
          });
        }
        for (let k = shoots.length - 1; k >= 0; k--) {
          const s = shoots[k];
          s.t += dt;
          if (s.t > s.d) {
            shoots.splice(k, 1);
            continue;
          }
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const gr = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.16, s.y - s.vy * 0.16);
          gr.addColorStop(0, "rgba(255, 240, 235, 1)");
          gr.addColorStop(1, "rgba(255, 60, 75, 0)");
          ctx.globalAlpha = Math.sin((Math.PI * s.t) / s.d);
          ctx.strokeStyle = gr;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 0.16, s.y - s.vy * 0.16);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        proj(0, 0, 0);
        const sunX = PX;
        const sunY = PY;
        const sunOn = PZ > NEAR;
        const sunR = (sunW / 2) * Math.min(PS * 1.9, 2);
        if (sunOn) {
          const r = sunR * 5;
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 0.35;
          ctx.translate(sunX, sunY);
          ctx.rotate(reduced ? 0 : time * 0.03);
          ctx.drawImage(rays, -r, -r, r * 2, r * 2);
          ctx.rotate(reduced ? 0 : -time * 0.05);
          ctx.globalAlpha = 0.2;
          ctx.drawImage(rays, -r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
          ctx.restore();
        }
        let occlude = 1;
        place(sun, Math.min(PS * 1.9, 2), PZ, sunOn);
        const sunZ = PZ;

        let fx = 0;
        let fy = 0;
        let fs = 0;
        let fz = 0;
        let focusMax = 0;
        nodes.forEach((n, j) => {
          const p = planetAt(j, time);
          proj(p[0], p[1], p[2]);
          const visible = PZ > NEAR * 2;
          const focus = clamp01(1 - Math.abs(T - (j + 1)) / 0.45);
          const scale = Math.min(PS, 1.15);
          place(n, scale, PZ, visible);
          tags[j].style.visibility = visible ? "visible" : "hidden";
          if (!visible) return;
          const d = widths[j] * scale;
          if (PZ < sunZ) occlude = Math.min(occlude, clamp01((Math.hypot(PX - sunX, PY - sunY) - d * 0.3) / (d * 0.3 + sunR * 0.4)));
          const clear = phone ? clamp01((PY - tb + 30) / 120) : clamp01((PX + d / 2 - ax + 40) / 160);
          const op = 0.12 + 0.88 * Math.max(clear, focus);
          n.style.opacity = String(op);
          n.style.setProperty("--f", focus.toFixed(3));
          proj(0, 0, 0);
          const sx = PX;
          const sy = PY;
          proj(p[0], p[1], p[2]);
          const lx = sx - PX;
          const ly = sy - PY;
          const ll = Math.hypot(lx, ly) || 1;
          n.style.setProperty("--dx", (lx / ll).toFixed(3));
          n.style.setProperty("--dy", (ly / ll).toFixed(3));
          tags[j].style.transform = `translate(${PX}px, ${PY + d / 2 + 14}px) translate(-50%, 0)`;
          tags[j].style.zIndex = n.style.zIndex;
          tags[j].style.opacity = String(op * (1 - focus) * clamp01((d - 6) / 20));
          if (focus > focusMax) {
            focusMax = focus;
            fx = PX;
            fy = PY;
            fs = d;
            fz = PZ;
          }
        });

        fx2.clearRect(0, 0, w, h);
        const edge = Math.max(Math.abs(sunX / w - 0.5), Math.abs(sunY / h - 0.5));
        const I = sunOn ? clamp01((0.62 - edge) * 5) * occlude : 0;
        if (I > 0.01) {
          fx2.globalCompositeOperation = "lighter";
          const q = h / 900;
          fx2.globalAlpha = 0.5 * I;
          fx2.drawImage(glowRed, sunX - w * 0.7, sunY - 7 * q, w * 1.4, 14 * q);
          fx2.globalAlpha = 0.55 * I;
          fx2.drawImage(glowWhite, sunX - w * 0.32, sunY - 1.5 * q, w * 0.64, 3 * q);
          fx2.globalAlpha = 0.35 * I;
          fx2.drawImage(glowRed, sunX - sunR * 2.4, sunY - sunR * 2.4, sunR * 4.8, sunR * 4.8);
          const vx = w / 2 - sunX;
          const vy = h / 2 - sunY;
          const ghosts: [number, number, HTMLCanvasElement, number][] = [
            [0.45, 36, glowRed, 0.22],
            [0.8, 110, ring, 0.13],
            [1.15, 26, glowWarm, 0.3],
            [1.5, 190, ring, 0.08],
            [1.9, 70, glowRed, 0.16],
          ];
          for (const [t, s, img, a] of ghosts) {
            const r = s * q;
            fx2.globalAlpha = a * I;
            fx2.drawImage(img, sunX + vx * t - r, sunY + vy * t - r, r * 2, r * 2);
          }
          fx2.globalAlpha = 1;
          fx2.globalCompositeOperation = "source-over";
        }

        chapters.forEach((c, k) => {
          const d = T - k;
          const o = clamp01(1 - Math.abs(d) / 0.3);
          c.style.opacity = String(o * o * (3 - 2 * o));
          c.style.visibility = o < 0.01 ? "hidden" : "visible";
          c.style.transform = `translate3d(0, ${Math.round(-d * 70)}px, 0)`;
        });

        const on = !phone && focusMax > 0.02;
        link.style.opacity = dot.style.opacity = on ? String(focusMax) : "0";
        if (on) {
          const ex = fx - fs * 0.72;
          link.setAttribute("d", `M${ax} ${ay} C${ax + 120} ${ay}, ${ex - 140} ${fy}, ${ex} ${fy}`);
          dot.setAttribute("cx", String(ex));
          dot.setAttribute("cy", String(fy));
        }
        reticle.style.opacity = String(focusMax);
        reticle.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%) scale(${(fs / 100) * (1.62 - focusMax * 0.22)})`;

        const idx = Math.round(gsap.utils.clamp(0, N, T));
        if (idx !== current) {
          current = idx;
          setChapter(idx);
        }
        bar.style.transform = `scaleX(${T / N})`;
        dist.textContent = ((focusMax > 0.5 ? fz : Math.hypot(C[0], C[1], C[2])) / 1000).toFixed(2);
      };

      layout();
      render();

      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => (state.enter = 1 - (1 - self.progress) ** 3),
        onLeave: () => (state.enter = 1),
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * PER_CHAPTER * (N + 0.6)}`,
        pin: true,
        invalidateOnRefresh: true,
        onRefresh: layout,
        onUpdate: (self) => {
          const raw = Math.min(N, self.progress * (N + 0.6));
          const c = Math.floor(raw);
          state.target = c >= N ? N : c + pace(raw - c);
        },
      });

      const tick = (time: number) => render(time);
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: () => `bottom+=${window.innerHeight * PER_CHAPTER * (N + 0.6)} top`,
        onToggle: (self) => {
          if (self.isActive) {
            prevOk.fill(0);
            state.t = state.target;
            state.e = state.enter;
            gsap.ticker.add(tick);
          } else gsap.ticker.remove(tick);
        },
      });

      const ro = new ResizeObserver(() => {
        if (Math.abs(section.clientWidth - w) < 2 && Math.abs(section.clientHeight - h) < 2) return;
        layout();
        render();
      });
      ro.observe(section);

      let move: ((e: PointerEvent) => void) | undefined;
      if (!reduced && finePointer()) {
        const mxTo = gsap.quickTo(state, "mx", { duration: 2.2, ease: "power3.out" });
        const myTo = gsap.quickTo(state, "my", { duration: 2.2, ease: "power3.out" });
        move = (e) => {
          mxTo(e.clientX / window.innerWidth - 0.5);
          myTo(0.5 - e.clientY / window.innerHeight);
        };
        section.addEventListener("pointermove", move);
      }

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        if (move) section.removeEventListener("pointermove", move);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="stack" className="stack">
      <div className="stack__nebula" aria-hidden />
      <canvas className="sys__canvas" aria-hidden />

      <div className="sys__world" aria-hidden>
        <div className="sun">
          <span className="sun__glow" />
          <span className="sun__ticks" />
          <span className="sun__ring" />
          <span className="sun__core" />
        </div>

        {planets.map(({ name, Icon, size, ring }) => (
          <div key={name} className="planet" style={{ "--s": `${size * 4.4}rem` } as React.CSSProperties}>
            <span className="planet__halo" />
            {ring && <span className="planet__ring" />}
            <span className="planet__body">
              <Icon />
            </span>
            {ring && <span className="planet__ring planet__ring--front" />}
            <span className="planet__moon" />
          </div>
        ))}

        {planets.map(({ name }) => (
          <span key={name} className="planet-tag">
            {name}
          </span>
        ))}
      </div>

      <canvas className="sys__fx" aria-hidden />

      <span className="sys__reticle" aria-hidden>
        <i />
      </span>
      <svg className="sys__link" aria-hidden>
        <path />
        <circle r="4" />
      </svg>

      <div className="stack__shade" aria-hidden />

      <div className="chapters">
        <div className="chapter chapter--intro">
          <p className="label">
            <b>02 /</b> <span>Мой стек</span>
          </p>
          <h2 className="h2">
            Технологии — мои инструменты.
            <br />
            Система — <span className="accent">мой подход.</span>
          </h2>
          <p className="lead">Моя вселенная технологий. Скролльте — полетим от планеты к планете.</p>
        </div>
        {planets.map(({ name, text, tags, years }, i) => (
          <div key={name} className="chapter">
            <p className="chapter__kicker">
              <b>{String(i + 1).padStart(2, "0")}</b> / {String(N).padStart(2, "0")} · {years}
            </p>
            <h3 className="chapter__name">{name}</h3>
            <p className="chapter__text">{text}</p>
            <ul className="chapter__tags">
              {tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="sys__hud" aria-hidden>
        <span>
          Система <b>A/</b> · {N} планет
        </span>
        <span className="sys__bar">
          <i />
        </span>
        <span>
          Дистанция <b className="sys__dist">0.00</b> а.е.
        </span>
        <span>
          <b>{String(chapter).padStart(2, "0")}</b> / {String(N).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
