"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ContactDialog from "./ContactDialog";
import { LogoGlyphs } from "./fx/LogoMark";
import { ArrowRight, CopyIcon, MailIcon, PhoneIcon, TelegramIcon, WhatsappIcon } from "./icons";
import { EMAIL, PHONE, PHONE_LABEL, SOCIALS, WHATSAPP, writeEmailHref } from "@/lib/contacts";
import { localizedProjects, PLANETS } from "@/lib/content";
import { I18nProvider, langHref, liteHref, useI18n, type Lang } from "@/lib/i18n";

const TELEGRAM = SOCIALS.find((s) => s.label === "Telegram")!.href;
const IDS = ["home", "stack", "projects", "process", "contacts"];

/**
 * Light version for slow phones: the same content and contact dialog as the main site,
 * but plain sections, native scrolling and no preloader, WebGL-like canvases or scroll scenes.
 */
export default function LiteSite({ lang }: { lang: Lang }) {
  return (
    <I18nProvider lang={lang}>
      <Lite />
      <ContactDialog />
    </I18nProvider>
  );
}

function Lite() {
  const { lang, t } = useI18n();
  const other = lang === "en" ? "ru" : "en";
  const projects = localizedProjects(t);
  const [copied, setCopied] = useState(false);
  // Gmail vs mailto: depends on the device, which only the browser knows.
  const [emailHref, setEmailHref] = useState(`mailto:${EMAIL}`);
  useEffect(() => setEmailHref(writeEmailHref(t.dialog.direct.email.subject)), [t]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="lite">
      <header className="lite-bar">
        <a href="#home" className="lite-bar__logo lm" aria-label={t.header.home}>
          <LogoGlyphs />
        </a>
        <span className="lite-bar__badge">{t.lite.badge}</span>
        <a href={liteHref(other)} className="lang" hrefLang={other} aria-label={t.header.switchTo}>
          <span className={lang === "en" ? "is-on" : undefined}>EN</span>
          <i aria-hidden />
          <span className={lang === "ru" ? "is-on" : undefined}>RU</span>
        </a>
      </header>

      <nav className="lite-nav" aria-label={t.header.mainNav}>
        {IDS.slice(1).map((id, i) => (
          <a key={id} href={`#${id}`}>
            {t.nav[i + 1]}
          </a>
        ))}
      </nav>

      <main>
        <section id="home" className="lite-hero">
          <div className="lite-hero__media" aria-hidden>
            <Image src="/images/hero.webp" alt="" fill priority sizes="100vw" quality={70} />
          </div>
          <div className="lite-wrap lite-hero__body">
            <p className="lite-label">
              <b>01 /</b> {t.hero.role}
            </p>
            <h1 className="lite-h1">{t.hero.title}</h1>
            <p className="lite-lead">{t.hero.lead}</p>
            <div className="lite-actions">
              <button type="button" className="btn btn--primary" data-contact>
                <span className="btn__label">{t.lite.discuss}</span>
                <ArrowRight />
              </button>
              <a href="#projects" className="btn btn--ghost">
                <span className="btn__label">{t.hero.projects}</span>
              </a>
            </div>
          </div>
        </section>

        <section id="stack" className="lite-section lite-wrap">
          <p className="lite-label">
            <b>02 /</b> {t.stack.label}
          </p>
          <h2 className="lite-h2">{t.stack.title}</h2>
          <ul className="lite-stack">
            {PLANETS.map(({ name, Icon }, i) => (
              <li key={name} className="lite-card">
                <span className="lite-stack__icon">
                  <Icon />
                </span>
                <h3>{name}</h3>
                <p>{t.stack.planets[i].text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="projects" className="lite-section lite-wrap">
          <p className="lite-label">
            <b>03 /</b> {t.projects.label}
          </p>
          <h2 className="lite-h2">{t.projects.title}</h2>
          <div className="lite-projects">
            {projects.map((p, i) => (
              <article key={p.url} className="lite-card lite-project">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="lite-project__shot">
                  <Image src={p.image} alt={p.title} fill sizes="(max-width: 700px) 100vw, 640px" quality={70} />
                  <span className="lite-project__num">
                    <b>/</b>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </a>
                <div className="lite-project__body">
                  <p className="lite-project__role">{p.role}</p>
                  <h3>{p.title}</h3>
                  <p className="lite-project__text">{p.text}</p>
                  <ul className="lite-tags">
                    {p.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="lite-link">
                    {t.projects.openSite} <ArrowRight />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="lite-section lite-wrap">
          <p className="lite-label">
            <b>04 /</b> {t.process.label}
          </p>
          <h2 className="lite-h2">{t.process.title}</h2>
          <ol className="lite-steps">
            {t.process.steps.map((s, i) => (
              <li key={s.title} className="lite-card">
                <span className="lite-steps__num">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul className="lite-tags">
                  {s.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section id="contacts" className="lite-section lite-wrap lite-contact">
          <p className="lite-label">
            <b>05 /</b> {t.contact.label}
          </p>
          <h2 className="lite-h2">{t.contact.title}</h2>
          <p className="lite-lead">{t.contact.lead}</p>
          <button type="button" className="btn btn--primary lite-contact__main" data-contact>
            <span className="btn__label">{t.contact.choose}</span>
            <ArrowRight />
          </button>
          <div className="lite-direct">
            <a href={TELEGRAM} target="_blank" rel="noreferrer" className="lite-card lite-direct__item">
              <TelegramIcon />
              <span>
                <b>Telegram</b>
                <small>{t.dialog.direct.telegram.text}</small>
              </span>
            </a>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="lite-card lite-direct__item">
              <WhatsappIcon />
              <span>
                <b>WhatsApp</b>
                <small>{PHONE_LABEL}</small>
              </span>
            </a>
            <a href={`tel:${PHONE}`} className="lite-card lite-direct__item">
              <PhoneIcon />
              <span>
                <b>{t.dialog.direct.phone.call}</b>
                <small>{PHONE_LABEL}</small>
              </span>
            </a>
            <div className="lite-card lite-direct__item">
              <MailIcon />
              <span>
                <b>{EMAIL}</b>
                <small>
                  <a href={emailHref} target="_blank" rel="noreferrer">
                    {t.dialog.direct.email.actionMobile}
                  </a>{" "}
                  ·{" "}
                  <button type="button" onClick={copy}>
                    <CopyIcon /> {copied ? t.contact.copied : t.contact.copy}
                  </button>
                </small>
              </span>
            </div>
          </div>
          <p className="lite-reply">
            <span className="clock__dot" /> {t.contact.reply}
          </p>
        </section>
      </main>

      <footer className="lite-wrap lite-footer">
        <a href={langHref(lang)} className="lite-footer__full">
          {t.lite.full} <small>{t.lite.fullHint}</small> <ArrowRight />
        </a>
        <span>© 2026 {t.contact.footer}</span>
        <a href="#home">{t.contact.top}</a>
      </footer>
    </div>
  );
}
