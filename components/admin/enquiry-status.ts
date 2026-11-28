
import type { EnquiryStatus } from "@prisma/client";

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTATION_SENT: "Quotation sent",
  IN_PROGRESS: "In progress",
  CONVERTED: "Converted",
  CLOSED: "Closed",
  NOT_INTERESTED: "Not interested",
};

export const enquiryStatuses = Object.keys(enquiryStatusLabels) as EnquiryStatus[];
