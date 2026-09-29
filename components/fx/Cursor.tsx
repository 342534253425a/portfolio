"use client";

import { useRef } from "react";
import { finePointer, gsap, useGSAP } from "@/lib/gsap";

const INTERACTIVE = "a, button, [data-hover], .node, .step, .card";

export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!finePointer()) return;
      const q = gsap.utils.selector(root);
      const [dot, ring, glow] = ["dot", "ring", "glow"].map((n) => q(`.cursor__${n}`)[0] as HTMLElement);
      document.documentElement.classList.add("has-cursor");

      const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
      const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
      const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
      const ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });
      const gx = gsap.quickTo(glow, "x", { duration: 1, ease: "power3.out" });
      const gy = gsap.quickTo(glow, "y", { duration: 1, ease: "power3.out" });

      let last = { x: 0, y: 0, t: 0 };
      const move = (e: PointerEvent) => {
        dx(e.clientX);
        dy(e.clientY);
        rx(e.clientX);
        ry(e.clientY);
        gx(e.clientX);
        gy(e.clientY);
        root.current!.classList.add("is-visible");

        const now = performance.now();
        const dt = Math.max(16, now - last.t);
        const vx = (e.clientX - last.x) / dt;
        const vy = (e.clientY - last.y) / dt;
        const speed = Math.min(1.2, Math.hypot(vx, vy));
        gsap.to(ring.firstElementChild, {
          rotation: (Math.atan2(vy, vx) * 180) / Math.PI,
          scaleX: 1 + speed * 0.5,
          scaleY: 1 - speed * 0.3,
          duration: 0.3,
          overwrite: true,
        });
        last = { x: e.clientX, y: e.clientY, t: now };
      };

      const over = (e: PointerEvent) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>(INTERACTIVE);
        root.current!.classList.toggle("is-hover", !!el);
      };

      const down = () => root.current!.classList.add("is-down");
      const up = () => root.current!.classList.remove("is-down");
      const leave = () => root.current!.classList.remove("is-visible");

      window.addEventListener("pointermove", move);
      document.addEventListener("pointerover", over);
      window.addEventListener("pointerdown", down);
      window.addEventListener("pointerup", up);
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        document.documentElement.classList.remove("has-cursor");
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerover", over);
        window.removeEventListener("pointerdown", down);
        window.removeEventListener("pointerup", up);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="cursor" aria-hidden>
      <div className="cursor__glow" />
      <div className="cursor__ring">
        <span />
      </div>
      <div className="cursor__dot" />
    </div>
  );
}
