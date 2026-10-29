"use client";

import Image from "next/image";
import CopyEmail from "./fx/CopyEmail";
import HoloCard from "./fx/HoloCard";
import { Finale, PlanetParallax, ReplyNote } from "./fx/ContactFX";
import { ArrowRight } from "./icons";
import { EMAIL, SOCIALS } from "@/lib/contacts";
import { liteHref, useI18n } from "@/lib/i18n";

export default function Contact() {
  const { lang, t } = useI18n();
  return (
    <section id="contacts" className="section contact">
      <div className="contact__bg" aria-hidden>
        <div className="contact__rise">
          <div className="contact__planet">
            <Image src="/images/planet.png" alt="" fill sizes="(max-width: 900px) 140vw, 80vw" quality={90} />
          </div>
        </div>
        <span className="anchor contact__anchor-a" data-anchor="9" />
        <span className="anchor contact__anchor-b" data-anchor="10" />
        <span className="anchor anchor--ring contact__anchor-c" data-anchor="11" />
      </div>

      <div className="container contact__grid">
        <div className="contact__text">
          <p className="label" data-reveal>
            <b>05 /</b> <span>{t.contact.label}</span>
          </p>
          <h2 className="h2" data-split>
            {t.contact.title}
          </h2>
          <p className="lead" data-reveal="0.2">
            {t.contact.lead}
          </p>
          <div className="contact__actions" data-stagger>
            <a href={`mailto:${EMAIL}`} className="lnk" data-item data-contact>
              <span className="lnk__text">{t.contact.choose}</span>
              <span className="lnk__icon">
                <ArrowRight />
              </span>
            </a>
            {SOCIALS.map(({ href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="lnk lnk--muted" data-item>
                <span className="lnk__text">{label} ↗</span>
              </a>
            ))}
          </div>
          <div className="contact__meta" data-reveal="0.3">
            <CopyEmail email={EMAIL} />
            <ReplyNote />
          </div>
        </div>

        <HoloCard email={EMAIL} />
      </div>

      <Finale email={EMAIL} />

      <footer className="footer container">
        <span>© 2026 {t.contact.footer}</span>
        <a href={liteHref(lang)}>
          <span>{t.lite.footer}</span>
        </a>
        <a href="#home">
          <span>{t.contact.top}</span>
        </a>
      </footer>
      <PlanetParallax />
    </section>
  );
}
