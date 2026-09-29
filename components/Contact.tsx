import Image from "next/image";
import CopyEmail from "./fx/CopyEmail";
import { ArrowRight, GithubIcon, LinkedinIcon, TelegramIcon } from "./icons";

export default function Contact() {
  return (
    <section id="contacts" className="section contact">
      <div className="contact__bg" aria-hidden>
        <Image src="/images/planet.png" alt="" fill sizes="(max-width: 900px) 140vw, 80vw" quality={90} />
        <span className="anchor contact__anchor-a" data-anchor="9" />
        <span className="anchor contact__anchor-b" data-anchor="10" />
        <span className="anchor anchor--ring contact__anchor-c" data-anchor="11" />
      </div>

      <div className="container">
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
            Всегда открыт к интересным задачам, сотрудничеству и новым возможностям.
          </p>
          <div className="contact__actions" data-stagger>
            <a href="mailto:hello@example.com" className="btn btn--primary btn--xl" data-item data-magnetic="0.4" data-cursor="Привет!">
              <span className="btn__label">Написать мне</span> <ArrowRight />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="social" aria-label="GitHub" data-item data-cursor="GitHub">
              <GithubIcon />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social" aria-label="LinkedIn" data-item data-cursor="LinkedIn">
              <LinkedinIcon />
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer" className="social" aria-label="Telegram" data-item data-cursor="Telegram">
              <TelegramIcon />
            </a>
          </div>
          <div data-reveal="0.4">
            <CopyEmail email="hello@example.com" />
          </div>
        </div>
      </div>

      <footer className="footer container">
        <span>© 2026 A/ — Frontend разработчик</span>
        <a href="#home">
          <span>Наверх ↑</span>
        </a>
      </footer>
    </section>
  );
}
