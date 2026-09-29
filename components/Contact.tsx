import Image from "next/image";
import CopyEmail from "./fx/CopyEmail";
import HoloCard from "./fx/HoloCard";
import { Finale, LiveClock, PlanetParallax } from "./fx/ContactFX";
import { ArrowRight, GithubIcon, LinkedinIcon, TelegramIcon } from "./icons";

const EMAIL = "hello@example.com";

export default function Contact() {
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
            <b>05 /</b> <span>Контакты</span>
          </p>
          <h2 className="h2" data-split>
            Обсудим ваш
            <br />
            <span className="accent">следующий проект?</span>
          </h2>
          <p className="lead" data-reveal="0.2">
            Открыт к работе в команде и интересным проектам. Люблю сложные интерфейсы, где важны детали и скорость.
          </p>
          <div className="contact__actions" data-stagger>
            <a href={`mailto:${EMAIL}`} className="btn btn--primary btn--xl" data-item data-magnetic="0.4">
              <span className="btn__label">Написать мне</span> <ArrowRight />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="social" aria-label="GitHub" data-item>
              <GithubIcon />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social" aria-label="LinkedIn" data-item>
              <LinkedinIcon />
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer" className="social" aria-label="Telegram" data-item>
              <TelegramIcon />
            </a>
          </div>
          <div className="contact__meta" data-reveal="0.3">
            <CopyEmail email={EMAIL} />
            <LiveClock />
          </div>
        </div>

        <HoloCard email={EMAIL} />
      </div>

      <Finale email={EMAIL} />

      <footer className="footer container">
        <span>© 2026 A/ — Frontend разработчик</span>
        <a href="#home">
          <span>Наверх ↑</span>
        </a>
      </footer>
      <PlanetParallax />
    </section>
  );
}
