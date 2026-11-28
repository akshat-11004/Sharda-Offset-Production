
"use client";

import type { EnquiryStatus } from "@prisma/client";
import { enquiryStatuses, enquiryStatusLabels } from "./enquiry-status";

export default function EnquiryStatusForm({ status, disabled, onChange }: {
  status: EnquiryStatus;
  disabled: boolean;
  onChange: (status: EnquiryStatus) => void;
}) {
  return (
    <label className="ad-field w-full sm:w-52">
      Update status
      <select className="ad-select" value={status} disabled={disabled} onChange={(event) => onChange(event.target.value as EnquiryStatus)}>
        {enquiryStatuses.map((value) => <option key={value} value={value}>{enquiryStatusLabels[value]}</option>)}
      </select>
    </label>
  );
}
