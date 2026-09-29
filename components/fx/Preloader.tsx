"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";

export const PRELOADER_DONE = "preloader:done";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const num = q(".preloader__num")[0] as HTMLElement;
      const counter = { v: 0 };
      const done = () => {
        (window as unknown as { __preloaderDone?: boolean }).__preloaderDone = true;
        window.dispatchEvent(new Event(PRELOADER_DONE));
      };

      getLenis()?.stop();
      document.documentElement.classList.add("is-loading");

      const fonts = document.fonts?.ready ?? Promise.resolve();
      const tl = gsap.timeline({ paused: true });

      tl.from(q(".preloader__logo span"), { yPercent: 120, duration: 0.9, stagger: 0.08, ease: "expo.out" })
        .to(counter, {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            num.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        }, 0.1)
        .to(q(".preloader__bar i"), { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0.1)
        .to(q(".preloader__logo span, .preloader__meta"), { yPercent: -120, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: "power3.in" }, "+=0.1")
        .to(q(".preloader__panel"), {
          yPercent: -100,
          duration: 1.1,
          stagger: { each: 0.06, from: "center" },
          ease: "expo.inOut",
        }, "-=0.2")
        .add(() => {
          getLenis()?.start();
          document.documentElement.classList.remove("is-loading");
          done();
        }, "-=0.75")
        .set(root.current, { display: "none" });

      let alive = true;
      fonts.then(() => {
        if (alive) tl.play();
      });
      return () => {
        alive = false;
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="preloader" aria-hidden>
      <div className="preloader__panels">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="preloader__panel" />
        ))}
      </div>
      <div className="preloader__center">
        <div className="preloader__logo">
          <span>A</span>
          <span className="accent">/</span>
        </div>
        <div className="preloader__meta">
          <span className="preloader__num">000</span>
          <span className="preloader__bar">
            <i />
          </span>
          <span>Загрузка опыта</span>
        </div>
      </div>
    </div>
  );
}
