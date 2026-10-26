"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { EMAIL, PHONE, PHONE_LABEL, SOCIALS, WHATSAPP, writeEmailHref } from "@/lib/contacts";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, CalendarIcon, ChatIcon, CopyIcon, MailIcon, PhoneIcon, SendIcon, TelegramIcon, WhatsappIcon } from "./icons";

type View = "choose" | "request" | "call" | "direct" | "done";
type Method = "telegram" | "email" | "phone" | "whatsapp";

const METHODS: Method[] = ["telegram", "email", "phone", "whatsapp"];
const VIEWS: View[] = ["choose", "request", "call", "direct"];
const ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`;
const TELEGRAM = SOCIALS.find((s) => s.label === "Telegram")!.href;
const handleOf = (href: string) => href.replace(/^https?:\/\/t\.me\//, "");

/** Calls are offered on Moscow working hours, shown to the visitor in their own time zone. */
const MSK = 3;
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const LEAD = 2 * 3600e3;
const DAYS = 10;

type Day = { key: string; noon: Date; slots: number[] };

/** Rise-in for dialog content; CSS transform transitions are paused so they don't fight the tween. */
const rise = (targets: NodeListOf<HTMLElement> | HTMLElement[], vars: gsap.TweenVars = {}) => {
  const els = Array.from(targets);
  els.forEach((el) => (el.style.transition = "none"));
  return gsap.from(els, {
    y: 28,
    autoAlpha: 0,
    duration: 0.85,
    stagger: 0.045,
    ease: "expo.out",
    ...vars,
    onComplete: () => els.forEach((el) => ((el.style.transition = ""), gsap.set(el, { clearProps: "transform" }))),
  });
};

function buildDays(now: number): Day[] {
  const msk = new Date(now + MSK * 3600e3);
  const days: Day[] = [];
  for (let i = 0; days.length < DAYS && i < 21; i++) {
    const [y, m, d] = [msk.getUTCFullYear(), msk.getUTCMonth(), msk.getUTCDate() + i];
    if (new Date(Date.UTC(y, m, d)).getUTCDay() === 0) continue;
    const slots = HOURS.map((h) => Date.UTC(y, m, d, h - MSK)).filter((ts) => ts > now + LEAD);
    if (slots.length) days.push({ key: `${y}-${m}-${d}`, noon: new Date(Date.UTC(y, m, d, 12 - MSK)), slots });
  }
  return days;
}

const tzLabel = () => {
  try {
    const part = new Intl.DateTimeFormat("en", { timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName");
    return part?.value ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
};

export default function ContactDialog() {
  const { lang, t } = useI18n();
  const d = t.dialog;
  const locale = lang === "ru" ? "ru-RU" : "en-US";

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("choose");
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [method, setMethod] = useState<Method>("telegram");
  const [reach, setReach] = useState("");
  const [needs, setNeeds] = useState<number[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [days, setDays] = useState<Day[]>([]);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [format, setFormat] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "fail">("idle");
  const [done, setDone] = useState<{ kind: "request" | "call"; summary?: string }>({ kind: "request" });
  const [copied, setCopied] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const honey = useRef<HTMLInputElement>(null);
  const prevH = useRef(0);
  const busy = useRef(false);
  const reduced = useRef(false);

  const fmtDay = useMemo(() => {
    const opt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...o, timeZone: "Europe/Moscow" });
    return { wd: opt({ weekday: "short" }), num: opt({ day: "numeric" }), mon: opt({ month: "short" }), long: opt({ weekday: "short", day: "numeric", month: "short" }) };
  }, [locale]);
  const fmtTime = useMemo(() => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }), [locale]);
  const day = days.find((x) => x.key === dayKey) ?? null;

  /* ---- Opening: any [data-contact] element, or a link to #contact ---- */
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (target: string | null) => {
      if (busy.current) return;
      const next = VIEWS.includes(target as View) ? (target as View) : "choose";
      const fresh = buildDays(Date.now());
      setDays(fresh);
      setDayKey((k) => (fresh.some((x) => x.key === k) ? k : (fresh[0]?.key ?? null)));
      setStatus("idle");
      setErrors({});
      setView(next);
      setOpen(true);
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-contact]");
      if (!el) return;
      e.preventDefault();
      show(el.getAttribute("data-contact"));
    };
    const onEvent = (e: Event) => show((e as CustomEvent<string>).detail ?? null);
    document.addEventListener("click", onClick, true);
    window.addEventListener("contact:open", onEvent);
    if (location.hash === "#contact") show(null);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("contact:open", onEvent);
    };
  }, []);

  /* ---- Enter animation, scroll lock, Escape ---- */
  useLayoutEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.classList.add("modal-open");
    getLenis()?.stop();
    const el = root.current!;
    const phone = window.innerWidth <= 600;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (reduced.current) tl.set(el, { autoAlpha: 1 });
    else
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" })
        .fromTo(
          panel.current,
          phone ? { yPercent: 100 } : { y: 90, scale: 0.94, rotationX: 12, autoAlpha: 0 },
          { yPercent: 0, y: 0, scale: 1, rotationX: 0, autoAlpha: 1, duration: phone ? 0.9 : 1.2, clearProps: "transform" },
          0.05,
        )
        .add(rise(el.querySelectorAll<HTMLElement>(".cd__kicker, .cd__in")), 0.25)
        .from(el.querySelectorAll(".cd__icon-btn"), { autoAlpha: 0, duration: 0.6 }, 0.35);
    panel.current!.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* ---- View change: the panel morphs to the new height while the content slides in ---- */
  useLayoutEffect(() => {
    if (!open || !prevH.current) return;
    const p = panel.current!;
    const h = p.offsetHeight;
    const from = prevH.current;
    prevH.current = 0;
    if (reduced.current) return;
    gsap.fromTo(p, { height: from }, { height: h, duration: 0.7, ease: "expo.out", clearProps: "height" });
    gsap.fromTo(
      stage.current,
      { x: 40 * dir, autoAlpha: 0, filter: "blur(8px)" },
      { x: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out", clearProps: "transform,filter" },
    );
    rise(stage.current!.querySelectorAll<HTMLElement>(".cd__in"), { delay: 0.05 });
    p.scrollTo({ top: 0 });
    if (view === "done") celebrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const go = (next: View, back = false) => {
    if (busy.current || next === view) return;
    setErrors({});
    setStatus("idle");
    const commit = () => {
      prevH.current = panel.current!.offsetHeight;
      setDir(back ? -1 : 1);
      setView(next);
      busy.current = false;
    };
    if (reduced.current) return commit();
    busy.current = true;
    gsap.to(stage.current, {
      x: back ? 40 : -40,
      autoAlpha: 0,
      filter: "blur(8px)",
      duration: 0.28,
      ease: "power2.in",
      onComplete: commit,
    });
  };

  const close = () => {
    if (!root.current || busy.current) return;
    busy.current = true;
    const phone = window.innerWidth <= 600;
    const finish = () => {
      document.documentElement.classList.remove("modal-open");
      getLenis()?.start();
      busy.current = false;
      setOpen(false);
      setView("choose");
    };
    if (reduced.current) return finish();
    gsap
      .timeline({ onComplete: finish })
      .to(panel.current, phone ? { yPercent: 100, duration: 0.5, ease: "power3.in" } : { y: 50, scale: 0.96, autoAlpha: 0, duration: 0.45, ease: "power3.in" })
      .to(root.current, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, 0.1);
  };

  const celebrate = () => {
    const box = root.current?.querySelector(".cd__check");
    if (!box) return;
    gsap.fromTo(box.querySelector("circle"), { strokeDashoffset: 302 }, { strokeDashoffset: 0, duration: 1, ease: "power3.inOut", delay: 0.15 });
    gsap.fromTo(box.querySelector("path"), { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 0.6, ease: "power3.out", delay: 0.85 });
    gsap.from(box, { scale: 0.6, duration: 1.1, ease: "elastic.out(1, 0.5)", delay: 0.1 });
    box.querySelectorAll<HTMLElement>(".cd__spark").forEach((s, i, all) => {
      const a = (i / all.length) * Math.PI * 2 + Math.random() * 0.4;
      const r = 80 + Math.random() * 70;
      gsap.fromTo(
        s,
        { x: 0, y: 0, scale: 1, autoAlpha: 1 },
        { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 0, autoAlpha: 0, duration: 1.1 + Math.random() * 0.5, ease: "expo.out", delay: 0.9 },
      );
    });
  };

  /* ---- Form logic ---- */
  const reachError = () => {
    const v = reach.trim();
    if (!v) return d.required;
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return d.badEmail;
    if ((method === "phone" || method === "whatsapp") && v.replace(/\D/g, "").length < 7) return d.badPhone;
    return "";
  };

  const validate = (kind: "request" | "call") => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = d.required;
    const r = reachError();
    if (r) e.reach = r;
    if (kind === "call" && slot === null) e.slot = d.pick;
    setErrors(e);
    const bad = Object.keys(e);
    if (bad.length && !reduced.current) {
      const fields = bad.map((k) => root.current!.querySelector(`[data-field="${k}"]`)).filter(Boolean);
      gsap.fromTo(fields, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1.2, 0.3)" });
      (fields[0] as HTMLElement | undefined)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    return !bad.length;
  };

  const send = async (kind: "request" | "call") => {
    if (status === "sending" || !validate(kind)) return;
    const msk = (ts: number) =>
      new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" }).format(ts);
    const reachLine = `${t.dialog.methods[method]}: ${reach.trim()}`;
    const fields: Record<string, string> =
      kind === "request"
        ? {
            _subject: `Заявка с сайта — ${name.trim()}`,
            Тип: "Заявка",
            Имя: name.trim(),
            "Куда ответить": reachLine,
            "Что нужно": needs.map((i) => d.needs[i]).join(", ") || "—",
            Бюджет: budget === null ? "—" : d.budgets[budget],
            Сообщение: message.trim() || "—",
          }
        : {
            _subject: `Созвон ${msk(slot!)} МСК — ${name.trim()}`,
            Тип: "Созвон",
            Имя: name.trim(),
            "Куда ответить": reachLine,
            "Когда (МСК)": msk(slot!),
            "Время у клиента": `${fmtTime.format(slot!)} (${tzLabel()}, ${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
            Формат: d.formats[format],
            "О проекте": message.trim() || "—",
          };
    const payload = {
      ...fields,
      "Язык сайта": lang.toUpperCase(),
      _template: "table",
      _captcha: "false",
      _honey: honey.current?.value ?? "",
      ...(method === "email" ? { _replyto: reach.trim() } : {}),
    };
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== "true") throw new Error(json.message || res.statusText);
      setDone({ kind, summary: kind === "call" ? `${fmtDay.long.format(slot!)} · ${fmtTime.format(slot!)}` : undefined });
      setStatus("idle");
      setMessage("");
      setNeeds([]);
      setBudget(null);
      setSlot(null);
      go("done");
    } catch {
      setStatus("fail");
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const spot = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  if (!open) return null;

  const mobile = window.matchMedia("(pointer: coarse)").matches;
  const emailHref = writeEmailHref(d.direct.email.subject);

  /* ---- Pieces ---- */
  const field = (key: string, label: React.ReactNode, control: React.ReactNode, hint?: string) => (
    <div className={`cd__field cd__in${errors[key] ? " is-error" : ""}`} data-field={key}>
      <span className="cd__label">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {control}
      {errors[key] && <span className="cd__error">{errors[key]}</span>}
    </div>
  );

  const contactFields = (
    <div className="cd__row">
        {field(
          "name",
          d.name,
          <input className="cd__input" value={name} onChange={(e) => setName(e.target.value)} placeholder={d.namePh} autoComplete="name" maxLength={80} />,
        )}
        {field(
          "reach",
          d.reach,
          <div className="cd__reach">
            <div className="cd__seg" style={{ "--n": METHODS.length, "--i": METHODS.indexOf(method) } as React.CSSProperties} role="radiogroup" aria-label={d.reach}>
              <span className="cd__seg-thumb" aria-hidden />
              {METHODS.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={method === m} className={method === m ? "is-on" : undefined} onClick={() => setMethod(m)}>
                  {d.methods[m]}
                </button>
              ))}
            </div>
            <input
              className="cd__input"
              value={reach}
              onChange={(e) => setReach(e.target.value)}
              placeholder={d.reachPh[method]}
              inputMode={method === "email" ? "email" : method === "telegram" ? "text" : "tel"}
              autoComplete={method === "email" ? "email" : method === "telegram" ? "off" : "tel"}
              maxLength={120}
            />
          </div>,
        )}
    </div>
  );

  const fail = status === "fail" && (
    <p className="cd__fail cd__in" role="alert">
      {d.fail}{" "}
      <a href={TELEGRAM} target="_blank" rel="noreferrer">
        Telegram
      </a>{" "}
      · <a href={emailHref} target="_blank" rel="noreferrer">
        {EMAIL}
      </a>
    </p>
  );

  const submit = (label: string) => (
    <div className="cd__actions cd__in">
      <button type="submit" className="btn btn--primary cd__submit" disabled={status === "sending"}>
        {status === "sending" ? <span className="cd__spin" aria-hidden /> : null}
        <span className="btn__label">{status === "sending" ? d.sending : label}</span>
        {status !== "sending" && <ArrowRight />}
      </button>
      <p className="cd__note">{d.consent}</p>
      <input ref={honey} type="text" name="_honey" tabIndex={-1} autoComplete="off" className="cd__honey" aria-hidden />
    </div>
  );

  const options: { key: Exclude<View, "choose" | "done">; Icon: typeof SendIcon }[] = [
    { key: "request", Icon: SendIcon },
    { key: "call", Icon: CalendarIcon },
    { key: "direct", Icon: ChatIcon },
  ];

  const kicker = view === "choose" || view === "done" ? d.kicker : d.options[view].title;

  return (
    <div ref={root} className="cd" role="dialog" aria-modal="true" aria-label={d.aria}>
      <div className="cd__backdrop" onClick={close} />
      <div ref={panel} className={`cd__panel cd__panel--${view}`} tabIndex={-1} data-lenis-prevent>
        <span className="cd__glow" aria-hidden />
        <span className="cd__grab" aria-hidden />
        <div className="cd__top">
          {view !== "choose" && view !== "done" ? (
            <button type="button" className="cd__icon-btn" onClick={() => go("choose", true)} aria-label={d.back}>
              <ArrowLeft />
            </button>
          ) : null}
          <p className="cd__kicker">
            <b>/</b> {kicker}
          </p>
          <button type="button" className="cd__icon-btn cd__close" onClick={close} aria-label={d.close}>
            ✕
          </button>
        </div>

        <div ref={stage} className="cd__stage" key={view}>
          {view === "choose" && (
            <>
              <h2 className="cd__title cd__in">{d.title}</h2>
              <p className="cd__lead cd__in">{d.lead}</p>
              <div className="cd__options">
                {options.map(({ key, Icon }, i) => (
                  <button key={key} type="button" className={`cd__opt cd__in cd__opt--${key}`} onClick={() => go(key)} onPointerMove={spot}>
                    <span className="cd__opt-icon">
                      <Icon />
                    </span>
                    <span className="cd__opt-num">0{i + 1}</span>
                    <span className="cd__opt-body">
                      <span className="cd__opt-title">{d.options[key].title}</span>
                      <span className="cd__opt-text">{d.options[key].text}</span>
                    </span>
                    <span className="cd__opt-foot">
                      <span className="cd__opt-meta">{d.options[key].meta}</span>
                      <span className="cd__opt-arrow">
                        <ArrowRight />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {view === "request" && (
            <form
              className="cd__form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                send("request");
              }}
            >
              <p className="cd__lead cd__in">{d.options.request.text}</p>
              {contactFields}
              {field(
                "needs",
                d.need,
                <div className="cd__chips">
                  {d.needs.map((n, i) => (
                    <button
                      key={n}
                      type="button"
                      className="cd__chip"
                      aria-pressed={needs.includes(i)}
                      onClick={() => setNeeds((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]))}
                    >
                      <i aria-hidden>✓</i>
                      {n}
                    </button>
                  ))}
                </div>,
              )}
              {field(
                "budget",
                d.budget,
                <div className="cd__chips">
                  {d.budgets.map((b, i) => (
                    <button key={b} type="button" className="cd__chip" aria-pressed={budget === i} onClick={() => setBudget((v) => (v === i ? null : i))}>
                      <i aria-hidden>✓</i>
                      {b}
                    </button>
                  ))}
                </div>,
                d.optional,
              )}
              {field(
                "message",
                d.message,
                <textarea className="cd__input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={d.messagePh} rows={4} maxLength={3000} />,
              )}
              {fail}
              {submit(d.send)}
            </form>
          )}

          {view === "call" && (
            <form
              className="cd__form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                send("call");
              }}
            >
              <p className="cd__lead cd__in">{d.options.call.text}</p>
              {field(
                "day",
                d.day,
                <div className="cd__days" data-lenis-prevent>
                  {days.map((x) => (
                    <button
                      key={x.key}
                      type="button"
                      className={`cd__day${x.key === dayKey ? " is-on" : ""}`}
                      aria-pressed={x.key === dayKey}
                      onClick={() => {
                        setDayKey(x.key);
                        setSlot(null);
                      }}
                    >
                      <small>{fmtDay.wd.format(x.noon)}</small>
                      <b>{fmtDay.num.format(x.noon)}</b>
                      <span>{fmtDay.mon.format(x.noon)}</span>
                    </button>
                  ))}
                </div>,
              )}
              {field(
                "slot",
                d.time,
                day ? (
                  <div className="cd__slots" key={day.key}>
                    {day.slots.map((ts) => (
                      <button key={ts} type="button" className={`cd__slot${slot === ts ? " is-on" : ""}`} aria-pressed={slot === ts} onClick={() => setSlot(ts)}>
                        {fmtTime.format(ts)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="cd__note">{d.noSlots}</p>
                ),
                d.tz(tzLabel()),
              )}
              {field(
                "format",
                d.format,
                <div className="cd__seg" style={{ "--n": d.formats.length, "--i": format } as React.CSSProperties} role="radiogroup" aria-label={d.format}>
                  <span className="cd__seg-thumb" aria-hidden />
                  {d.formats.map((f, i) => (
                    <button key={f} type="button" role="radio" aria-checked={format === i} className={format === i ? "is-on" : undefined} onClick={() => setFormat(i)}>
                      {f}
                    </button>
                  ))}
                </div>,
              )}
              {contactFields}
              {field(
                "message",
                d.about,
                <textarea className="cd__input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={d.aboutPh} rows={3} maxLength={3000} />,
                d.optionalAbout,
              )}
              {fail}
              {submit(slot !== null ? `${d.book} · ${fmtDay.long.format(slot)}, ${fmtTime.format(slot)}` : d.book)}
            </form>
          )}

          {view === "direct" && (
            <>
              <p className="cd__lead cd__in">{d.options.direct.text}</p>
              <div className="cd__direct">
                <a className="cd__dm cd__in" href={TELEGRAM} target="_blank" rel="noreferrer" onPointerMove={spot}>
                  <span className="cd__opt-icon">
                    <TelegramIcon />
                  </span>
                  <span>
                    <span className="cd__dm-title">Telegram</span>
                    <span className="cd__dm-sub">
                      @{handleOf(TELEGRAM)} · {d.direct.telegram.text}
                    </span>
                  </span>
                  <span className="cd__pill cd__pill--red">
                    {d.direct.telegram.action} <ArrowRight />
                  </span>
                </a>
                <div className="cd__dm cd__in" onPointerMove={spot}>
                  <span className="cd__opt-icon">
                    <PhoneIcon />
                  </span>
                  <span>
                    <span className="cd__dm-title">{d.direct.phone.title}</span>
                    <span className="cd__dm-sub">
                      {PHONE_LABEL} · {d.direct.phone.text}
                    </span>
                  </span>
                  <span className="cd__dm-actions">
                    <a className="cd__pill" href={`tel:${PHONE}`}>
                      <PhoneIcon /> {d.direct.phone.call}
                    </a>
                    <a className="cd__pill cd__pill--red" href={WHATSAPP} target="_blank" rel="noreferrer">
                      <WhatsappIcon /> {d.direct.phone.whatsapp}
                    </a>
                  </span>
                </div>
                <div className="cd__dm cd__in" onPointerMove={spot}>
                  <span className="cd__opt-icon">
                    <MailIcon />
                  </span>
                  <span>
                    <span className="cd__dm-title">{d.methods.email}</span>
                    <span className="cd__dm-sub">
                      {EMAIL} · {d.direct.email.text}
                    </span>
                  </span>
                  <span className="cd__dm-actions">
                    <button type="button" className="cd__pill" onClick={copyEmail}>
                      <CopyIcon /> {copied ? t.contact.copied : t.contact.copy}
                    </button>
                    <a className="cd__pill cd__pill--red" href={emailHref} target="_blank" rel="noreferrer">
                      {mobile ? d.direct.email.actionMobile : d.direct.email.action} <ArrowRight />
                    </a>
                  </span>
                  {!mobile && <span className="cd__dm-hint">{d.direct.email.hint}</span>}
                </div>
              </div>
              <p className="cd__reply cd__in">
                <span className="clock__dot" /> {t.contact.reply}
              </p>
            </>
          )}

          {view === "done" && (
            <div className="cd__done">
              <div className="cd__check cd__in">
                <svg viewBox="0 0 100 100" aria-hidden>
                  <circle cx="50" cy="50" r="48" strokeDasharray="302" />
                  <path d="M31 51.5 44 64l26-28" strokeDasharray="60" />
                </svg>
                {Array.from({ length: 14 }, (_, i) => (
                  <i key={i} className="cd__spark" />
                ))}
              </div>
              <h2 className="cd__title cd__in">{d.done[done.kind].title}</h2>
              <p className="cd__lead cd__in">{d.done[done.kind].text}</p>
              {done.summary && (
                <p className="cd__summary cd__in">
                  <CalendarIcon /> {done.summary}
                </p>
              )}
              <button type="button" className="btn btn--ghost cd__in" onClick={close}>
                <span className="btn__label">{d.toSite}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
