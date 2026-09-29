"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { burst, warp } from "@/lib/fx";
import { CodeIcon, PenIcon, RocketIcon, SearchIcon } from "./icons";

const steps = [
  {
    title: "Анализ",
    text: "Обсуждаем задачу, цели и требования.",
    Icon: SearchIcon,
    time: "2–3 дня",
    items: ["Бриф и интервью", "Анализ конкурентов", "ТЗ и точная оценка"],
  },
  {
    title: "Проектирование",
    text: "Структура, UI/UX и техническое решение.",
    Icon: PenIcon,
    time: "~1 неделя",
    items: ["Карта сайта и сценарии", "Прототипы и UI-кит", "Архитектура и стек"],
  },
  {
    title: "Разработка",
    text: "Чистый, масштабируемый код с регулярными апдейтами.",
    Icon: CodeIcon,
    time: "2–4 недели",
    items: ["Компоненты и анимации", "API и интеграции", "Демо каждую неделю"],
  },
  {
    title: "Запуск",
    text: "Деплой, тестирование и дальнейшая поддержка.",
    Icon: RocketIcon,
    time: "1–2 дня",
    items: ["Тесты и Lighthouse 95+", "Деплой и мониторинг", "Поддержка после релиза"],
  },
];

const CHARGE = 2 * Math.PI * 38;

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [launches, setLaunches] = useState(0);
  const touched = useRef(false);
  const launch = useRef<() => void>(() => {});
  const charge = useRef({ start: () => {}, stop: () => {} });

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rocket = root.current!.querySelector<HTMLElement>(".step__icon--rocket")!;
      const ring = rocket.querySelector<SVGCircleElement>(".step__charge circle")!;
      const icon = rocket.querySelector<SVGElement>(":scope > svg:not(.step__charge)")!;
      const power = { v: 0 };
      let flying = false;

      const drawCharge = () => (ring.style.strokeDashoffset = String(CHARGE * (1 - power.v)));
      const shake = gsap.to(icon, { x: 1.5, y: -1, duration: 0.05, repeat: -1, yoyo: true, paused: true, ease: "none" });

      launch.current = () => {
        if (flying) return;
        flying = true;
        setActive(3);
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
        burst(r.left + r.width / 2, r.top + r.height / 2, 40);
        warp(reduced ? 0 : -60);

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
            x: window.innerWidth * 0.55,
            y: -window.innerHeight * 1.1,
            scale: 2.2,
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

      if (reduced) return;
      let timer: ReturnType<typeof setInterval> | undefined;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 60%",
        end: "bottom 30%",
        onToggle: (self) => {
          clearInterval(timer);
          if (self.isActive) timer = setInterval(() => !touched.current && setActive((a) => (a + 1) % steps.length), 3200);
        },
      });
      return () => clearInterval(timer);
    },
    { scope: root },
  );

  useGSAP(
    () => {
      gsap.fromTo(
        ".process__panel .panel__anim",
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: "expo.out" },
      );
      gsap.to(".panel__bar i", { scaleX: (active + 1) / steps.length, duration: 0.8, ease: "expo.out" });
    },
    { dependencies: [active], scope: root },
  );

  const pick = (i: number) => {
    touched.current = true;
    setActive(i);
  };

  const s = steps[active];

  return (
    <section ref={root} id="process" className="section process">
      <div className="section__bg process__bg" aria-hidden>
        <div className="section__bg-inner" data-zoom>
          {/* <Image src="/images/mountains.png" alt="" fill sizes="100vw" quality={80} /> */}
        </div>
      </div>

      <div className="container process__grid">
        <div className="process__text">
          <p className="label" data-reveal>
            <b>04 /</b> <span>Мой процесс</span>
          </p>
          <h2 className="h2" data-split>
            От идеи
            <br />
            до <span className="accent">результата.</span>
          </h2>
          <p className="lead" data-reveal="0.2">
            Каждый проект — это последовательный путь, где важен каждый этап.
          </p>

          <div data-reveal="0.3">
            <div className="process__panel" data-tilt="12" aria-live="polite">
              <div className="panel__head" key={`h${active}`}>
                <span className="panel__step panel__anim">Этап 0{active + 1}</span>
                <span className="panel__time panel__anim">⏱ {s.time}</span>
              </div>
              <h3 className="panel__title panel__anim" key={`t${active}`}>
                {s.title}
              </h3>
              <ul className="panel__list" key={`l${active}`}>
                {s.items.map((item) => (
                  <li key={item} className="panel__anim">
                    <i>✓</i> {item}
                  </li>
                ))}
              </ul>
              <div className="panel__nav">
                {steps.map((st, i) => (
                  <button
                    key={st.title}
                    type="button"
                    className={`panel__dot${i === active ? " is-active" : ""}`}
                    onClick={() => pick(i)}
                    aria-label={st.title}
                  />
                ))}
                <span className="panel__bar">
                  <i />
                </span>
              </div>
            </div>
          </div>
        </div>

        <ol className="steps" data-stagger>
          {steps.map(({ title, text, Icon }, i) => {
            const rocket = i === steps.length - 1;
            const content = (
              <>
                <span className="step__ripple" />
                {rocket && (
                  <svg className="step__charge" viewBox="0 0 80 80" aria-hidden>
                    <circle cx="40" cy="40" r="38" strokeDasharray={CHARGE} strokeDashoffset={CHARGE} />
                  </svg>
                )}
                <Icon />
              </>
            );
            return (
              <li
                key={title}
                className={`step${i === active ? " is-active" : ""}`}
                data-item
                onPointerEnter={() => pick(i)}
                onClick={() => pick(i)}
              >
                {rocket ? (
                  <button
                    type="button"
                    className="step__icon step__icon--rocket"
                    data-anchor={5 + i}
                    aria-label="Зажмите, чтобы запустить ракету"
                    onPointerDown={() => charge.current.start()}
                    onPointerUp={() => charge.current.stop()}
                    onPointerLeave={() => charge.current.stop()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && launch.current()}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {content}
                  </button>
                ) : (
                  <span className="step__icon" data-anchor={5 + i}>
                    {content}
                  </span>
                )}
                <div>
                  <h3 className="step__title">
                    <em>0{i + 1}</em> {title}
                  </h3>
                  <p className="step__text">{text}</p>
                  {rocket && <p className="step__hint">{launches ? `🚀 Запусков: ${launches} — ещё?` : "Зажмите ракету 🚀"}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
