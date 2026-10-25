"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";

const rows = [
  ["React", "Next.js", "GSAP", "TypeScript", "Node.js", "Supabase", "PWA", "UI/UX"],
  ["Анимации", "Интерфейсы", "Архитектура", "Скорость", "Детали", "Опыт", "Система", "Результат"],
];

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tracks = gsap.utils.toArray<HTMLElement>(".marquee__track", root.current);
      const state = tracks.map((_, i) => ({ x: 0, dir: i % 2 ? 1 : -1, slow: 1 }));
      const setters = tracks.map((t) => gsap.quickSetter(t, "x", "px"));
      let dir = 1;

      const tick = () => {
        const v = getLenis()?.velocity ?? 0;
        if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
        tracks.forEach((t, i) => {
          const s = state[i];
          const half = t.scrollWidth / 2;
          s.x += (1.2 + Math.abs(v) * 0.6) * s.dir * dir * s.slow;
          if (s.x <= -half) s.x += half;
          if (s.x > 0) s.x -= half;
          setters[i](s.x);
        });
      };

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
      });

      tracks.forEach((t, i) => {
        const band = t.parentElement!;
        band.addEventListener("mouseenter", () => gsap.to(state[i], { slow: 0.15, duration: 0.8 }));
        band.addEventListener("mouseleave", () => gsap.to(state[i], { slow: 1, duration: 0.8 }));
      });

      gsap.from(".marquee__band", {
        scaleX: 0,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.15,
        scrollTrigger: { trigger: root.current, start: "top 85%", toggleActions: "play none none reverse" },
      });

      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="marquee" aria-hidden>
      {rows.map((words, i) => (
        <div key={i} className={`marquee__band marquee__band--${i ? "b" : "a"}`}>
          <div className="marquee__track">
            {[...words, ...words, ...words, ...words].map((word, j) => (
              <span key={j} className="marquee__item">
                {word}
                <i>✦</i>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
