"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { mountPointerEffects } from "../interactions/pointer-effects";
import { mountSmoothScroll } from "./smooth-scroll";

const fineMotion = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function CustomerMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const root = scope.current;
    const follower = cursor.current;
    if (!root || !follower) return;

    const desktop = matchMedia(fineMotion);
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    const observed = new Set<HTMLElement>();
    const seen = new WeakSet<HTMLElement>();
    let disposeDesktop: (() => void) | undefined;

    const reveals = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (!entry.isIntersecting) continue;
        seen.add(element);
        if (motion.matches && !document.hidden) element.dataset.revealed = "";
        reveals.unobserve(element);
        observed.delete(element);
      }
    });

    function syncReveals() {
      for (const element of observed) {
        if (root!.contains(element)) continue;
        reveals.unobserve(element);
        observed.delete(element);
      }
      root!.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        if (observed.has(element) || seen.has(element)) return;
        observed.add(element);
        reveals.observe(element);
      });
    }

    function syncDesktop() {
      disposeDesktop?.();
      disposeDesktop = undefined;
      if (!desktop.matches) return;
      const disposePointer = mountPointerEffects(root!, follower!);
      const disposeScroll = mountSmoothScroll(root!);
      disposeDesktop = () => {
        disposePointer();
        disposeScroll();
      };
    }

    const changes = new MutationObserver(syncReveals);
    changes.observe(root, { childList: true, subtree: true });
    syncReveals();
    syncDesktop();
    desktop.addEventListener("change", syncDesktop);
    return () => {
      desktop.removeEventListener("change", syncDesktop);
      disposeDesktop?.();
      changes.disconnect();
      reveals.disconnect();
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const root = scope.current;
    root?.dispatchEvent(new Event("customer:navigate"));
    if (location.hash || document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = root?.querySelector(".customer-page main > section");
    const mobile = matchMedia("(pointer: coarse)").matches;
    const animation = section?.animate(
      [{ opacity: 0.72, translate: mobile ? "0 4px" : "0 9px" }, { opacity: 1, translate: "none" }],
      { duration: mobile ? 210 : 320, easing: "cubic-bezier(.22, 1, .36, 1)" },
    );
    return () => animation?.cancel();
  }, [pathname]);

  return (
    <div className="customer-site" ref={scope}>
      {children}
      <div className="catalogue-cursor" ref={cursor} aria-hidden="true">
        <span />
      </div>
    </div>
  );
}