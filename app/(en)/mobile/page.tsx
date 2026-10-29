import type { Metadata } from "next";
import LiteSite from "@/components/LiteSite";
import { siteMetadata } from "@/components/RootDocument";

export const metadata: Metadata = siteMetadata("en", "lite");

export default function LitePage() {
  return <LiteSite lang="en" />;
}
