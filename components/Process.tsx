import Image from "next/image";
import { CodeIcon, PenIcon, RocketIcon, SearchIcon } from "./icons";

const steps = [
  { title: "Анализ", text: "Обсуждаем задачу, цели и требования.", Icon: SearchIcon },
  { title: "Проектирование", text: "Структура, UI/UX и техническое решение.", Icon: PenIcon },
  { title: "Разработка", text: "Чистый, масштабируемый код с регулярными апдейтами.", Icon: CodeIcon },
  { title: "Запуск", text: "Деплой, тестирование и дальнейшая поддержка.", Icon: RocketIcon },
];

export default function Process() {
  return (
    <section id="process" className="section process">
      <div className="section__bg process__bg" aria-hidden>
        <div className="section__bg-inner" data-zoom>
          <Image src="/images/mountains.png" alt="" fill sizes="100vw" quality={80} />
        </div>
      </div>

      <div className="container process__grid">
        <div className="process__text">
          <p className="label" data-reveal>
            <b>04 /</b> <span>Мой процесс</span>
          </p>
          <h2 className="h2" data-split>
            От идеи
            <br />
            до <span className="accent">результата.</span>
          </h2>
          <p className="lead" data-reveal="0.2">
            Каждый проект — это последовательный путь, где важен каждый этап.
          </p>
        </div>

        <ol className="steps" data-stagger>
          {steps.map(({ title, text, Icon }, i) => (
            <li key={title} className="step" data-item data-cursor={`Этап ${i + 1}`}>
              <span className="step__icon" data-anchor={5 + i}>
                <span className="step__ripple" />
                <Icon />
              </span>
              <div>
                <h3 className="step__title">
                  <em>0{i + 1}</em> {title}
                </h3>
                <p className="step__text">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
