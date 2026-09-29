"use client";

import { Draggable, finePointer, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const CX = 0.517;
const CY = 0.46;
const K = 170 / 300;

/** Turns the static stack diagram into a draggable pseudo-3D orbit. */
export default function OrbitFX() {
  useGSAP(() => {
    const orbit = document.querySelector<HTMLElement>(".orbit");
    if (!orbit || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(orbit.querySelectorAll<HTMLElement>(".node-pos"));
    const links = orbit.querySelector<SVGSVGElement>(".orbit__links")!;
    const lines = nodes.map(() => {
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      links.appendChild(l);
      return l;
    });

    let W = orbit.offsetWidth;
    let H = orbit.offsetHeight;
    const polar = nodes.map((n) => {
      const x = parseFloat(n.dataset.x!) / 100;
      const y = parseFloat(n.dataset.y!) / 100;
      const dx = (x - CX) * W;
      const dy = (y - CY) * H;
      return { theta: Math.atan2(dy / K, dx), rho: Math.hypot(dx, dy / K) / W };
    });
    nodes.forEach((n) => {
      n.style.left = `${CX * 100}%`;
      n.style.top = `${CY * 100}%`;
    });
    const setX = nodes.map((n) => gsap.quickSetter(n, "x", "px"));
    const setY = nodes.map((n) => gsap.quickSetter(n, "y", "px"));
    const setS = nodes.map((n) => gsap.quickSetter(n, "scale"));

    const state = { auto: 0, speed: 1, drag: 0, hovered: -1 };

    const render = () => {
      state.auto += 0.0022 * state.speed;
      const phi = state.auto + state.drag;
      const cx = CX * W;
      const cy = CY * H;
      nodes.forEach((n, i) => {
        const p = polar[i];
        const a = p.theta + phi;
        const x = Math.cos(a) * p.rho * W;
        const y = Math.sin(a) * p.rho * W * K;
        const depth = (Math.sin(a) + 1) / 2;
        setX[i](x);
        setY[i](y);
        setS[i](0.72 + depth * 0.38);
        n.style.opacity = String(0.45 + depth * 0.55);
        n.style.zIndex = String(depth > 0.45 ? 20 + Math.round(depth * 10) : 1 + Math.round(depth * 10));
        const l = lines[i];
        l.setAttribute("x1", String(cx));
        l.setAttribute("y1", String(cy));
        l.setAttribute("x2", String(cx + x));
        l.setAttribute("y2", String(cy + y));
        l.style.opacity = String(state.hovered === i ? 1 : 0.12 + depth * 0.2);
      });
    };

    const resize = () => {
      W = orbit.offsetWidth;
      H = orbit.offsetHeight;
      links.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };
    resize();
    render();

    const st = ScrollTrigger.create({
      trigger: orbit,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? gsap.ticker.add(render) : gsap.ticker.remove(render)),
    });

    nodes.forEach((n, i) => {
      n.addEventListener("mouseenter", () => {
        state.hovered = i;
        lines[i].classList.add("is-hot");
        gsap.to(state, { speed: 0, duration: 0.6 });
      });
      n.addEventListener("mouseleave", () => {
        state.hovered = -1;
        lines[i].classList.remove("is-hot");
        gsap.to(state, { speed: 1, duration: 1.2 });
      });
    });

    const cleanups: (() => void)[] = [];
    window.addEventListener("resize", resize);
    cleanups.push(() => window.removeEventListener("resize", resize));

    if (finePointer()) {
      const proxy = document.createElement("div");
      proxy.className = "orbit__proxy";
      orbit.appendChild(proxy);
      const [drag] = Draggable.create(proxy, {
        type: "rotation",
        trigger: orbit,
        inertia: true,
        onPress: () => orbit.classList.add("is-dragging"),
        onRelease: () => orbit.classList.remove("is-dragging"),
        onDrag() {
          state.drag = (this.rotation * Math.PI) / 180;
        },
        onThrowUpdate() {
          state.drag = (this.rotation * Math.PI) / 180;
        },
      });
      cleanups.push(() => {
        drag.kill();
        proxy.remove();
      });
    }

    return () => {
      st.kill();
      gsap.ticker.remove(render);
      lines.forEach((l) => l.remove());
      cleanups.forEach((c) => c());
    };
  });

  return null;
}
