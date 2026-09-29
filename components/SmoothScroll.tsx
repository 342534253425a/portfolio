"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

export default function SmoothScroll() {
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

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href")!;
      const target = hash === "#" || hash === "#home" ? 0 : document.querySelector<HTMLElement>(hash);
      if (target === null) return;
      e.preventDefault();
      lenis.start();
      lenis.scrollTo(target, {
        offset: typeof target === "number" ? 0 : -20,
        duration: 1.8,
        easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      });
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
