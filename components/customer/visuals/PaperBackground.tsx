import type { ReactNode } from "react";

export function PaperBackground({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <div aria-hidden={children ? undefined : true} className={`paper-background ${className}`}>{children}</div>;
}
