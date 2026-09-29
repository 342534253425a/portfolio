"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { LOGO_VARIANTS, LogoGlyphs, logoTimeline } from "./LogoMark";

/** Preloader logo: all four takes on A/ → Alexsey → A/, looping side by side. */
export default function LogoLab() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let alive = true;
      const start = contextSafe!(() => {
        gsap.utils.toArray<HTMLElement>(".lm", root.current).forEach((el, i) => {
          logoTimeline(el, LOGO_VARIANTS[i])
            .repeat(-1)
            .repeatDelay(0.6)
            .delay(0.2 + i * 0.2);
        });
      });
      whenIdle().then(() => alive && start());
      return () => {
        alive = false;
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="lab">
      {LOGO_VARIANTS.map((v) => (
        <div key={v} className="lab__cell">
          <span className="lm lab__logo">
            <LogoGlyphs />
          </span>
        </div>
      ))}
    </div>
  );
}
