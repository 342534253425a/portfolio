"use client";

import Image from "next/image";
import { useRef } from "react";
import { finePointer, gsap, SplitText, useGSAP } from "@/lib/gsap";
import { PRELOADER_DONE } from "./fx/Preloader";
import { ArrowRight } from "./icons";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(root);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const header = document.querySelector("[data-intro-header]");
      const title = q(".hero__title")[0] as HTMLElement;

      const enableProximity = contextSafe!(() => {
        if (!finePointer()) return;
        const split = SplitText.create(title, { type: "words,chars", charsClass: "hero__char" });
        const chars = split.chars as HTMLElement[];
        const setters = chars.map((c) => ({
          y: gsap.quickTo(c, "y", { duration: 0.5, ease: "power3.out" }),
          r: gsap.quickTo(c, "rotation", { duration: 0.5, ease: "power3.out" }),
          sx: gsap.quickTo(c, "scaleX", { duration: 0.5, ease: "power3.out" }),
          sy: gsap.quickTo(c, "scaleY", { duration: 0.5, ease: "power3.out" }),
        }));
        const scale = (i: number, v: number) => (setters[i].sx(v), setters[i].sy(v));
        let rects: DOMRect[] = [];
        const measure = () => (rects = chars.map((c) => c.getBoundingClientRect()));
        const move = (e: PointerEvent) => {
          if (!rects.length) measure();
          chars.forEach((c, i) => {
            const r = rects[i];
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const f = Math.max(0, 1 - Math.hypot(dx, dy) / 160);
            setters[i].y(-f * 18);
            setters[i].r(f * (dx > 0 ? -8 : 8));
            scale(i, 1 + f * 0.18);
            c.classList.toggle("is-hot", f > 0.35);
          });
        };
        const leave = () => {
          setters.forEach((s, i) => (s.y(0), s.r(0), scale(i, 1)));
          chars.forEach((c) => c.classList.remove("is-hot"));
        };
        const reset = () => (rects = []);
        title.addEventListener("pointermove", move);
        title.addEventListener("pointerleave", leave);
        window.addEventListener("scroll", reset, { passive: true });
        window.addEventListener("resize", reset);
        return () => {
          title.removeEventListener("pointermove", move);
          title.removeEventListener("pointerleave", leave);
          window.removeEventListener("scroll", reset);
          window.removeEventListener("resize", reset);
          split.revert();
        };
      });

      const intro = contextSafe!(() => {
        gsap.set([q("[data-intro]"), header], { visibility: "visible" });
        if (reduced) return;

        const split = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-line" });
        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          onComplete: () => {
            split.revert();
            enableProximity();
          },
        });
        tl.fromTo(
          q(".hero__media-inner"),
          { scale: 1.25, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 2.4,
            ease: "power3.out",
            clearProps: "transform",
            onComplete: () => gsap.set(q(".hero__media-inner"), { willChange: "auto" }),
          },
          0,
        )
          .from(q(".hero__glow"), { autoAlpha: 0, scale: 0.4, duration: 2.4, ease: "power2.out" }, 0.1)
          .from(header, { yPercent: -100, autoAlpha: 0, duration: 1.4 }, 0.25)
          .from(q(".hero .label"), { x: -30, autoAlpha: 0, duration: 1.2 }, 0.35)
          .from(split.lines, { yPercent: 115, rotate: 3, transformOrigin: "0% 100%", duration: 1.6, stagger: 0.12 }, 0.4)
          .from(q(".hero .lead"), { y: 30, autoAlpha: 0, duration: 1.3 }, 0.9)
          .from(q(".hero__actions > *"), { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 1)
          .from(q(".hero__scroll"), { autoAlpha: 0, y: 20, duration: 1 }, 1.3);
      });

      /* The photo paints under the opaque preloader at its starting scale, so the intro never waits on its raster. */
      if (!reduced) gsap.set(q(".hero__media-inner"), { visibility: "visible", scale: 1.25 });

      const w = window as unknown as { __preloaderDone?: boolean };
      if (w.__preloaderDone) intro();
      else window.addEventListener(PRELOADER_DONE, intro, { once: true });
      const offIntro = () => window.removeEventListener(PRELOADER_DONE, intro);

      if (reduced) return offIntro;

      gsap.to(q(".hero__media"), {
        yPercent: 22,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q(".hero__content"), {
        y: -120,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "20% top", end: "bottom top", scrub: true },
      });

      if (!finePointer()) return offIntro;
      const media = q(".hero__depth")[0];
      const glow = q(".hero__glow")[0];
      const mx = gsap.quickTo(media, "x", { duration: 1.4, ease: "power3.out" });
      const my = gsap.quickTo(media, "y", { duration: 1.4, ease: "power3.out" });
      const gx = gsap.quickTo(glow, "x", { duration: 2, ease: "power3.out" });
      const gy = gsap.quickTo(glow, "y", { duration: 2, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const px = e.clientX / window.innerWidth - 0.5;
        const py = e.clientY / window.innerHeight - 0.5;
        mx(-px * 40);
        my(-py * 24);
        gx(px * window.innerWidth * 0.5);
        gy(py * window.innerHeight * 0.5);
      };
      root.current!.addEventListener("pointermove", move);
      return () => {
        offIntro();
        root.current?.removeEventListener("pointermove", move);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="home" className="hero">
      <div className="hero__media" aria-hidden>
        <div className="hero__depth">
          <div className="hero__media-inner" data-intro>
            <Image src="/images/hero.webp" alt="" fill sizes="115vw" loading="eager" fetchPriority="high" quality={95} />
          </div>
        </div>
        <div className="hero__glow" data-intro />
      </div>

      <div className="container">
        <div className="hero__content" id="about">
          <div className="hero__content-inner">
            <p className="label" data-intro data-scramble>
              <b>01 /</b> <span>Frontend разработчик</span>
            </p>
            <h1 className="h1 hero__title" data-intro>
              Программист,
              <br />
              который <span className="accent">проектирует</span>
              <br />
              опыт, а не просто
              <br />
              пишет код
            </h1>
            <p className="lead" data-intro>
              Создаю веб-продукты с продуманной архитектурой, эстетичным интерфейсом и вниманием к деталям.
            </p>
            <div className="hero__actions" data-intro>
              <a href="#projects" className="lnk">
                <span className="lnk__text">Смотреть проекты</span>
                <span className="lnk__icon">
                  <ArrowRight />
                </span>
              </a>
              <a href="#contacts" className="lnk lnk--muted">
                <span className="lnk__text">Связаться</span>
                <span className="lnk__icon">
                  <ArrowRight />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <a href="#stack" className="hero__scroll" data-intro aria-label="Листать вниз">
        <span className="hero__scroll-mouse">
          <span className="hero__scroll-wheel" />
        </span>
        <span>Листайте</span>
      </a>

      <span className="anchor anchor--dot hero__anchor" data-anchor="1" />
    </section>
  );
}
