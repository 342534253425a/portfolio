"use client";

/** Fire sparks from a viewport point on the shared particle canvas. */
export const burst = (x: number, y: number, n = 26) =>
  window.dispatchEvent(new CustomEvent("fx:burst", { detail: { x, y, n } }));

/** Kick the star field into a warp streak (negative = stars fly down). */
export const warp = (amount: number) => window.dispatchEvent(new CustomEvent("fx:warp", { detail: amount }));

export const burstFrom = (el: Element, n?: number) => {
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, n);
};
