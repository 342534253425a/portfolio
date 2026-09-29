"use client";

import { gsap } from "@/lib/gsap";

const NAME = "Alexsey";
const TAIL = NAME.slice(1);
const GLYPHS = "01<>/{}[]#$%&*+=?ΛΣΞ";

export const LOGO_VARIANTS = ["type", "pen", "code", "blade"] as const;
export type LogoVariant = (typeof LOGO_VARIANTS)[number];

const chars = (s: string) => [...s].map((c, k) => <i key={k}>{c}</i>);

/** Markup shared by every logo variant; at rest it reads "A/". Place inside an element with the `lm` class. */
export function LogoGlyphs() {
  return (
    <>
      A<span className="lm__text" />
      <span className="lm__blade">{chars(TAIL)}</span>
      <span className="lm__slash">/</span>
      <span className="lm__pen">{chars(TAIL.slice(1))}</span>
    </>
  );
}

/** One A/ → Alexsey → A/ cycle; `el` is the `.lm` element, `data-pen-tilt` sets how far the slash turns into an "l". */
export function logoTimeline(el: HTMLElement, variant: LogoVariant, hold = 1.6) {
  const text = el.querySelector<HTMLElement>(".lm__text")!;
  const slash = el.querySelector<HTMLElement>(".lm__slash")!;
  const tl = gsap.timeline();

  if (variant === "type") {
    tl.call(() => el.classList.add("is-caret")).to({}, { duration: 0.5 });
    [...TAIL].forEach((_, k) => tl.call(() => void (text.textContent = TAIL.slice(0, k + 1)), [], `+=${0.07 + ((k * 37) % 5) * 0.03}`));
    tl.to({}, { duration: hold });
    [...TAIL].forEach((_, k) => tl.call(() => void (text.textContent = TAIL.slice(0, TAIL.length - k - 1)), [], "+=0.05"));
    tl.to({}, { duration: 0.4 }).call(() => el.classList.remove("is-caret"));
  }

  if (variant === "pen") {
    const pen = el.querySelector<HTMLElement>(".lm__pen")!;
    const ch = pen.children;
    const tilt = Number(el.dataset.penTilt ?? -21);
    tl.set(ch, { yPercent: 110, rotation: 8 })
      .to(slash, { rotation: tilt, duration: 0.8, ease: "expo.inOut" })
      .to(pen, { width: () => pen.scrollWidth, duration: 1, ease: "expo.inOut" }, 0.35)
      .to(ch, { yPercent: 0, rotation: 0, duration: 0.9, stagger: 0.05, ease: "expo.out" }, 0.5)
      .to(ch, { yPercent: -110, rotation: -8, duration: 0.6, stagger: { each: 0.04, from: "end" }, ease: "expo.in" }, `+=${hold}`)
      .to(pen, { width: 0, duration: 0.8, ease: "expo.inOut" }, "<0.35")
      .to(slash, { rotation: 0, duration: 0.8, ease: "expo.inOut" }, "<0.3");
  }

  if (variant === "code") {
    const st = { p: 0 };
    const update = () => {
      const len = Math.round(TAIL.length * Math.min(1, st.p * 1.6));
      const solved = Math.floor(TAIL.length * Math.max(0, (st.p - 0.35) / 0.65));
      let s = "";
      for (let k = 0; k < len; k++) s += k < solved ? TAIL[k] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      text.textContent = s;
      text.classList.toggle("is-noisy", solved < len);
      slash.style.opacity = String(Math.max(0, 1 - st.p * 3));
    };
    tl.to(st, { p: 1, duration: 1.4, ease: "none", onUpdate: update }).to(
      st,
      { p: 0, duration: 1, ease: "none", onUpdate: update },
      `+=${hold}`,
    );
  }

  if (variant === "blade") {
    const blade = el.querySelector<HTMLElement>(".lm__blade")!;
    tl.to(slash, { skewX: -18, scaleY: 1.18, duration: 0.25, ease: "power2.in" })
      .to(blade, { width: () => blade.scrollWidth, duration: 1.1, ease: "power4.inOut" }, 0.15)
      .fromTo(
        blade.children,
        { color: "#ff2b3d", textShadow: "0 0 0.25em rgba(255,43,61,0.9)" },
        { color: () => getComputedStyle(el).color, textShadow: "0 0 0 rgba(255,43,61,0)", duration: 0.7, stagger: 0.1, ease: "power2.out" },
        0.25,
      )
      .to(slash, { skewX: 0, scaleY: 1, duration: 0.5, ease: "back.out(3)" }, 1.2)
      .to(slash, { skewX: 18, scaleY: 1.18, duration: 0.25, ease: "power2.in" }, `+=${hold}`)
      .to(blade, { width: 0, duration: 0.9, ease: "power4.inOut" }, "<0.1")
      .to(slash, { skewX: 0, scaleY: 1, duration: 0.5, ease: "back.out(3)" }, ">-0.1");
  }

  return tl;
}
