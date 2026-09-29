"use client";

import { useRef, useState } from "react";
import { finePointer, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { burst, warp } from "@/lib/fx";
import { CodeIcon, PenIcon, RocketIcon, SearchIcon } from "./icons";

const steps = [
  {
    title: "Анализ",
    text: "Погружаюсь в продукт: цели бизнеса, аудитория, ограничения и метрики успеха.",
    Icon: SearchIcon,
    tags: ["Интервью", "Конкуренты", "ТЗ"],
  },
  {
    title: "Проектирование",
    text: "Архитектура, сценарии и UI-система — решения, которые масштабируются.",
    Icon: PenIcon,
    tags: ["UX-сценарии", "UI-кит", "Архитектура"],
  },
  {
    title: "Разработка",
    text: "Чистый типизированный код, анимации на 60 fps и демо на каждом этапе.",
    Icon: CodeIcon,
    tags: ["TypeScript", "Тесты", "Code review"],
  },
  {
    title: "Запуск",
    text: "Деплой, мониторинг и Lighthouse 95+. И дальше — поддержка и рост.",
    Icon: RocketIcon,
    tags: ["CI/CD", "Мониторинг", "Поддержка"],
  },
];

const N = steps.length;
const RINGS = 14;
const CHARGE = 2 * Math.PI * 38;
const wrap = (v: number, m: number) => ((v % m) + m) % m;

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [launches, setLaunches] = useState(0);
  const goTo = useRef<(i: number) => void>(() => {});
  const launch = useRef<() => void>(() => {});
  const charge = useRef({ start: () => {}, stop: () => {} });

  useGSAP(
    () => {
      const section = root.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const gates = gsap.utils.toArray<HTMLElement>(".gate", section);
      const rings = gsap.utils.toArray<HTMLElement>(".tunnel__ring", section);
      const rail = section.querySelector<HTMLElement>(".tunnel__rail")!;
      const depthEl = section.querySelector<HTMLElement>(".hud__depth b")!;
      const speedEl = section.querySelector<HTMLElement>(".hud__speed b")!;
      const bar = section.querySelector<HTMLElement>(".tunnel__bar i")!;

      let gap = 0;
      let ringGap = 0;
      let depth = 0;
      let from = 0;
      let to = 0;
      let current = -1;
      const near = 260;

      const layout = () => {
        gap = Math.max(window.innerWidth, window.innerHeight) * 1.05;
        ringGap = gap / 2.6;
        depth = RINGS * ringGap;
        from = -gap * 0.45;
        to = (N - 1) * gap;
        rail.style.height = `${depth}px`;
      };

      const render = (cam: number) => {
        gates.forEach((g, i) => {
          const z = cam - i * gap;
          let o = 0;
          if (z < -gap * 0.2) o = gsap.utils.clamp(0, 1, (z + gap * 3) / (gap * 2.8)) ** 1.6;
          else if (z < gap * 0.04) o = 1;
          else o = gsap.utils.clamp(0, 1, 1 - (z - gap * 0.04) / (gap * 0.26));
          g.style.opacity = String(o);
          g.style.setProperty("--b", String(gsap.utils.clamp(0, 1, 1 - (-z - gap * 0.12) / (gap * 0.35))));
          g.style.visibility = o < 0.01 ? "hidden" : "visible";
          g.style.transform = `translate(-50%, -50%) translate3d(0, 0, ${z}px)`;
        });

        rings.forEach((r, k) => {
          const world = cam - k * ringGap;
          const z = near - wrap(near - world, depth);
          const fog = gsap.utils.clamp(0, 1, (z + depth) / (depth * 0.55));
          const fade = gsap.utils.clamp(0, 1, (near - z) / 320);
          const x = Math.sin(world * 0.00045) * window.innerWidth * 0.06;
          const y = Math.cos(world * 0.00038) * window.innerHeight * 0.04;
          r.style.opacity = String(fog * fade);
          r.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotate(${world * 0.01}deg)`;
        });

        rail.style.backgroundPosition = `0 0, 0 ${-wrap(cam, 480)}px`;

        const idx = gsap.utils.clamp(0, N - 1, Math.round(cam / gap));
        if (idx !== current) {
          current = idx;
          setActive(idx);
        }
        depthEl.textContent = String(Math.max(0, Math.round((cam - from) / 3))).padStart(4, "0");
        bar.style.transform = `scaleX(${(cam - from) / (to - from)})`;
      };

      layout();
      render(from);

      const pin = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * 1.1 * N}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          layout();
          render(from + (to - from) * self.progress);
        },
        onUpdate: (self) => {
          render(from + (to - from) * self.progress);
          speedEl.textContent = Math.abs(self.getVelocity() / 1000).toFixed(1);
        },
        onLeave: () => (speedEl.textContent = "0.0"),
        onLeaveBack: () => (speedEl.textContent = "0.0"),
      });

      goTo.current = (i) => {
        const p = (i * gap - from) / (to - from);
        getLenis()?.scrollTo(pin.start + p * (pin.end - pin.start), { duration: 1.8 });
      };

      const rocket = section.querySelector<HTMLElement>(".gate__icon--rocket")!;
      const ring = rocket.querySelector<SVGCircleElement>(".gate__charge circle")!;
      const icon = rocket.querySelector<SVGElement>(":scope > svg:not(.gate__charge)")!;
      const cam = section.querySelector<HTMLElement>(".tunnel__cam")!;
      const power = { v: 0 };
      let flying = false;

      const drawCharge = () => (ring.style.strokeDashoffset = String(CHARGE * (1 - power.v)));
      const shake = gsap.to(icon, { x: 1.5, y: -1, duration: 0.05, repeat: -1, yoyo: true, paused: true, ease: "none" });

      launch.current = () => {
        if (flying) return;
        flying = true;
        setLaunches((n) => n + 1);
        const r = icon.getBoundingClientRect();
        const fly = document.createElement("div");
        fly.className = "rocket-fly";
        fly.style.left = `${r.left}px`;
        fly.style.top = `${r.top}px`;
        fly.style.width = `${r.width}px`;
        fly.style.height = `${r.height}px`;
        fly.appendChild(icon.cloneNode(true));
        document.body.appendChild(fly);
        gsap.set(icon, { autoAlpha: 0 });
        burst(r.left + r.width / 2, r.top + r.height / 2, 50);
        warp(reduced ? 0 : -80);
        if (!reduced) {
          gsap.fromTo(cam, { x: -8, y: 6 }, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1.2, 0.25)" });
          gsap.fromTo(".tunnel__flash", { opacity: 0.55 }, { opacity: 0, duration: 1.2, ease: "power2.out" });
        }

        let frame = 0;
        gsap
          .timeline({
            onComplete: () => {
              fly.remove();
              gsap.fromTo(
                icon,
                { y: 40, autoAlpha: 0, scale: 0.4 },
                { y: 0, autoAlpha: 1, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.5)", onComplete: () => (flying = false) },
              );
            },
          })
          .to(fly, { x: -10, y: 16, scale: 0.9, duration: 0.18, ease: "power2.out" })
          .to(fly, {
            x: window.innerWidth * 0.3,
            y: -window.innerHeight * 1.1,
            scale: 2.4,
            duration: 1.3,
            ease: "power2.in",
            onUpdate: () => {
              if (++frame % 2) return;
              const b = fly.getBoundingClientRect();
              burst(b.left + b.width * 0.2, b.bottom - b.height * 0.2, 3);
            },
          });
      };

      charge.current = {
        start: () => {
          if (flying || reduced) return;
          shake.play();
          gsap.to(power, {
            v: 1,
            duration: 1.1 * (1 - power.v),
            ease: "none",
            overwrite: true,
            onUpdate: drawCharge,
            onComplete: () => {
              shake.pause();
              gsap.set(icon, { x: 0, y: 0 });
              launch.current();
              gsap.to(power, { v: 0, duration: 0.6, onUpdate: drawCharge });
            },
          });
        },
        stop: () => {
          if (power.v >= 1) return;
          shake.pause();
          gsap.set(icon, { x: 0, y: 0 });
          gsap.to(power, { v: 0, duration: 0.5, ease: "power2.out", overwrite: true, onUpdate: drawCharge });
        },
      };

      if (reduced || !finePointer()) return;
      const rig = section.querySelector<HTMLElement>(".tunnel__rig")!;
      const ry = gsap.quickTo(rig, "rotationY", { duration: 1.8, ease: "power3.out" });
      const rx = gsap.quickTo(rig, "rotationX", { duration: 1.8, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        ry((e.clientX / window.innerWidth - 0.5) * 8);
        rx((e.clientY / window.innerHeight - 0.5) * -6);
      };
      section.addEventListener("pointermove", move);
      return () => section.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  useGSAP(
    () => {
      gsap.fromTo(".tunnel__nav .is-active i", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "expo.out" });
    },
    { dependencies: [active], scope: root },
  );

  return (
    <section ref={root} id="process" className="process">
      <div className="tunnel">
        <div className="tunnel__cam">
          <div className="tunnel__rig">
            <div className="tunnel__rail" aria-hidden />
            {Array.from({ length: RINGS }, (_, k) => (
              <span key={k} className={`tunnel__ring${k % 3 === 0 ? " tunnel__ring--hot" : ""}`} aria-hidden />
            ))}
            {steps.map(({ title, text, Icon, tags }, i) => {
              const rocket = i === N - 1;
              return (
                <article key={title} className={`gate${i === active ? " is-active" : ""}`}>
                  <span className="gate__ring" aria-hidden>
                    <i />
                  </span>
                  <span className="gate__num" aria-hidden>
                    0{i + 1}
                  </span>
                  <div className="gate__body">
                    <p className="gate__kicker">Этап 0{i + 1}</p>
                    <h3 className="gate__title">{title}</h3>
                    <p className="gate__text">{text}</p>
                    <ul className="gate__tags">
                      {tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  {rocket ? (
                    <button
                      type="button"
                      className="gate__icon gate__icon--rocket"
                      aria-label="Зажмите, чтобы запустить ракету"
                      onPointerDown={() => charge.current.start()}
                      onPointerUp={() => charge.current.stop()}
                      onPointerLeave={() => charge.current.stop()}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && launch.current()}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <svg className="gate__charge" viewBox="0 0 80 80" aria-hidden>
                        <circle cx="40" cy="40" r="38" strokeDasharray={CHARGE} strokeDashoffset={CHARGE} />
                      </svg>
                      <Icon />
                    </button>
                  ) : (
                    <span className="gate__icon">
                      <Icon />
                    </span>
                  )}
                  {rocket && (
                    <p className="gate__hint">{launches ? `🚀 Запусков: ${launches} — ещё?` : "Зажмите ракету, чтобы запустить 🚀"}</p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <span className="tunnel__flash" aria-hidden />
      <span className="tunnel__frame" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>

      <div className="container tunnel__head">
        <p className="label" data-reveal>
          <b>04 /</b> <span>Мой процесс</span>
        </p>
        <h2 className="h2 tunnel__title" data-split>
          От идеи
          <br />
          до <span className="accent">результата.</span>
        </h2>
      </div>

      <nav className="tunnel__nav" aria-label="Этапы">
        {steps.map((s, i) => (
          <button key={s.title} type="button" className={i === active ? "is-active" : ""} onClick={() => goTo.current(i)}>
            <em>0{i + 1}</em> {s.title}
            <i />
          </button>
        ))}
      </nav>

      <div className="tunnel__hud" aria-hidden>
        <span className="hud__depth">
          Глубина <b>0000</b> м
        </span>
        <span className="tunnel__bar">
          <i />
        </span>
        <span className="hud__speed">
          Скорость <b>0.0</b> c
        </span>
      </div>
    </section>
  );
}
