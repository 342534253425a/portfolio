type P = React.SVGProps<SVGSVGElement>;

const base = (size = 20): P => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const ArrowRight = (p: P) => (
  <svg {...base(18)} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const ArrowLeft = (p: P) => (
  <svg {...base(18)} {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const CircleArrow = (p: P) => (
  <svg {...base(18)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 12h5M12.5 9.5 15 12l-2.5 2.5" />
  </svg>
);

export const ReactIcon = (p: P) => (
  <svg width="48" height="48" viewBox="-12 -12 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden {...p}>
    <circle r="2.1" fill="currentColor" stroke="none" />
    <ellipse rx="10.5" ry="4.1" />
    <ellipse rx="10.5" ry="4.1" transform="rotate(60)" />
    <ellipse rx="10.5" ry="4.1" transform="rotate(120)" />
  </svg>
);

export const NextIcon = (p: P) => (
  <svg {...base(22)} strokeWidth={1.4} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 16.5v-9l7.5 10.2M15.2 7.5v5.8" />
  </svg>
);

export const TailwindIcon = (p: P) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.91.23 1.57.89 2.29 1.62C13.67 10.62 15.03 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.91-.23-1.57-.89-2.29-1.62C16.34 6.18 14.98 4.8 12 4.8zM6 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.91.23 1.57.89 2.29 1.62C7.67 17.82 9.03 19.2 12 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.91-.23-1.57-.89-2.29-1.62C10.34 13.38 8.98 12 6 12z" />
  </svg>
);

export const TsIcon = (p: P) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...p}>
    <rect x="1" y="1" width="22" height="22" rx="2.5" fill="currentColor" />
    <text x="12.5" y="18.5" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#0a0a0c" fontFamily="Arial, sans-serif">
      TS
    </text>
  </svg>
);

export const NodeIcon = (p: P) => (
  <svg {...base(24)} strokeWidth={1.5} {...p}>
    <path d="M12 2.2 20.5 7v10L12 21.8 3.5 17V7z" />
    <path d="M12 7.5 16 9.8v4.4L12 16.5l-4-2.3V9.8z" />
  </svg>
);

export const SupabaseIcon = (p: P) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M13.3 22.2c-.5.6-1.6.3-1.6-.5l-.2-8.6h7.8c1.4 0 2.2 1.7 1.3 2.8z" opacity=".7" />
    <path d="M10.7 1.8c.5-.6 1.6-.3 1.6.5l.1 8.6H4.7c-1.4 0-2.2-1.7-1.3-2.8z" />
  </svg>
);

export const GsapIcon = (p: P) => (
  <svg {...base(24)} strokeWidth={1.6} {...p}>
    <path d="M2.5 15.5c2.2-6 4.6-6 6.4-1.6s4.2 4.4 6.4-1.6 4.2-6.2 6.2-2.3" />
    <circle cx="21.5" cy="10" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const PwaIcon = (p: P) => (
  <svg {...base(24)} strokeWidth={1.5} {...p}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M10.5 18.5h3M12 7v6.5M9.5 11l2.5 2.5 2.5-2.5" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(24)} strokeWidth={1.7} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
);

export const PenIcon = (p: P) => (
  <svg {...base(24)} strokeWidth={1.7} {...p}>
    <path d="M4 20l1.2-4.6L15.8 4.8a2.3 2.3 0 0 1 3.3 3.3L8.5 18.8z" />
    <path d="m13.8 6.8 3.3 3.3" />
  </svg>
);

export const CodeIcon = (p: P) => (
  <svg {...base(24)} strokeWidth={1.7} {...p}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />
  </svg>
);

export const RocketIcon = (p: P) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M21.6 2.4 2.9 10.1c-.7.3-.7 1.2 0 1.5l6.1 2.4 2.4 6.1c.3.7 1.2.7 1.5 0L21.6 2.4zM9.6 13.3l7.6-6.4-6.4 7.6z" />
  </svg>
);

export const GithubIcon = (p: P) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

export const TelegramIcon = (p: P) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M21.9 3.6 18.8 19.4c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.35-5.1 9.2-8.3c.4-.36-.1-.56-.62-.2L6.2 12.9l-4.9-1.5c-1.07-.33-1.1-1.07.22-1.6L20.6 2.4c.9-.33 1.68.2 1.3 1.2z" />
  </svg>
);
