import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "lenis/dist/lenis.css";
import "@/app/globals.css";
import "@/app/fx.css";
import "@/app/contact-dialog.css";
import "@/app/lite.css";
import { SITE_URL } from "@/lib/contacts";
import type { Lang } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const META: Record<Lang, { title: string; description: string; locale: string; path: string }> = {
  en: {
    title: "A/ — Frontend developer",
    description:
      "A developer who designs experiences, not just writes code. Web products with thoughtful architecture and a refined interface.",
    locale: "en_US",
    path: "/",
  },
  ru: {
    title: "A/ — Frontend разработчик",
    description:
      "Программист, который проектирует опыт, а не просто пишет код. Веб-продукты с продуманной архитектурой и эстетичным интерфейсом.",
    locale: "ru_RU",
    path: "/ru",
  },
};

/** "lite" is the effect-free copy at /mobile; search engines are pointed at the full page as the canonical one. */
export const siteMetadata = (lang: Lang, variant: "full" | "lite" = "full"): Metadata => {
  const { title: fullTitle, description, locale, path } = META[lang];
  const title = variant === "lite" ? `${fullTitle} · Lite` : fullTitle;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: path, languages: { en: "/", ru: "/ru", "x-default": "/" } },
    openGraph: { type: "website", locale, url: path, siteName: "A/ Portfolio", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
};

export const siteViewport: Viewport = {
  themeColor: "#050506",
};

/** Shared <html> shell for the per-language root layouts. */
export default function RootDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');history.scrollRestoration='manual';`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
