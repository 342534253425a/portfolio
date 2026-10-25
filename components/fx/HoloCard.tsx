"use client";

import { useRef, useState } from "react";
import { finePointer, gsap, useGSAP } from "@/lib/gsap";
import { burstFrom } from "@/lib/fx";
import { SOCIALS } from "@/lib/contacts";
import { GithubIcon, TelegramIcon } from "../icons";

const ICONS = { GitHub: GithubIcon, Telegram: TelegramIcon };
const LINKS = SOCIALS.map((s) => ({ ...s, Icon: ICONS[s.label] }));

/** Holographic business card floating in 3D with orbiting satellites; flips to reveal the links. */
export default function HoloCard({ email }: { email: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  useGSAP(
    () => {
      const el = root.current!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.fromTo(
        ".holo__enter",
        { rotationY: -75, rotationX: 30, z: -600, y: 160, autoAlpha: 0 },
        {
          rotationY: 0,
          rotationX: 0,
          z: 0,
          y: 0,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "center 60%", scrub: 1 },
        },
      );

      if (!finePointer()) return;
      const tilt = el.querySelector<HTMLElement>(".holo__tilt")!;
      const card = el.querySelector<HTMLElement>(".holo__card")!;
      const ry = gsap.quickTo(tilt, "rotationY", { duration: 1, ease: "power3.out" });
      const rx = gsap.quickTo(tilt, "rotationX", { duration: 1, ease: "power3.out" });
      const section = el.closest("section")!;
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9));
        const py = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9));
        ry(px * 22);
        rx(-py * 18);
        card.style.setProperty("--mx", `${50 + px * 50}%`);
        card.style.setProperty("--my", `${50 + py * 50}%`);
      };
      const leave = () => {
        ry(0);
        rx(0);
      };
      section.addEventListener("pointermove", move);
      section.addEventListener("pointerleave", leave);
      return () => {
        section.removeEventListener("pointermove", move);
        section.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      gsap.to(".holo__card", { rotationY: flipped ? 180 : 0, duration: 1.3, ease: "expo.out" });
    },
    { dependencies: [flipped], scope: root },
  );

  const flip = () => {
    setFlipped((f) => !f);
    if (root.current) burstFrom(root.current.querySelector(".holo__card")!, 24);
  };

  return (
    <div ref={root} className={`holo${flipped ? " is-flipped" : ""}`}>
      <div className="holo__enter">
        <div className="holo__tilt">
          {[0, 1, 2].map((k) => (
            <span key={k} className={`holo__orbit holo__orbit--${k}`} aria-hidden>
              <span className="holo__sat">
                <i />
              </span>
            </span>
          ))}

          <div
            className="holo__card"
            role="button"
            tabIndex={0}
            aria-label={flipped ? "Перевернуть визитку обратно" : "Перевернуть визитку"}
            onClick={flip}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip())}
          >
            <div className="holo__face holo__front">
              <span className="holo__foil" />
              <span className="holo__shine" />
              <div className="holo__top">
                <span className="holo__logo">
                  A<b>/</b>
                </span>
                <span className="holo__status">
                  <i /> Открыт к предложениям
                </span>
              </div>
              <span className="holo__chip" aria-hidden />
              <div className="holo__mid">
                <p className="holo__role">Frontend разработчик</p>
                <p className="holo__stack">React · Next.js · TypeScript · GSAP · Supabase</p>
              </div>
              <div className="holo__bottom">
                <span>{email}</span>
                <span className="holo__hint">Нажмите ↻</span>
              </div>
            </div>

            <div className="holo__face holo__back">
              <span className="holo__foil" />
              <p className="holo__back-title">Где меня найти</p>
              <ul className="holo__links">
                {LINKS.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                      <Icon /> {label} <em>↗</em>
                    </a>
                  </li>
                ))}
                <li>
                  <a href={`mailto:${email}`} onClick={(e) => e.stopPropagation()}>
                    <b>@</b> {email} <em>↗</em>
                  </a>
                </li>
              </ul>
              <span className="holo__hint">↻ Назад</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
