"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import LogoLab from "./LogoLab";

export const PRELOADER_DONE = "preloader:done";

/** Resolves once the page has loaded and the main thread has had a moment to breathe after hydration. */
const whenIdle = () =>
  new Promise<void>((resolve) => {
    const idle = () => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(() => requestAnimationFrame(() => resolve()), { timeout: 1200 });
      else setTimeout(resolve, 250);
    };
    const loaded = () => (document.fonts?.ready ?? Promise.resolve()).then(idle);
    if (document.readyState === "complete") loaded();
    else window.addEventListener("load", loaded, { once: true });
  });

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(root);
      const num = q(".preloader__num")[0] as HTMLElement;
      const counter = { v: 0 };
      const done = () => {
        (window as unknown as { __preloaderDone?: boolean }).__preloaderDone = true;
        window.dispatchEvent(new Event(PRELOADER_DONE));
      };

      getLenis()?.stop();
      document.documentElement.classList.add("is-loading");

      /** Counts to 100, then waits for a click so the logos can be watched before entering. */
      const play = contextSafe!(() => {
        const tl = gsap
          .timeline()
          .add(() => root.current!.classList.add("is-ready"))
          .to(counter, {
            v: 100,
            duration: 1.4,
            ease: "power2.inOut",
            onUpdate: () => {
              num.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          })
          .to(q(".preloader__bar i"), { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, "<")
          .add(() => root.current!.classList.add("is-waiting"))
          .addPause()
          .to(
            q(".lab__cell, .preloader__meta"),
            { yPercent: -120, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: "power3.in" },
            "+=0.15",
          )
          .to(
            q(".preloader__panel"),
            { yPercent: -100, duration: 1.1, stagger: { each: 0.06, from: "center" }, ease: "expo.inOut" },
            "-=0.2",
          )
          .add(() => {
            getLenis()?.start();
            document.documentElement.classList.remove("is-loading");
            done();
          }, "-=0.75")
          .set(root.current, { display: "none" });
        root.current!.addEventListener("click", () => tl.paused() && tl.play());
      });

      let alive = true;
      whenIdle().then(() => {
        if (alive) play();
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
        <LogoLab />
        <div className="preloader__meta">
          <span className="preloader__num">000</span>
          <span className="preloader__bar">
            <i />
          </span>
          <span>Загрузка опыта</span>
          <span className="preloader__hint">· Кликни, чтобы войти</span>
        </div>
      </div>
    </div>
  );
}
