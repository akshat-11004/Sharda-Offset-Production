
import ServiceForm from "@/components/admin/ServiceForm";
import { PageHeader } from "@/components/admin/AdminUI";

export default function NewServicePage() {
  return (
    <div className="ad-page">
      <PageHeader title="Add service" back={{ href: "/admin/services", label: "Services" }} />
      <ServiceForm />
    </div>
  );
}
