"use client";

import { useEffect, useRef } from "react";

export function StaticHeroArtwork() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      node.style.setProperty("--pointer-x", `${((event.clientX - box.left) / box.width - .5) * 7}deg`);
      node.style.setProperty("--pointer-y", `${((event.clientY - box.top) / box.height - .5) * -7}deg`);
    };
    const reset = () => { node.style.setProperty("--pointer-x", "0deg"); node.style.setProperty("--pointer-y", "0deg"); };
    node.addEventListener("pointermove", move); node.addEventListener("pointerleave", reset);
    return () => { node.removeEventListener("pointermove", move); node.removeEventListener("pointerleave", reset); };
  }, []);
  return <div ref={ref} className="hero-art hero-composition" aria-label="Layered stationery and invitation artwork">
    <div className="hero-glow" />
    <div className="paper-sheet paper-sheet-back" />
    <div className="paper-sheet paper-invitation">
      <div className="paper-border"><p>A celebration of</p><h2 className="display">Togetherness</h2><span>INVITATION · DESIGN · PRINT</span></div>
    </div>
    <div className="paper-sheet paper-card"><p>PRINT BEAUTIFULLY</p><strong className="display">Make it<br />memorable.</strong></div>
    <div className="gold-seal">SO</div><span className="crafted-label">Crafted locally</span>
  </div>;
}
