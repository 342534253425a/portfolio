import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import SignalLine from "@/components/SignalLine";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollAnimations from "@/components/ScrollAnimations";
import ContactDialog from "@/components/ContactDialog";
import Preloader from "@/components/fx/Preloader";
import Cursor from "@/components/fx/Cursor";
import FxCanvas from "@/components/fx/FxCanvas";
import Interactions from "@/components/fx/Interactions";
import Marquee from "@/components/fx/Marquee";
import ScrollProgress from "@/components/fx/ScrollProgress";
import { I18nProvider, type Lang } from "@/lib/i18n";

export default function Site({ lang }: { lang: Lang }) {
  return (
    <I18nProvider lang={lang}>
      <SmoothScroll />
      <Preloader />
      <FxCanvas />
      <Header />
      <main className="page">
        <SignalLine />
        <Hero />
        <Stack />
        <Projects />
        <Marquee />
        <Process />
        <Contact />
      </main>
      <ScrollProgress />
      <ScrollAnimations />
      <Interactions />
      <Cursor />
      <ContactDialog />
      <div className="grain" aria-hidden />
    </I18nProvider>
  );
}
