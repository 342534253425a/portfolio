import RootDocument, { siteMetadata, siteViewport } from "@/components/RootDocument";

export const metadata = siteMetadata("ru");
export const viewport = siteViewport;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="ru">{children}</RootDocument>;
}
