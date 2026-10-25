"use client";

import { useRef } from "react";
import { finePointer, gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/** Planet rises into view on scroll, then follows the cursor with a slow, heavy parallax. */
export function PlanetParallax() {
  useGSAP(() => {
    const planet = document.querySelector<HTMLElement>(".contact__planet");
    if (!planet || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ".contact__rise",
      { yPercent: 38, scale: 1.25, rotation: -6 },
      {
        yPercent: 0,
        scale: 1,
        rotation: 0,
        ease: "none",
        scrollTrigger: { trigger: "#contacts", start: "top bottom", end: "top 10%", scrub: 1 },
      },
    );
    if (!finePointer()) return;
    const x = gsap.quickTo(planet, "x", { duration: 2, ease: "power3.out" });
    const y = gsap.quickTo(planet, "y", { duration: 2, ease: "power3.out" });
    const r = gsap.quickTo(planet, "rotation", { duration: 2.4, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      x(px * -28);
      y(py * -18);
      r(px * 3);
    };
    ScrollTrigger.create({
      trigger: "#contacts",
      start: "top bottom",
      onToggle: (self) => (self.isActive ? window.addEventListener("pointermove", move) : window.removeEventListener("pointermove", move)),
    });
    return () => window.removeEventListener("pointermove", move);
  });
  return null;
}

/** Giant closing call-to-action: letters rise out of the floor in 3D as the page reaches its end. */
export function Finale({ email }: { email: string }) {
  const root = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const split = SplitText.create(el.querySelector(".finale__word"), { type: "chars", charsClass: "finale__char" });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => split.revert();
      gsap.fromTo(
        split.chars,
        { rotationX: -95, yPercent: 60, z: -260, autoAlpha: 0 },
        {
          rotationX: 0,
          yPercent: 0,
          z: 0,
          autoAlpha: 1,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 1 },
        },
      );
      const wave = () =>
        gsap.to(split.chars, {
          y: -30,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.045,
          yoyo: true,
          repeat: 1,
          overwrite: "auto",
        });
      el.addEventListener("mouseenter", wave);
      return () => {
        el.removeEventListener("mouseenter", wave);
        split.revert();
      };
    },
    { scope: root },
  );

  return (
    <a ref={root} href={`mailto:${email}`} className="finale">
      <span className="finale__kicker">Готовы к запуску?</span>
      <span className="finale__word">Поехали!</span>
    </a>
  );
}

export function ReplyNote() {
  return (
    <p className="clock">
      <span className="clock__dot" />
      Обычно отвечаю в течение дня
    </p>
  );
}
