"use client";

import { useRef, useState } from "react";
import { finePointer, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DockerIcon, GraphqlIcon, NextIcon, NodeIcon, PostgresIcon, ReactIcon, TailwindIcon, TsIcon } from "./icons";

const planets = [
  {
    name: "React",
    Icon: ReactIcon,
    color: "#ff2b3d",
    size: 8.4,
    ring: true,
    years: "6 лет",
    text: "Сердце моего стека: архитектура компонентов, Server Components и бескомпромиссная производительность.",
    tags: ["RSC", "Hooks", "Suspense"],
  },
  {
    name: "Next.js",
    Icon: NextIcon,
    color: "#dcdce4",
    size: 7,
    years: "4 года",
    text: "App Router, SSR и ISR — быстрые продукты, которые любят и пользователи, и поисковики.",
    tags: ["App Router", "SSR / ISR", "Edge"],
  },
  {
    name: "TypeScript",
    Icon: TsIcon,
    color: "#7f93bd",
    size: 6.6,
    years: "5 лет",
    text: "Строгая типизация как страховка: меньше багов в проде, смелее рефакторинг.",
    tags: ["Strict", "Generics", "Zod"],
  },
  {
    name: "Node.js",
    Icon: NodeIcon,
    color: "#ff9a3d",
    size: 7.6,
    years: "6 лет",
    text: "API, BFF и real-time сервисы — от прототипа за вечер до нагруженного продакшена.",
    tags: ["REST", "WebSocket", "BFF"],
  },
  {
    name: "GraphQL",
    Icon: GraphqlIcon,
    color: "#ff4f9a",
    size: 6.2,
    years: "3 года",
    text: "Гибкие схемы и Apollo: интерфейс получает ровно те данные, которые ему нужны.",
    tags: ["Apollo", "Schema", "Codegen"],
  },
  {
    name: "PostgreSQL",
    Icon: PostgresIcon,
    color: "#8e98ab",
    size: 7.2,
    years: "5 лет",
    text: "Надёжные данные: моделирование, индексы, транзакции и Prisma поверх.",
    tags: ["Prisma", "Индексы", "SQL"],
  },
  {
    name: "Tailwind CSS",
    Icon: TailwindIcon,
    color: "#ff6b5a",
    size: 6.4,
    years: "4 года",
    text: "Дизайн-системы и UI-киты, которые масштабируются вместе с продуктом.",
    tags: ["Tokens", "UI-кит", "A11y"],
  },
  {
    name: "Docker",
    Icon: DockerIcon,
    color: "#a9c6d9",
    size: 8,
    ring: true,
    years: "3 года",
    text: "Контейнеры и CI/CD — одинаково стабильно от ноутбука до продакшена.",
    tags: ["CI/CD", "Compose", "Deploy"],
  },
];

const N = planets.length;
const P = 1200;
const FOCUS = 0.62;
const PER_CHAPTER = 0.9;
const clamp01 = gsap.utils.clamp(0, 1);
const smoother = (x: number) => x * x * x * (x * (6 * x - 15) + 10);
/** Cinematic pacing: nearly still while a title is on screen, fast between planets. */
const pace = (u: number) => 0.08 * u + 0.92 * smoother(clamp01((u - 0.3) / 0.4));

