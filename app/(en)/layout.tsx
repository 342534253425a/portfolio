import RootDocument, { siteMetadata, siteViewport } from "@/components/RootDocument";

export const metadata = siteMetadata("en");
export const viewport = siteViewport;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
