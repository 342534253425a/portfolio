"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    const x = gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      el.style.opacity = "1";
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  });

  return <div ref={ref} className="cursor-glow" aria-hidden />;
}
