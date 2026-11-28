
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function Brand() {
  return <span className="ad-brand"><img src="/images/logo1.png" width="40" height="40" alt="" /> Sharda Offset</span>;
}

export function PageHeader({ title, description, back, actions }: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <header className="ad-page-header">
      <div className="min-w-0">
        {back && <Link href={back.href} className="ad-back"><ArrowLeft size={16} aria-hidden="true" />{back.label}</Link>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </header>
  );
}

export function Feedback({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "error" | "success" }) {
  return <p className="ad-feedback" data-tone={tone} role={tone === "error" ? "alert" : "status"}>{children}</p>;
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="ad-empty ad-pad"><p>{children}</p>{action}</div>;
}

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className="ad-badge" data-tone={tone}>{children}</span>;
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="ad-card ad-pad ad-form-section">
      <div>
        <h2 className="ad-section-title">{title}</h2>
        {description && <p className="ad-muted mt-1 text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}
