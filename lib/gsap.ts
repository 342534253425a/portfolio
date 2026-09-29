"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, ScrambleTextPlugin, useGSAP);}

export { gsap, ScrollTrigger, SplitText, Draggable, InertiaPlugin, useGSAP };

/** True on devices with a precise pointer (mouse / trackpad). */
export const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
