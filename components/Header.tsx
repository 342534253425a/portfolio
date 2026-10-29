"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { LogoGlyphs, logoTimeline } from "./fx/LogoMark";
import { ArrowRight } from "./icons";
import { langHref, liteHref, useI18n } from "@/lib/i18n";

const tracked = ["home", "stack", "projects", "process", "contacts"];

function LangSwitch() {
  const { lang, t } = useI18n();
  const other = lang === "en" ? "ru" : "en";
  return (
    <a href={langHref(other)} className="lang" hrefLang={other} aria-label={t.header.switchTo}>
      <span className={lang === "en" ? "is-on" : undefined}>EN</span>
      <i aria-hidden />
      <span className={lang === "ru" ? "is-on" : undefined}>RU</span>
    </a>
  );
}

export default function Header() {
  const { lang, t } = useI18n();
  const links = tracked.map((id, i) => ({ href: `#${id}`, label: t.nav[i] }));
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const logo = useRef<HTMLAnchorElement>(null);
  const logoTl = useRef<gsap.core.Timeline | null>(null);
  const playLogo = () => {
    if (!logo.current || logoTl.current?.isActive()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    logoTl.current = logoTimeline(logo.current, "pen", 1.1);
  };

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 40,
        end: "max",
        onToggle: (self) => root.current!.classList.toggle("is-scrolled", self.isActive),
      });

      let lastY = 0;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          const hide = !openRef.current && y > 600 && y > lastY + 2;
          const show = y < lastY - 2 || y < 600;
          if (hide) gsap.to(root.current, { yPercent: -110, duration: 0.6, ease: "power3.out", overwrite: "auto" });
          else if (show) gsap.to(root.current, { yPercent: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
          lastY = y;
        },
      });

      tracked.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(id),
        });
      });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const move = () => {
        const link = root.current!.querySelector<HTMLElement>(`.nav a[href="#${active}"]`);
        if (!link) return;
        gsap.to(bar.current, { x: link.offsetLeft, width: link.offsetWidth, duration: 0.8, ease: "expo.out" });
      };
      move();
      window.addEventListener("resize", move);
      return () => window.removeEventListener("resize", move);
    },
    { dependencies: [active], scope: root },
  );

  useEffect(() => {
    const lenis = getLenis();
    openRef.current = open;
    document.documentElement.classList.toggle("menu-open", open);
    if (open) {
      lenis?.stop();
      gsap.to(root.current, { yPercent: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    } else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header ref={root} className="header" data-intro-header>
        <div className="container header__inner">
          <a
            ref={logo}
            href="#home"
            className="logo lm"
            data-pen-tilt="-27"
            aria-label={t.header.home}
            onClick={() => setOpen(false)}
            onPointerEnter={playLogo}
          >
            <LogoGlyphs />
          </a>
          <nav className="nav" aria-label={t.header.mainNav}>
            {links.map((l) => (
              <a key={l.href} href={l.href} data-label={l.label} className={active === l.href.slice(1) ? "is-active" : undefined}>
                <span>{l.label}</span>
              </a>
            ))}
            <span ref={bar} className="nav__bar" />
          </nav>
          <div className="header__right">
            <LangSwitch />
            <a href="#contacts" className="lnk lnk--sm header__cta" data-contact>
              <span className="lnk__text">{t.header.contact}</span>
              <span className="lnk__icon">
                <ArrowRight />
              </span>
            </a>
            <button
              type="button"
              className={`burger${open ? " is-open" : ""}`}
              aria-label={open ? t.header.closeMenu : t.header.openMenu}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <nav className="menu__nav" aria-label={t.header.mobileNav}>
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              style={{ "--i": i } as React.CSSProperties}
              className={active === l.href.slice(1) ? "is-active" : undefined}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              <b>{String(i + 1).padStart(2, "0")}</b>
              <span>{l.label}</span>
            </a>
          ))}
        </nav>
        <a href="#contacts" className="lnk menu__cta" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} data-contact>
          <span className="lnk__text">{t.header.discuss}</span>
          <span className="lnk__icon">
            <ArrowRight />
          </span>
        </a>
        <a href={liteHref(lang)} className="menu__lite" tabIndex={open ? 0 : -1}>
          {t.lite.offer}
        </a>
      </div>
    </>
  );
}
