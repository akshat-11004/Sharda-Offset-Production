import Lenis from "lenis";

export function mountSmoothScroll(root: HTMLElement) {
  const lenis = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    syncTouch: false,
    lerp: 0.13,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
    virtualScroll: ({ event }) => event.type === "wheel" && !root.querySelector("dialog[open], .mobile-nav[data-open]"),
    prevent: (node) => node.matches("dialog, [role='dialog'], [data-native-scroll], input, textarea, select, [contenteditable]"),
  });
  let frame = 0;
  let previousFrame = 0;
  let scrollClock = 1;
  lenis.raf(scrollClock);

  function tick(time: number) {
    frame = 0;
    // Time spent idle should not count toward a new wheel gesture.
    scrollClock += previousFrame ? Math.min(time - previousFrame, 32) : 16;
    lenis.raf(scrollClock);
    if (lenis.isScrolling === "smooth" && !document.hidden) {
      previousFrame = time;
      frame = requestAnimationFrame(tick);
    } else {
      previousFrame = 0;
    }
  }

  function wake() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function settle() {
    cancelAnimationFrame(frame);
    frame = previousFrame = 0;
    // Let the browser and Next.js own scrolling for history and fragment navigation.
    lenis.stop();
    lenis.start();
  }

  const unsubscribe = lenis.on("virtual-scroll", wake);
  root.addEventListener("customer:navigate", settle);
  window.addEventListener("popstate", settle);
  window.addEventListener("hashchange", settle);
  document.addEventListener("visibilitychange", settle);
  return () => {
    unsubscribe();
    root.removeEventListener("customer:navigate", settle);
    window.removeEventListener("popstate", settle);
    window.removeEventListener("hashchange", settle);
    document.removeEventListener("visibilitychange", settle);
    cancelAnimationFrame(frame);
    lenis.destroy();
  };
}