"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const NAME = "Alexsey";
const TAIL = NAME.slice(1);
const GLYPHS = "01<>/{}[]#$%&*+=?ΛΣΞ";
const HOLD = 1.6;

/** Test bench: four takes on the A/ → Alexsey → A/ logo, looping side by side. */
export default function LogoLab() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const typed = q(".lab--type .lab__typed")[0] as HTMLElement;
      const type = gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: 0.4 });
      type.to({}, { duration: 0.9 });
      [...TAIL].forEach((_, k) =>
        type.call(() => void (typed.textContent = TAIL.slice(0, k + 1)), [], `+=${0.07 + ((k * 37) % 5) * 0.03}`),
      );
      type.to({}, { duration: HOLD });
      [...TAIL].forEach((_, k) => type.call(() => void (typed.textContent = TAIL.slice(0, TAIL.length - k - 1)), [], "+=0.05"));

      const pen = q(".lab--pen")[0] as HTMLElement;
      const penWrap = pen.querySelector<HTMLElement>(".lab__wrap")!;
      const penChars = pen.querySelectorAll(".lab__wrap i");
      const penSlash = pen.querySelector<HTMLElement>(".lab__slash")!;
      gsap.set(penChars, { yPercent: 110, rotation: 8 });
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.6, delay: 0.6, defaults: { ease: "expo.inOut" } })
        .to(penSlash, { rotation: -21, scaleY: 1.04, duration: 0.8 }, 0.9)
        .to(penWrap, { width: () => penWrap.scrollWidth, duration: 1 }, 1.25)
        .to(penChars, { yPercent: 0, rotation: 0, duration: 0.9, stagger: 0.05, ease: "expo.out" }, 1.4)
        .to(penChars, { yPercent: -110, rotation: -8, duration: 0.6, stagger: { each: 0.04, from: "end" }, ease: "expo.in" }, `+=${HOLD}`)
        .to(penWrap, { width: 0, duration: 0.8 }, "<0.35")
        .to(penSlash, { rotation: 0, scaleY: 1, duration: 0.8 }, "<0.3")
        .set(penChars, { yPercent: 110, rotation: 8 });

      const code = q(".lab--code .lab__code")[0] as HTMLElement;
      const codeSlash = q(".lab--code .lab__slash")[0] as HTMLElement;
      const scramble = (p: number) => {
        const len = Math.round(TAIL.length * Math.min(1, p * 1.6));
        const solved = Math.floor(TAIL.length * Math.max(0, (p - 0.35) / 0.65));
        let s = "";
        for (let k = 0; k < len; k++) s += k < solved ? TAIL[k] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        code.textContent = s;
        code.classList.toggle("is-noisy", solved < len);
        codeSlash.style.opacity = String(Math.max(0, 1 - p * 3));
      };
      const codeState = { p: 0 };
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.6, delay: 0.8 })
        .to(codeState, { p: 1, duration: 1.4, ease: "none", onUpdate: () => scramble(codeState.p) }, 0.9)
        .to(codeState, { p: 0, duration: 1, ease: "none", onUpdate: () => scramble(codeState.p) }, `+=${HOLD}`);

      const blade = q(".lab--blade")[0] as HTMLElement;
      const bladeWrap = blade.querySelector<HTMLElement>(".lab__wrap")!;
      const bladeSlash = blade.querySelector<HTMLElement>(".lab__slash")!;
      const bladeChars = blade.querySelectorAll(".lab__wrap i");
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.6, delay: 1, defaults: { ease: "power4.inOut" } })
        .to(bladeSlash, { skewX: -18, scaleY: 1.18, duration: 0.25, ease: "power2.in" }, 0.9)
        .to(bladeWrap, { width: () => bladeWrap.scrollWidth, duration: 1.1 }, 1.05)
        .fromTo(
          bladeChars,
          { color: "#ff2b3d", textShadow: "0 0 2rem rgba(255,43,61,0.9)" },
          { color: "#ffffff", textShadow: "0 0 0 rgba(255,43,61,0)", duration: 0.7, stagger: 0.1, ease: "power2.out" },
          1.15,
        )
        .to(bladeSlash, { skewX: 0, scaleY: 1, duration: 0.5, ease: "back.out(3)" }, 2.1)
        .to(bladeSlash, { skewX: 18, scaleY: 1.18, duration: 0.25, ease: "power2.in" }, `+=${HOLD}`)
        .to(bladeWrap, { width: 0, duration: 0.9 }, "<0.1")
        .to(bladeSlash, { skewX: 0, scaleY: 1, duration: 0.5, ease: "back.out(3)" }, ">-0.1");
    },
    { scope: root },
  );

  const chars = (s: string) => [...s].map((c, k) => <i key={k}>{c}</i>);

  return (
    <div ref={root} className="lab">
      <figure className="lab__cell lab--type">
        <div className="lab__logo">
          A<span className="lab__typed" />
          <span className="lab__slash lab__caret">/</span>
        </div>
        <figcaption>01 · Набор кода</figcaption>
      </figure>

      <figure className="lab__cell lab--pen">
        <div className="lab__logo">
          A<span className="lab__slash">/</span>
          <span className="lab__wrap">{chars(TAIL.slice(1))}</span>
        </div>
        <figcaption>02 · Перо: / становится l</figcaption>
      </figure>

      <figure className="lab__cell lab--code">
        <div className="lab__logo">
          A<span className="lab__code" />
          <span className="lab__slash">/</span>
        </div>
        <figcaption>03 · AI-декодер</figcaption>
      </figure>

      <figure className="lab__cell lab--blade">
        <div className="lab__logo">
          A<span className="lab__wrap">{chars(TAIL)}</span>
          <span className="lab__slash">/</span>
        </div>
        <figcaption>04 · Клинок</figcaption>
      </figure>
    </div>
  );
}
