/**
 * Contact form → Telegram: the site's own delivery, so requests don't depend on a third-party form service.
 * Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID; without them it answers 503 and the form falls back to FormSubmit.
 */

const MAX_FIELDS = 20;
const MAX_VALUE = 4000;

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return Response.json({ success: "false", message: "Not configured" }, { status: 503 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ success: "false", message: "Bad request" }, { status: 400 });
  }
  const entries = Object.entries(body as Record<string, unknown>).filter(
    (e): e is [string, string] => typeof e[1] === "string",
  );
  if (entries.length > MAX_FIELDS) return Response.json({ success: "false", message: "Too many fields" }, { status: 400 });

  const fields = Object.fromEntries(entries);
  // Bots fill the hidden field; pretend it worked so they don't adapt.
  if (fields._honey) return Response.json({ success: "true" });

  const lines = entries
    .filter(([k]) => !k.startsWith("_"))
    .map(([k, v]) => `<b>${escape(k)}:</b> ${escape(v.slice(0, MAX_VALUE))}`);
  const text = `📩 <b>${escape(fields._subject || "Заявка с сайта")}</b>\n\n${lines.join("\n")}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
    if (!json.ok) return Response.json({ success: "false", message: json.description || "Telegram error" }, { status: 502 });
  } catch {
    return Response.json({ success: "false", message: "Telegram unreachable" }, { status: 502 });
  }
  return Response.json({ success: "true" });
}
