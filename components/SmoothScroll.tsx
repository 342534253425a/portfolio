"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

export default function SmoothScroll() {
  const wipe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      lerp: reduced ? 1 : 0.075,
      wheelMultiplier: 0.9,
      smoothWheel: !reduced,
      autoRaf: false,
    });
    setLenis(lenis);
    if (document.documentElement.classList.contains("is-loading")) lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const panel = wipe.current!;
    const num = panel.querySelector<HTMLElement>(".wipe__num")!;
    const name = panel.querySelector<HTMLElement>(".wipe__name")!;
    let tl: gsap.core.Timeline | null = null;

    /** Anchor jumps: a neon-edged panel covers the screen, the page jumps underneath, then the panel slides on. */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href")!;
      const target = hash === "#" || hash === "#home" ? 0 : document.querySelector<HTMLElement>(hash);
      if (target === null) return;
      e.preventDefault();
      history.replaceState(null, "", hash);
      if (tl?.isActive()) return;

      const offset = typeof target === "number" ? 0 : -20;
      const jump = () => {
        lenis.start();
        lenis.scrollTo(target, { offset, immediate: true, force: true });
        ScrollTrigger.update();
      };
      const top = typeof target === "number" ? -lenis.scroll : target.getBoundingClientRect().top + offset;
      if (reduced || Math.abs(top) < 4) return jump();

      const dir = top > 0 ? 1 : -1;
      const navLinks = [...document.querySelectorAll<HTMLAnchorElement>(".nav a")];
      const i = navLinks.findIndex((a) => a.getAttribute("href") === hash);
      num.textContent = i < 0 ? "" : `${String(i + 1).padStart(2, "0")} /`;
      name.textContent = i < 0 ? link.textContent?.trim() || "" : navLinks[i].dataset.label || "";

      lenis.stop();
      tl = gsap
        .timeline()
        .set(panel, { visibility: "visible", yPercent: 104 * dir })
        .to(panel, { yPercent: 0, duration: 0.75, ease: "expo.inOut" })
        .fromTo(
          panel.querySelectorAll(".wipe__mark, .wipe__meta"),
          { y: 40 * dir, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: "expo.out" },
          0.35,
        )
        .add(jump, 0.75)
        .to(panel.querySelectorAll(".wipe__mark, .wipe__meta"), { y: -40 * dir, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "+=0.3")
        .to(panel, { yPercent: -104 * dir, duration: 0.85, ease: "expo.inOut" }, "<0.1")
        .set(panel, { visibility: "hidden" });
    };
    document.addEventListener("click", onClick);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener("click", onClick);
      tl?.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <div ref={wipe} className="wipe" aria-hidden>
      <div className="wipe__mark">
        A<b>/</b>
      </div>
      <div className="wipe__meta">
        <span className="wipe__num" />
        <span className="wipe__name" />
      </div>
    </div>
  );
}
