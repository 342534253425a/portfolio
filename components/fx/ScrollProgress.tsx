"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const R = 22;
const C = 2 * Math.PI * R;

export default function ScrollProgress() {
  const root = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const circle = root.current!.querySelector<SVGCircleElement>(".progress__bar")!;
      const num = root.current!.querySelector<HTMLElement>(".progress__num")!;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          circle.style.strokeDashoffset = String(C * (1 - self.progress));
          num.textContent = String(Math.round(self.progress * 100));
          root.current!.classList.toggle("is-visible", self.progress > 0.03);
          root.current!.classList.toggle("is-done", self.progress > 0.98);
        },
      });
    },
    { scope: root },
  );

  return (
    <a ref={root} href="#home" className="progress" aria-label="Наверх">
      <svg viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={R} className="progress__track" />
        <circle cx="25" cy="25" r={R} className="progress__bar" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <span className="progress__num">0</span>
      <span className="progress__arrow">↑</span>
    </a>
  );
}
