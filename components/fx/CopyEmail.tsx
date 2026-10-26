"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";

export default function CopyEmail({ email }: { email: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
    setCopied(true);
    gsap.fromTo(ref.current, { scale: 0.92 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.4)" });
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button ref={ref} type="button" className={`copy${copied ? " is-copied" : ""}`} onClick={copy}>
      <span className="copy__dot" />
      <span className="copy__text">{email}</span>
      <span className="copy__state">{copied ? t.contact.copied : t.contact.copy}</span>
    </button>
  );
}
