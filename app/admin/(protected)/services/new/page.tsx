import Link from "next/link";
import ServiceForm from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/services"
          className="text-sm text-[#7d2635] hover:underline"
        >
          ← Back to services
        </Link>

        <h1 className="mt-3 text-3xl font-semibold text-[#272321]">
          Add service
        </h1>
      </div>

      <ServiceForm />
    </div>
  );
}
