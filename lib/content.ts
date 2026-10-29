import { GsapIcon, NextIcon, NodeIcon, PostgresIcon, ReactIcon, StateIcon, TestIcon, TsIcon } from "@/components/icons";
import type { Dict } from "@/lib/i18n";

/** Language-independent project data; texts and translated titles come from the dictionary. */
export const PROJECTS = [
  {
    title: "Psyches Strings",
    tags: ["React", "Vite", "Node.js"],
    image: "/images/projects/psyches-strings.jpg",
    url: "https://psyches-strings.vercel.app",
    pos: "30% 50%",
  },
  {
    title: "Bloom",
    tags: ["React", "Supabase", "PWA"],
    image: "/images/projects/bloom.webp",
    url: "https://bloom-love.online",
    pos: "25% 50%",
  },
  {
    title: "Tideline",
    tags: ["Node.js", "RSS", "YouTube API"],
    image: "/images/projects/tideline.jpg",
    url: "https://world-news-snowy.vercel.app",
    pos: "50% 50%",
  },
  {
    title: "Елизавета",
    tags: ["Next.js", "GSAP", "Tailwind"],
    image: "/images/projects/elizaveta.webp",
    url: "https://elizaveta-pi.vercel.app",
    pos: "30% 50%",
  },
  {
    title: "Ярослава",
    tags: ["Node.js", "Express", "GSAP"],
    image: "/images/projects/yaroslava.jpg",
    url: "https://yaroslava-knit.vercel.app",
    pos: "40% 50%",
  },
];

export const localizedProjects = (t: Dict) =>
  PROJECTS.map((p, i) => ({ ...p, ...t.projects.items[i], title: t.projects.items[i].title ?? p.title }));

/** The stack, in the order the planets are flown through; size/ring only matter to the 3D scene. */
export const PLANETS = [
  { name: "React", Icon: ReactIcon, size: 5.6, ring: true },
  { name: "Next.js", Icon: NextIcon, size: 5 },
  { name: "TypeScript", Icon: TsIcon, size: 4.8 },
  { name: "Node.js", Icon: NodeIcon, size: 5.4 },
  { name: "PostgreSQL", Icon: PostgresIcon, size: 4.6 },
  { name: "Redux", Icon: StateIcon, size: 5.2 },
  { name: "Testing", Icon: TestIcon, size: 4.8 },
  { name: "GSAP", Icon: GsapIcon, size: 5.6, ring: true },
];