export default function Stack() {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);

  useGSAP(
    () => {
      const section = root.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sys = section.querySelector<HTMLElement>(".sys")!;
      const plane = section.querySelector<HTMLElement>(".sys__plane")!;
      const orbits = gsap.utils.toArray<HTMLElement>(".sys__orbit", section);
      const belt = section.querySelector<HTMLElement>(".sys__belt")!;
      const star = section.querySelector<HTMLElement>(".star")!;
      const nodes = gsap.utils.toArray<HTMLElement>(".planet", section);
      const chapters = gsap.utils.toArray<HTMLElement>(".chapter", section);
      const link = section.querySelector<SVGPathElement>(".sys__link path")!;
      const dot = section.querySelector<SVGCircleElement>(".sys__link circle")!;
      const reticle = section.querySelector<HTMLElement>(".sys__reticle")!;
      const bar = section.querySelector<HTMLElement>(".sys__bar i")!;

      const state = { target: 0, t: 0, yaw: 0, lift: 0 };
      let cx = 0;
      let cy = 0;
      let rMax = 0;
      let ax = 0;
      let ay = 0;
      let phone = false;
      let radii: number[] = [];
      let speeds: number[] = [];
      let widths: number[] = [];
      const orbitFocus = planets.map(() => -1);
      let current = -1;

      const layout = () => {
        const w = section.clientWidth;
        const h = section.clientHeight;
        phone = w <= 600;
        cx = phone ? w * 0.5 : w * 0.6;
        cy = phone ? h * 0.66 : h * 0.54;
        rMax = phone ? w * 0.62 : Math.min(w * 0.46, h * 0.95);
        radii = planets.map((_, i) => rMax * (0.24 + (0.76 * i) / (N - 1)));
        speeds = radii.map((r) => 1.05 * Math.sqrt(rMax / r));
        widths = nodes.map((n) => n.offsetWidth);
        sys.style.perspectiveOrigin = `${cx}px ${cy}px`;
        plane.style.left = `${cx}px`;
        plane.style.top = `${cy}px`;
        orbits.forEach((o, i) => {
          const d = radii[i] * 2;
          o.style.width = o.style.height = `${d}px`;
          o.style.margin = `${-d / 2}px 0 0 ${-d / 2}px`;
        });
        const bd = (radii[3] + radii[4]) * 1;
        belt.style.width = belt.style.height = `${bd}px`;
        belt.style.margin = `${-bd / 2}px 0 0 ${-bd / 2}px`;
        const head = section.querySelector<HTMLElement>(".chapters")!.getBoundingClientRect();
        const box = section.getBoundingClientRect();
        ax = head.right - box.left + 24;
        ay = head.top - box.top + head.height * 0.42;
      };

      const render = (time = 0) => {
        state.t += (state.target - state.t) * 0.14;
        const T = state.t;
        const intro = smoother(clamp01(T));
        const k = 0.66 + 0.34 * intro;
        const tilt = ((56 + 14 * intro + state.lift) * Math.PI) / 180;
        const drift = reduced ? 0 : Math.sin(time * 0.25) * 0.05;
        const yaw = state.yaw + drift;
        const cosT = Math.cos(tilt);
        const sinT = Math.sin(tilt);

        plane.style.transform = `rotateX(${tilt}rad) rotateZ(${yaw}rad) scale(${k})`;
        star.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${k})`;

        let fx = 0;
        let fy = 0;
        let fs = 0;
        let focusMax = 0;

        nodes.forEach((n, i) => {
          const a = FOCUS + speeds[i] * (T - (i + 1)) + yaw;
          const x = Math.cos(a) * radii[i] * k;
          const y = Math.sin(a) * radii[i] * k;
          const z = y * sinT;
          const s = P / (P - z);
          const X = cx + x * s;
          const Y = cy + y * cosT * s;
          const focus = clamp01(1 - Math.abs(T - (i + 1)) / 0.45);
          n.style.transform = `translate(${X}px, ${Y}px) translate(-50%, -50%) scale(${s * k * (1 + focus * 0.35)})`;
          n.style.zIndex = String(1000 + Math.round(z));
          const dx = cx - X;
          const dy = cy - Y;
          const dl = Math.hypot(dx, dy) || 1;
          n.style.setProperty("--lx", `${50 + (dx / dl) * 26}%`);
          n.style.setProperty("--ly", `${50 + (dy / dl) * 26}%`);
          n.style.setProperty("--f", focus.toFixed(3));
          n.style.opacity = String(0.55 + 0.45 * clamp01((z + rMax) / rMax));
          const of = Math.round(focus * 20) / 20;
          if (of !== orbitFocus[i]) {
            orbitFocus[i] = of;
            orbits[i].style.setProperty("--f", String(of));
          }
          if (focus > focusMax) {
            focusMax = focus;
            fx = X;
            fy = Y;
            fs = widths[i] * s * k * (1 + focus * 0.35);
          }
        });

        chapters.forEach((c, i) => {
          const d = T - i;
          const o = clamp01(1 - Math.abs(d) / 0.36);
          c.style.opacity = String(o * o);
          c.style.visibility = o < 0.01 ? "hidden" : "visible";
          c.style.transform = `translate3d(0, ${-d * 110}px, 0) rotateX(${d * 28}deg)`;
        });

        const on = !phone && focusMax > 0.02;
        link.style.opacity = dot.style.opacity = on ? String(focusMax) : "0";
        if (on) {
          const ex = fx - fs * 0.62;
          link.setAttribute("d", `M${ax} ${ay} C${ax + 120} ${ay}, ${ex - 140} ${fy}, ${ex} ${fy}`);
          dot.setAttribute("cx", String(ex));
          dot.setAttribute("cy", String(fy));
        }
        reticle.style.opacity = String(focusMax);
        reticle.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%) scale(${Math.max(0.2, fs / 100) * (1.5 - focusMax * 0.2)})`;

        const idx = Math.round(gsap.utils.clamp(0, N, T));
        if (idx !== current) {
          current = idx;
          setChapter(idx);
        }
        bar.style.transform = `scaleX(${T / N})`;
      };

      layout();
      render();

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
        const yawTo = gsap.quickTo(state, "yaw", { duration: 2, ease: "power3.out" });
        const liftTo = gsap.quickTo(state, "lift", { duration: 2, ease: "power3.out" });
        move = (e) => {
          yawTo((e.clientX / window.innerWidth - 0.5) * -0.18);
          liftTo((e.clientY / window.innerHeight - 0.5) * -6);
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

      <div className="sys" aria-hidden>
        <div className="sys__plane">
          {planets.map((p) => (
            <span key={p.name} className="sys__orbit" />
          ))}
          <span className="sys__belt" />
        </div>
      </div>

      <div className="star" aria-hidden>
        <span className="star__corona" />
        <span className="star__flare" />
        <span className="star__core" />
      </div>

      {planets.map(({ name, Icon, color, size, ring, years }) => (
        <div key={name} className="planet" style={{ "--c": color, "--s": `${size}rem` } as React.CSSProperties}>
          {ring && <span className="planet__ring" />}
          <span className="planet__body">
            <Icon />
          </span>
          {ring && <span className="planet__ring planet__ring--front" />}
          <span className="planet__label">
            {name}
            <small>{years}</small>
          </span>
        </div>
      ))}

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
          <p className="lead">Моя вселенная технологий. Скролльте — пролетим по орбитам.</p>
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
          <b>{String(chapter).padStart(2, "0")}</b> / {String(N).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
