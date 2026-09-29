"use client";

import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Declarative scroll animations driven by data attributes:
 *  data-split          — headline revealed line by line through a mask
 *  data-reveal         — fade/slide up (value = delay in seconds)
 *  data-stagger        — children marked with data-item appear one by one ("pop" = scale in)
 *  data-speed          — scrubbed parallax (value = fraction of half the viewport height, may be negative)
 *  data-zoom           — scrubbed background zoom-out
 */
export default function ScrollAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 115,
              rotate: 2.5,
              transformOrigin: "0% 100%",
              duration: 1.35,
              ease: "expo.out",
              stagger: 0.11,
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            });
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 48,
          autoAlpha: 0,
          duration: 1.2,
          delay: parseFloat(el.dataset.reveal || "0") || 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const pop = group.dataset.stagger === "pop";
        gsap.from(group.querySelectorAll("[data-item]"), {
          y: pop ? 0 : 50,
          scale: pop ? 0.4 : 1,
          autoAlpha: 0,
          duration: pop ? 1.1 : 1.2,
          ease: pop ? "back.out(1.8)" : "power3.out",
          stagger: { each: pop ? 0.09 : 0.14, from: pop ? "random" : "start" },
          scrollTrigger: {
            trigger: group,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0");
        gsap.fromTo(
          el,
          { y: () => -speed * window.innerHeight * 0.5 },
          {
            y: () => speed * window.innerHeight * 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") || el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-zoom]").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1.25 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") || el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      ScrollTrigger.refresh();
    });
  });

  return null;
}
