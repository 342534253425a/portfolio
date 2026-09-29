import Image from "next/image";
import OrbitFX from "./fx/OrbitFX";
import {
  DockerIcon,
  GraphqlIcon,
  NextIcon,
  NodeIcon,
  PostgresIcon,
  ReactIcon,
  TailwindIcon,
  TsIcon,
} from "./icons";

const nodes = [
  { name: "Next.js", Icon: NextIcon, x: 29.4, y: 17.4, speed: 0.05, tip: "4 года · SSR/ISR" },
  { name: "Tailwind CSS", Icon: TailwindIcon, x: 66.4, y: 17.4, speed: 0.08, tip: "4 года · дизайн-системы" },
  { name: "TypeScript", Icon: TsIcon, x: 22.8, y: 47, speed: 0.11, tip: "5 лет · строгая типизация" },
  { name: "Docker", Icon: DockerIcon, x: 83.1, y: 47, speed: 0.04, tip: "3 года · CI/CD" },
  { name: "Node.js", Icon: NodeIcon, x: 27.4, y: 76.7, speed: 0.09, hot: true, tip: "6 лет · API и BFF" },
  { name: "GraphQL", Icon: GraphqlIcon, x: 74.8, y: 76.7, speed: 0.13, hot: true, tip: "3 года · Apollo" },
  { name: "PostgreSQL", Icon: PostgresIcon, x: 53.9, y: 93, speed: 0.06, tip: "5 лет · Prisma" },
];

export default function Stack() {
  return (
    <section id="stack" className="section stack">
      <div className="container stack__grid">
        <div className="stack__text">
          <p className="label" data-reveal>
            <b>02 /</b> <span>Мой стек</span>
          </p>
          <h2 className="h2" data-split>
            Технологии —
            <br />
            мои инструменты.
            <br />
            Система — <span className="accent">мой подход.</span>
          </h2>
          <p className="lead" data-reveal="0.2">
            Постоянно изучаю новые технологии и лучшие инструменты для создания современных, быстрых и
            масштабируемых веб-приложений.
          </p>
          <p className="stack__hint" data-reveal="0.35">
            <span className="stack__hint-icon">⟲</span> Покрутите орбиту мышкой
          </p>
        </div>

        <div className="orbit" data-stagger="pop" data-cursor="Крути">
          <div className="orbit__img" data-item>
            <div className="orbit__img-inner" data-zoom>
              <Image src="/images/orbit.png" alt="" fill sizes="(max-width: 900px) 100vw, 900px" quality={90} />
            </div>
          </div>

          <svg className="orbit__rings" viewBox="0 0 900 506" aria-hidden>
            <ellipse className="orbit__ring orbit__ring--a" cx="465" cy="233" rx="300" ry="170" />
            <ellipse className="orbit__ring orbit__ring--b" cx="465" cy="233" rx="215" ry="118" />
            <path id="orbit-path" d="M165 233a300 170 0 1 0 600 0a300 170 0 1 0 -600 0" fill="none" />
            <circle r="4" className="orbit__sat">
              <animateMotion dur="14s" repeatCount="indefinite">
                <mpath href="#orbit-path" />
              </animateMotion>
            </circle>
            <circle r="3" className="orbit__sat">
              <animateMotion dur="14s" begin="-7s" repeatCount="indefinite">
                <mpath href="#orbit-path" />
              </animateMotion>
            </circle>
          </svg>

          <svg className="orbit__links" aria-hidden />

          <div className="orbit__core" data-item>
            <span className="orbit__pulse" />
            <span className="orbit__pulse orbit__pulse--late" />
            <ReactIcon />
            <span>React</span>
          </div>

          {nodes.map(({ name, Icon, x, y, speed, hot, tip }) => (
            <div key={name} className="node-pos" data-x={x} data-y={y} style={{ left: `${x}%`, top: `${y}%` }}>
              <div className="node-float" data-speed={speed}>
                <div className={`node${hot ? " node--hot" : ""}`} data-item data-cursor={name}>
                  <span className="node__icon">
                    <Icon />
                  </span>
                  <span className="node__name">
                    {name}
                    <small className="node__tip">{tip}</small>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="anchor anchor--dot stack__anchor-a" data-anchor="2" />
      <span className="anchor stack__anchor-b" data-anchor="3" />
      <OrbitFX />
    </section>
  );
}
