import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import SignalLine from "@/components/SignalLine";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollAnimations from "@/components/ScrollAnimations";
import Preloader from "@/components/fx/Preloader";
import Cursor from "@/components/fx/Cursor";
import FxCanvas from "@/components/fx/FxCanvas";
import Interactions from "@/components/fx/Interactions";
import Marquee from "@/components/fx/Marquee";
import ScrollProgress from "@/components/fx/ScrollProgress";

export default function Home() {
  return (
    <>
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
      <div className="grain" aria-hidden />
    </>
  );
}
