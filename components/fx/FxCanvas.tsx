"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";

type Star = { x: number; y: number; z: number; vx: number; vy: number; ox: number; oy: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; size: number; hue: number };

/**
 * One full-screen canvas for all ambient particle effects: a depth-layered star field that
 * reacts to the cursor, stretches into warp streaks with scroll velocity, and click sparks.
 */
export default function FxCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    const sparks: Spark[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let lastScroll = window.scrollY;
    let warp = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(160, (w * h) / (fine ? 11000 : 20000)));
      stars = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return { x, y, ox: x, oy: y, z: Math.random() * 0.9 + 0.1, vx: 0, vy: 0 };
      });
    };
    resize();

    const burst = (x: number, y: number, n = 26) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 7;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 1.5,
          life: 1,
          size: 1 + Math.random() * 2.2,
          hue: Math.random() < 0.8 ? 355 : 20,
        });
      }
    };

    const render = () => {
      const y = window.scrollY;
      const v = getLenis()?.velocity ?? y - lastScroll;
      lastScroll = y;
      warp += (gsap.utils.clamp(-40, 40, v) - warp) * 0.06;

      ctx.clearRect(0, 0, w, h);

      const near: Star[] = [];
      for (const s of stars) {
        s.oy -= warp * s.z * 0.6;
        if (s.oy < -20 || s.oy > h + 20) {
          s.oy += s.oy < -20 ? h + 40 : -(h + 40);
          s.y = s.oy;
          s.vy = 0;
        }

        if (mouse.active) {
          const dx = s.x - mouse.x;
          const dy = s.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150) {
            const f = (1 - Math.sqrt(d2) / 150) * 2.2 * s.z;
            s.vx += (dx / (Math.sqrt(d2) + 0.01)) * f;
            s.vy += (dy / (Math.sqrt(d2) + 0.01)) * f;
            if (d2 < 190 * 190) near.push(s);
          } else if (d2 < 190 * 190) near.push(s);
        }
        s.vx += (s.ox - s.x) * 0.02;
        s.vy += (s.oy - s.y) * 0.02;
        s.vx *= 0.86;
        s.vy *= 0.86;
        s.x += s.vx;
        s.y += s.vy;

        const size = s.z * 1.6;
        const alpha = 0.25 + s.z * 0.55;
        const stretch = Math.abs(warp) * s.z * 1.4;
        ctx.fillStyle = s.z > 0.75 ? `rgba(255,90,100,${alpha})` : `rgba(255,255,255,${alpha * 0.7})`;
        if (stretch > 1.5) {
          ctx.fillRect(s.x - size / 2, s.y - (warp > 0 ? 0 : stretch), size, stretch + size);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (near.length) {
        ctx.lineWidth = 0.6;
        for (const s of near) {
          const d = Math.hypot(s.x - mouse.x, s.y - mouse.y);
          ctx.strokeStyle = `rgba(255,60,75,${(1 - d / 190) * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.vx *= 0.94;
        p.vy = p.vy * 0.94 + 0.18;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.022;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `hsla(${p.hue},100%,${60 + p.life * 30}%,${p.life})`;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
        ctx.stroke();
      }
    };

    if (!reduced) gsap.ticker.add(render);
    else render();

    const move = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = e.pointerType === "mouse";
    };
    const leave = () => (mouse.active = false);
    const click = (e: PointerEvent) => !reduced && burst(e.clientX, e.clientY);
    const onBurst = (e: Event) => {
      const { x, y, n } = (e as CustomEvent<{ x: number; y: number; n?: number }>).detail;
      if (!reduced) burst(x, y, n);
    };
    const onWarp = (e: Event) => {
      warp += (e as CustomEvent<number>).detail;
    };
    window.addEventListener("fx:burst", onBurst);
    window.addEventListener("fx:warp", onWarp);
    const visibility = () => (document.hidden ? gsap.ticker.remove(render) : !reduced && gsap.ticker.add(render));

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", click);
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("fx:burst", onBurst);
      window.removeEventListener("fx:warp", onWarp);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
    };
  });

  return <canvas ref={ref} className="fx-canvas" aria-hidden />;
}
