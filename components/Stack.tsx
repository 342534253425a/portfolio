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
const PER_CHAPTER = 0.9;
const clamp01 = gsap.utils.clamp(0, 1);
const smoother = (x: number) => x * x * x * (x * (6 * x - 15) + 10);
/** Cinematic pacing: nearly still while a title is on screen, fast between planets. */
const pace = (u: number) => 0.08 * u + 0.92 * smoother(clamp01((u - 0.3) / 0.4));
const radii = planets.map((_, i) => R0 + DR * i);
const phases = planets.map((_, i) => 0.6 + i * 2.39996);
/** Per-planet camera elevation and swing (negative swing keeps the sun right of the planet, away from the text). */
const SHOTS: [number, number][] = [
  [0.2, -0.42],
  [0.1, -0.16],
  [0.3, -0.62],
  [0.14, -0.28],
  [0.24, -0.7],
  [0.08, -0.12],
  [0.28, -0.5],
  [0.16, -0.34],
];

export default function Stack() {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);

  useGSAP(
    () => {
      const section = root.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const canvas = section.querySelector<HTMLCanvasElement>(".sys__canvas")!;
      const ctx = canvas.getContext("2d")!;
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
      const points = [...dust, ...sky, ...belt];
      const tint = points.map((_, i) => (i >= dust.length + sky.length ? 2 : Math.random() < 0.14 ? 1 : 0));
      const prevX = new Float32Array(points.length);
      const prevY = new Float32Array(points.length);
      const prevOk = new Uint8Array(points.length);

      const state = { target: 0, t: 0, mx: 0, my: 0, enter: 0 };
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
          const d = RMAX * (phone ? 3.3 : 2.5) * (1 + (1 - state.enter) * 0.9);
          const az = -1.05 + (1 - state.enter) * 0.5;
          const el = 0.5 + (1 - state.enter) * 0.25;
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
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        prevOk.fill(0);
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

      const render = (time = 0) => {
        state.t += (state.target - state.t) * 0.12;
        const T = state.t;
        const i = Math.min(N - 1, Math.floor(T));
        const u = T - i;
        const pu = smoother(u);
        const lu = smoother(clamp01((u - 0.05) * 1.8));
        const [C0, L0] = shot(i, time);
        const [C1, L1] = shot(i + 1, time);
        const hop = Math.hypot(C1[0] - C0[0], C1[1] - C0[1], C1[2] - C0[2]);
        const arc = Math.sin(Math.PI * pu) * hop * 0.1;
        const cam: V3 = [C0[0] + (C1[0] - C0[0]) * pu, C0[1] + (C1[1] - C0[1]) * pu + arc, C0[2] + (C1[2] - C0[2]) * pu];
        const L: V3 = [L0[0] + (L1[0] - L0[0]) * lu, L0[1] + (L1[1] - L0[1]) * lu, L0[2] + (L1[2] - L0[2]) * lu];

        let f: V3 = [L[0] - cam[0], L[1] - cam[1], L[2] - cam[2]];
        const fl = Math.hypot(f[0], f[1], f[2]) || 1;
        f = [f[0] / fl, f[1] / fl, f[2] / fl];
        let r: V3 = [-f[2], 0, f[0]];
        const rl = Math.hypot(r[0], r[2]) || 1;
        r = [r[0] / rl, 0, r[2] / rl];
        let v: V3 = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
        const roll = Math.sin(Math.PI * pu) * 0.14 * (i % 2 ? 1 : -1) + (reduced ? 0 : Math.sin(time * 0.3) * 0.01);
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

        ctx.clearRect(0, 0, w, h);

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
          const far = k >= dust.length && k < dust.length + sky.length;
          const size = far ? 1.1 : Math.min(3.2, Math.max(0.7, PS * 5));
          const a = far ? 0.55 : Math.min(0.85, 0.2 + PS * 3);
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

        proj(0, 0, 0);
        place(sun, Math.min(PS * 1.9, 2), PZ, PZ > NEAR);

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

        chapters.forEach((c, k) => {
          const d = T - k;
          const o = clamp01(1 - Math.abs(d) / 0.34);
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
        onUpdate: (self) => (state.enter = self.progress),
        onLeave: () => (state.enter = 1),
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * PER_CHAPTER * (N + 0.6)}`,
        pin: true,
        anticipatePin: 1,
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
        onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
      });

      const ro = new ResizeObserver(() => {
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

      <span className="sys__reticle" aria-hidden>
        <i />
      </span>
      <svg className="sys__link" aria-hidden>
        <path />
        <circle r="4" />
      </svg>

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
