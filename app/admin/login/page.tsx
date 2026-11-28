
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/admin/AdminUI";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="ad-login">
      <div className="ad-card ad-login-card">
        <Brand />
        <div className="ad-page-header mt-6 mb-5">
          <div>
            <h1>Owner Login</h1>
            <p>Sign in to manage Sharda Offset.</p>
          </div>
        </div>
        <LoginForm />
        <Link href="/" className="ad-back mt-3"><ArrowLeft size={16} aria-hidden="true" /> Back to website</Link>
      </div>
    </main>
  );
}
