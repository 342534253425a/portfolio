"use client";

import { useRef, useState } from "react";
import { Draggable, gsap, useGSAP } from "@/lib/gsap";
import { burst, burstFrom } from "@/lib/fx";

const TYPES = ["Лендинг", "Интернет-магазин", "Веб-приложение", "3D и анимации", "Редизайн"];
const TIMES = [
  { label: "Вчера", note: "Беру кофе и начинаю прямо сейчас ☕" },
  { label: "2 недели", note: "Бодрый темп, еженедельные демо 🚀" },
  { label: "Месяц", note: "Идеально — время на детали и вау-эффекты ✨" },
  { label: "Не спешим", note: "Сделаем шедевр без компромиссов 🎨" },
];

export default function Brief({ email }: { email: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [types, setTypes] = useState<string[]>(["Лендинг"]);
  const [time, setTime] = useState(2);
  const snapTo = useRef<(i: number) => void>(() => {});

  useGSAP(
    () => {
      const track = root.current!.querySelector<HTMLElement>(".brief__track")!;
      const knob = root.current!.querySelector<HTMLElement>(".brief__knob")!;
      const fill = root.current!.querySelector<HTMLElement>(".brief__fill")!;
      let width = 0;
      let current = 2;
      const stop = (i: number) => (width * i) / (TIMES.length - 1);
      const paint = (x: number) => gsap.set(fill, { scaleX: width ? x / width : 0 });
      const pick = (x: number) => {
        const i = Math.round((x / width) * (TIMES.length - 1));
        if (i !== current) {
          current = i;
          setTime(i);
        }
      };

      snapTo.current = (i: number) => {
        current = i;
        setTime(i);
        gsap.to(knob, {
          x: stop(i),
          duration: 0.6,
          ease: "elastic.out(1, 0.6)",
          onUpdate: () => paint(gsap.getProperty(knob, "x") as number),
        });
      };

      const [drag] = Draggable.create(knob, {
        type: "x",
        bounds: { minX: 0, maxX: 0 },
        onPress() {
          knob.classList.add("is-grab");
        },
        onDrag() {
          paint(this.x);
          pick(this.x);
        },
        onRelease() {
          knob.classList.remove("is-grab");
          snapTo.current(current);
        },
      });

      const layout = () => {
        width = track.offsetWidth;
        drag.applyBounds({ minX: 0, maxX: width });
        gsap.set(knob, { x: stop(current) });
        paint(stop(current));
      };
      layout();
      const ro = new ResizeObserver(layout);
      ro.observe(track);
      return () => {
        drag.kill();
        ro.disconnect();
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      gsap.fromTo(".brief__summary", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" });
    },
    { dependencies: [types, time], scope: root },
  );

  const toggle = (t: string, el: HTMLElement) => {
    const on = !types.includes(t);
    setTypes((prev) => (on ? [...prev, t] : prev.filter((x) => x !== t)));
    gsap.fromTo(el, { scale: on ? 0.8 : 1.1 }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    if (on) burstFrom(el, 14);
  };

  const what = types.length ? types.join(" + ") : "Что-то особенное";
  const summary = `${what} · срок: ${TIMES[time].label.toLowerCase()}`;
  const href = `mailto:${email}?subject=${encodeURIComponent(`Бриф: ${what}`)}&body=${encodeURIComponent(
    `Привет! Хочу обсудить проект.\n\nЧто: ${what}\nСрок: ${TIMES[time].label}\n\nПодробности: `,
  )}`;

  const send = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const plane = document.createElement("div");
    plane.className = "plane-fly";
    plane.textContent = "✈";
    plane.style.left = `${r.right - 40}px`;
    plane.style.top = `${r.top + r.height / 2 - 14}px`;
    document.body.appendChild(plane);
    burst(r.right - 30, r.top + r.height / 2, 30);
    gsap
      .timeline({
        onComplete: () => {
          plane.remove();
          window.location.href = href;
        },
      })
      .to(plane, { x: -20, y: 20, rotation: 20, duration: 0.2, ease: "power2.out" })
      .to(plane, {
        keyframes: [
          { x: window.innerWidth * 0.25, y: -120, rotation: -25, duration: 0.45, ease: "power1.in" },
          {
            x: window.innerWidth * 0.7,
            y: -window.innerHeight * 0.8,
            rotation: -40,
            scale: 0.4,
            autoAlpha: 0,
            duration: 0.55,
            ease: "power2.in",
          },
        ],
      });
  };

  return (
    <div ref={root} className="brief" data-tilt="5">
      <p className="brief__title">
        <span className="brief__live" /> Соберите бриф за 10 секунд
      </p>

      <div className="brief__chips">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={`chip${types.includes(t) ? " is-on" : ""}`}
            aria-pressed={types.includes(t)}
            onClick={(e) => toggle(t, e.currentTarget)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="brief__range">
        <div className="brief__track">
          <span className="brief__fill" />
          <span
            className="brief__knob"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={time}
            aria-label="Срок"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") snapTo.current(Math.min(3, time + 1));
              if (e.key === "ArrowLeft") snapTo.current(Math.max(0, time - 1));
            }}
          />
        </div>
        <div className="brief__stops">
          {TIMES.map((t, i) => (
            <button key={t.label} type="button" className={i === time ? "is-on" : ""} onClick={() => snapTo.current(i)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="brief__foot">
        <p className="brief__summary" key={summary}>
          <b>{summary}</b>
          <span>{TIMES[time].note}</span>
        </p>
        <a href={href} className="btn btn--primary brief__send" onClick={send}>
          <span className="btn__label">Отправить бриф</span> ✈
        </a>
      </div>
    </div>
  );
}
