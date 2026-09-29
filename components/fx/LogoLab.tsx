"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { LOGO_VARIANTS, LogoGlyphs, logoTimeline } from "./LogoMark";

/** Preloader logo: all four takes on A/ → Alexsey → A/, looping side by side. */
export default function LogoLab() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>(".lm", root.current).forEach((el, i) => {
        logoTimeline(el, LOGO_VARIANTS[i])
          .repeat(-1)
          .repeatDelay(0.6)
          .delay(0.4 + i * 0.2);
      });
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
