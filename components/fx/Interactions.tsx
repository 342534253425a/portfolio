"use client";

import { finePointer, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";

const MAGNETIC = "[data-magnetic], .nav a, .logo, .burger, .arrow, .social";
const SCRAMBLE_HOVER = ".nav a > span, .footer a > span, .menu__nav a > span, .lnk > .lnk__text";
const SCRAMBLE_CHARS = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ01/<>_";

/**
 * Page-wide pointer & scroll interactions, wired by selectors so sections stay declarative:
 *  magnetic pull, text scramble, tilt + glare ([data-tilt]) and scroll-velocity skew ([data-skew], h2).
 */
export default function Interactions() {
  useGSAP(() => {
    const cleanups: (() => void)[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    /* ---- Scramble labels once when they enter the viewport ---- */
    gsap.utils.toArray<HTMLElement>("[data-scramble] span, .label span").forEach((el) => {
      const text = el.textContent || "";
      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: () =>
          gsap.to(el, { duration: 1.2, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.6, revealDelay: 0.2 } }),
      });
    });

    /* ---- Scroll velocity skew ---- */
    const skewTargets = gsap.utils.toArray<HTMLElement>(".h2, [data-skew]");
    if (skewTargets.length) {
      const setSkew = gsap.quickTo(skewTargets, "skewY", { duration: 0.6, ease: "power3.out" });
      const tick = () => {
        const v = getLenis()?.velocity ?? 0;
        setSkew(gsap.utils.clamp(-5, 5, v * 0.18));
      };
      gsap.ticker.add(tick);
      cleanups.push(() => gsap.ticker.remove(tick));
    }

    if (!finePointer()) return () => cleanups.forEach((c) => c());

    /* ---- Magnetic elements ---- */
    gsap.utils.toArray<HTMLElement>(MAGNETIC).forEach((el) => {
      el.classList.add("is-magnetic");
      const strength = parseFloat(el.dataset.magnetic || "") || 0.35;
      const inner = el.querySelector<HTMLElement>(".btn__label, svg");
      const x = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const y = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const ix = inner && gsap.quickTo(inner, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const iy = inner && gsap.quickTo(inner, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        x(dx * strength);
        y(dy * strength);
        ix?.(dx * strength * 0.5);
        iy?.(dy * strength * 0.5);
      };
      const leave = () => {
        x(0);
        y(0);
        ix?.(0);
        iy?.(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      });
    });

    /* ---- Hover scramble ---- */
    gsap.utils.toArray<HTMLElement>(SCRAMBLE_HOVER).forEach((span) => {
      const el = span.parentElement!;
      const text = span.textContent || "";
      const enter = () =>
        gsap.to(span, { duration: 0.6, overwrite: true, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 1 } });
      el.addEventListener("mouseenter", enter);
      cleanups.push(() => el.removeEventListener("mouseenter", enter));
    });

    /* ---- Tilt + glare ---- */
    gsap.utils.toArray<HTMLElement>("[data-tilt]").forEach((el) => {
      const max = parseFloat(el.dataset.tilt || "") || 10;
      const glare = document.createElement("span");
      glare.className = "glare";
      el.appendChild(glare);
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3.out" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3.out" });
      gsap.set(el, { transformPerspective: 900 });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        rx((0.5 - py) * max);
        ry((px - 0.5) * max);
        glare.style.setProperty("--gx", `${px * 100}%`);
        glare.style.setProperty("--gy", `${py * 100}%`);
        glare.style.opacity = "1";
      };
      const leave = () => {
        rx(0);
        ry(0);
        glare.style.opacity = "0";
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        glare.remove();
      });
    });

    return () => cleanups.forEach((c) => c());
  });

  return null;
}
