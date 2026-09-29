"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const offsetWithin = (el: HTMLElement, root: HTMLElement) => {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
};

/** Glowing path through every [data-anchor] on the page, drawn in sync with the scroll position. */
export default function SignalLine() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const svg = svgRef.current!;
    const main = svg.parentElement as HTMLElement;
    const [track, glow, core] = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    const head = svg.querySelector<SVGGElement>(".signal__head")!;

    const state = { len: 0 };
    let total = 0;
    let maxYs = new Float32Array(0);
    let anchors: { el: HTMLElement; len: number }[] = [];

    const lenForY = (y: number) => {
      const n = maxYs.length - 1;
      if (n < 1) return 0;
      let lo = 0;
      let hi = n;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (maxYs[mid] < y) lo = mid + 1;
        else hi = mid;
      }
      return (total * lo) / n;
    };

    const render = () => {
      const len = Math.min(state.len, total);
      const offset = String(total - len);
      glow.style.strokeDashoffset = offset;
      core.style.strokeDashoffset = offset;
      if (total > 0) {
        const p = core.getPointAtLength(len);
        head.setAttribute("transform", `translate(${p.x} ${p.y})`);
      }
      head.style.opacity = len > 4 ? "1" : "0";
      anchors.forEach((a) => a.el.classList.toggle("is-lit", len >= a.len - 6));
    };

    const setLen = gsap.quickTo(state, "len", { duration: 1.1, ease: "power3.out", onUpdate: render });

    const target = () => {
      const max = ScrollTrigger.maxScroll(window) || 1;
      const y = window.scrollY;
      const p = Math.min(1, y / max);
      const top = main.getBoundingClientRect().top + y;
      return lenForY(y - top + window.innerHeight * (0.62 + 0.38 * Math.pow(p, 6)));
    };

    const build = () => {
      const w = main.offsetWidth;
      const h = main.offsetHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.style.width = `${w}px`;
      svg.style.height = `${h}px`;

      const els = Array.from(main.querySelectorAll<HTMLElement>("[data-anchor]"))
        .filter((el) => el.offsetParent !== null)
        .sort((a, b) => Number(a.dataset.anchor) - Number(b.dataset.anchor));
      const pts = els.map((el) => {
        const o = offsetWithin(el, main);
        return { x: o.x + el.offsetWidth / 2, y: o.y + el.offsetHeight / 2 };
      });
      if (pts.length < 2) return;

      let d = `M${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const dy = (b.y - a.y) * 0.55;
        d += ` C${a.x},${a.y + dy} ${b.x},${b.y - dy} ${b.x},${b.y}`;
      }
      [track, glow, core].forEach((p) => p.setAttribute("d", d));

      total = core.getTotalLength();
      const n = Math.max(200, Math.round(total / 5));
      maxYs = new Float32Array(n + 1);
      let maxY = -Infinity;
      for (let i = 0; i <= n; i++) {
        maxY = Math.max(maxY, core.getPointAtLength((total * i) / n).y);
        maxYs[i] = maxY;
      }
      anchors = els.map((el, i) => ({ el, len: lenForY(pts[i].y) }));

      [glow, core].forEach((p) => (p.style.strokeDasharray = `${total} ${total}`));
      state.len = Math.min(state.len, total);
      setLen(target());
      render();
    };

    build();
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: () => setLen(target()) });
    ScrollTrigger.addEventListener("refresh", build);

    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    });
    ro.observe(main);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      ScrollTrigger.removeEventListener("refresh", build);
    };
  });

  return (
    <svg ref={svgRef} className="signal" aria-hidden>
      <defs>
        <radialGradient id="signal-head">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.25" stopColor="#ff4a5a" />
          <stop offset="1" stopColor="#ff2b3d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path className="signal__track" />
      <path className="signal__glow" />
      <path className="signal__core" />
      <g className="signal__head">
        <circle r="22" fill="url(#signal-head)" opacity="0.55" />
        <circle r="3.5" fill="#fff" />
      </g>
    </svg>
  );
}
