import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import SignalLine from "@/components/SignalLine";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollAnimations from "@/components/ScrollAnimations";
import CursorGlow from "@/components/CursorGlow";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <CursorGlow />
      <Header />
      <main className="page">
        <SignalLine />
        <Hero />
        <Stack />
        <Projects />
        <Process />
        <Contact />
      </main>
      <ScrollAnimations />
      <div className="grain" aria-hidden />
    </>
  );
}
