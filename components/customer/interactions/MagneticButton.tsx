import type { ReactNode } from "react";

export function MagneticButton({ children }: { children: ReactNode }) {
  return <span className="magnetic-content" data-magnetic>{children}</span>;
}
