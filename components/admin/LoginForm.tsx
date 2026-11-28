
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Feedback } from "./AdminUI";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Unable to sign in.");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <fieldset disabled={loading} className="grid min-w-0 gap-4">
        <label className="ad-field">
          Email
          <input className="ad-input" required type="email" name="email" autoComplete="username" spellCheck={false} onChange={() => setError("")} />
        </label>
        <div className="ad-field">
          <label htmlFor="owner-password">Password</label>
          <div className="flex gap-2">
            <input id="owner-password" className="ad-input" required type={visible ? "text" : "password"} name="password" autoComplete="current-password" onChange={() => setError("")} />
            <button type="button" className="ad-button ad-icon-button" aria-label={visible ? "Hide password" : "Show password"} aria-controls="owner-password" onClick={() => setVisible(!visible)}>
              {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>
      </fieldset>
      {error && <Feedback tone="error">{error}</Feedback>}
      <button type="submit" disabled={loading} className="ad-button ad-primary w-full">
        {loading && <LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" />}
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
