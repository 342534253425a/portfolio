import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./fx.css";
import { SITE_URL } from "@/lib/contacts";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const title = "A/ — Frontend разработчик";
const description =
  "Программист, который проектирует опыт, а не просто пишет код. Веб-продукты с продуманной архитектурой и эстетичным интерфейсом.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: { type: "website", locale: "ru_RU", url: "/", siteName: "A/ Portfolio", title, description },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#050506",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
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
