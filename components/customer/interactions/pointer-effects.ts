const excluded = "input, textarea, select, [contenteditable]:not([contenteditable='false']), form, iframe, embed, object, dialog, [role='dialog']";
const proximity = 64;

export function mountPointerEffects(root: HTMLElement, cursor: HTMLElement) {
  let pointer: { x: number; y: number } | undefined;
  let target: Element | null = null;
  let cursorX = 0;
  let cursorY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let previousTime = 0;
  let frame = 0;
  let dirty = true;
  let magnet: HTMLElement | null = null;
  let spotlight: HTMLElement | null = null;
  let tiltedCard: HTMLElement | null = null;
  let lastEffectX = -1;
  let lastEffectY = -1;
  const visible = new Set<HTMLElement>();
  const watched = new Set<HTMLElement>();
  const lit = new Set<HTMLElement>();
  const bounds = new Map<HTMLElement, DOMRect>();

  function schedule() {
    if (!frame && pointer && !document.hidden) frame = requestAnimationFrame(update);
  }

  function invalidate() {
    dirty = true;
    schedule();
  }

  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      const glow = target as HTMLElement;
      if (isIntersecting && watched.has(glow)) visible.add(glow);
      else visible.delete(glow);
    }
    invalidate();
  }, { rootMargin: "64px" });

  function syncGlows() {
    for (const glow of watched) {
      if (root.contains(glow)) continue;
      observer.unobserve(glow);
      watched.delete(glow);
      visible.delete(glow);
      lit.delete(glow);
    }
    root.querySelectorAll<HTMLElement>("[data-edge-glow]").forEach((glow) => {
      if (watched.has(glow)) return;
      watched.add(glow);
      observer.observe(glow);
    });
    invalidate();
  }

  const changes = new MutationObserver(syncGlows);
  const resize = new ResizeObserver(invalidate);
  changes.observe(root, { childList: true, subtree: true });
  resize.observe(root);
  syncGlows();

  function resetTilt(card: HTMLElement | null) {
    card?.style.removeProperty("--card-rx");
    card?.style.removeProperty("--card-ry");
  }

  function clearEffects() {
    cursor.removeAttribute("data-visible");
    cursor.removeAttribute("data-mode");
    magnet?.style.removeProperty("translate");
    spotlight?.removeAttribute("data-lit");
    resetTilt(tiltedCard);
    magnet = spotlight = tiltedCard = null;
    lastEffectX = lastEffectY = -1;
    for (const glow of lit) glow.removeAttribute("data-lit");
    lit.clear();
  }

  function reset() {
    pointer = undefined;
    target = null;
    previousTime = velocityX = velocityY = 0;
    cancelAnimationFrame(frame);
    frame = 0;
    clearEffects();
  }

  function update(time: number) {
    frame = 0;
    if (!pointer) return;
    const { x, y } = pointer;
    const updateEffects = dirty || x !== lastEffectX || y !== lastEffectY;
    if (dirty) {
      // Scrolling can change the target without dispatching pointermove.
      target = document.elementFromPoint(x, y);
      bounds.clear();
      for (const glow of visible) bounds.set(glow, glow.getBoundingClientRect());
      dirty = false;
    }
    if (!target || !root.contains(target) || target.closest(excluded)) {
      reset();
      return;
    }

    if (!cursor.hasAttribute("data-visible")) {
      cursorX = x;
      cursorY = y;
      cursor.dataset.visible = "";
    }

    // A damped spring settles on demand instead of running between gestures.
    const step = Math.min((time - (previousTime || time - 16)) / 1000, 0.02);
    previousTime = time;
    velocityX = (velocityX + (x - cursorX) * 480 * step) * Math.exp(-30 * step);
    velocityY = (velocityY + (y - cursorY) * 480 * step) * Math.exp(-30 * step);
    cursorX += velocityX * step;
    cursorY += velocityY * step;

    if (updateEffects) {
      lastEffectX = x;
      lastEffectY = y;
      updatePointerStyles(x, y, target);
    }

    const moving = Math.hypot(x - cursorX, y - cursorY) > 0.25 || Math.hypot(velocityX, velocityY) > 2;
    cursor.style.transform = `translate3d(${moving ? cursorX : x}px, ${moving ? cursorY : y}px, 0)`;
    if (moving) schedule();
    else previousTime = velocityX = velocityY = 0;
  }

  function updatePointerStyles(x: number, y: number, element: Element) {
    const button = element.closest("a, button");
    const mode = element.closest<HTMLElement>("[data-cursor]")?.dataset.cursor || (button ? "action" : "");
    if (cursor.dataset.mode !== mode) cursor.dataset.mode = mode;
    cursor.toggleAttribute("data-flipped", window.innerWidth - x < 88);

    const nextMagnet = button?.querySelector<HTMLElement>("[data-magnetic]") ?? null;
    const magneticBounds = nextMagnet ? button?.getBoundingClientRect() : null;
    const nextSpotlight = element.closest<HTMLElement>("[data-spotlight]");
    const spotlightBounds = nextSpotlight?.getBoundingClientRect();
    const nextCard = element.closest<HTMLElement>(".sample-interactive, .product-card");
    const cardBounds = nextCard?.getBoundingClientRect();

    for (const [glow, rect] of bounds) {
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const distance = Math.hypot(dx, dy);
      if (distance < proximity) {
        glow.style.setProperty("--edge-x", `${x - rect.left}px`);
        glow.style.setProperty("--edge-y", `${y - rect.top}px`);
        glow.style.setProperty("--edge-strength", String(1 - distance / proximity));
        if (!lit.has(glow)) glow.dataset.lit = "";
        lit.add(glow);
      } else if (lit.delete(glow)) {
        glow.removeAttribute("data-lit");
      }
    }
    for (const glow of lit) {
      if (bounds.has(glow)) continue;
      glow.removeAttribute("data-lit");
      lit.delete(glow);
    }

    if (nextMagnet !== magnet) magnet?.style.removeProperty("translate");
    magnet = nextMagnet;
    if (magnet && magneticBounds) {
      const rect = magneticBounds;
      const magneticX = Math.max(-6, Math.min(6, (x - rect.left - rect.width / 2) * 0.12));
      const magneticY = Math.max(-5, Math.min(5, (y - rect.top - rect.height / 2) * 0.21));
      magnet.style.translate = `${magneticX}px ${magneticY}px`;
    }

    if (nextSpotlight !== spotlight) spotlight?.removeAttribute("data-lit");
    spotlight = nextSpotlight;
    if (spotlight && spotlightBounds) {
      const rect = spotlightBounds;
      spotlight.style.setProperty("--spot-x", `${x - rect.left}px`);
      spotlight.style.setProperty("--spot-y", `${y - rect.top}px`);
      if (!spotlight.hasAttribute("data-lit")) spotlight.dataset.lit = "";
    }

    if (nextCard !== tiltedCard) resetTilt(tiltedCard);
    tiltedCard = nextCard;
    if (tiltedCard && cardBounds) {
      const horizontal = (x - cardBounds.left) / cardBounds.width - .5;
      const vertical = (y - cardBounds.top) / cardBounds.height - .5;
      tiltedCard.style.setProperty("--card-rx", `${-vertical * 5}deg`);
      tiltedCard.style.setProperty("--card-ry", `${horizontal * 5}deg`);
    }
  }

  function move(event: PointerEvent) {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
      reset();
      return;
    }
    const element = event.target;
    if (!(element instanceof Element) || !root.contains(element) || element.closest(excluded)) {
      reset();
      return;
    }
    target = element;
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  }

  function resetOnTouch(event: PointerEvent) {
    if (event.pointerType === "touch") reset();
  }

  function leave(event: PointerEvent) {
    const next = event.relatedTarget;
    if (!next || (next instanceof Element && next.closest(excluded))) reset();
  }

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerout", leave);
  window.addEventListener("pointerdown", resetOnTouch, { passive: true });
  window.addEventListener("pointercancel", reset);
  window.addEventListener("blur", reset);
  window.addEventListener("scroll", invalidate, { passive: true, capture: true });
  window.addEventListener("resize", invalidate, { passive: true });
  document.addEventListener("visibilitychange", reset);
  root.addEventListener("customer:navigate", reset);
  return () => {
    reset();
    changes.disconnect();
    observer.disconnect();
    resize.disconnect();
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerout", leave);
    window.removeEventListener("pointerdown", resetOnTouch);
    window.removeEventListener("pointercancel", reset);
    window.removeEventListener("blur", reset);
    window.removeEventListener("scroll", invalidate, true);
    window.removeEventListener("resize", invalidate);
    document.removeEventListener("visibilitychange", reset);
    root.removeEventListener("customer:navigate", reset);
  };
}