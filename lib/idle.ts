let pending: Promise<void> | null = null;

/** Resolves once the page has loaded and the main thread has had a moment to breathe after hydration. */
export const whenIdle = () =>
  (pending ??= new Promise<void>((resolve) => {
    const idle = () => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(() => requestAnimationFrame(() => resolve()), { timeout: 1200 });
      else setTimeout(resolve, 250);
    };
    const loaded = () => (document.fonts?.ready ?? Promise.resolve()).then(idle);
    if (document.readyState === "complete") loaded();
    else window.addEventListener("load", loaded, { once: true });
  }));
