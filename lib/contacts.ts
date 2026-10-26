export const EMAIL = "me@alexsey-developer.online";
export const SITE_URL = "https://alexsey-developer.online";
export const PHONE = "+79649039565";
export const PHONE_LABEL = "+7 964 903-95-65";
export const WHATSAPP = "https://wa.me/79649039565";

export const SOCIALS = [
  { href: "https://t.me/Xsey342516", label: "Telegram" },
  { href: WHATSAPP, label: "WhatsApp" },
] as const;

/**
 * A plain mailto: link does nothing on computers without a mail app, so desktop visitors get
 * Gmail's compose window with the address filled in; phones keep mailto:, which opens their mail app.
 */
export const writeEmailHref = (subject: string) =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
    ? `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`
    : `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(subject)}`;
