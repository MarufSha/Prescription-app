import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FormValues } from "@/lib/prescription-form";

export const DRAFT_KEY = "prescription_draft";
export const LS_KEY = "prescriptions:v1";
export const ID_SEQ_KEY = "prescriptions:id-seq";
export const PATIENTS_KEY = "patients";
export const NEXT_PUID_KEY = "nextPatientId";
export const DOCTORS_KEY = "doctors:v1";
export const DOCTOR_ID_SEQ_KEY = "doctors:id-seq";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getTitle = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return segment
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};
export function formatDate(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function isValidDate(date: Date | undefined): boolean {
  return !!date && !isNaN(date.getTime());
}

export function todayFormatted(): string {
  return formatDate(new Date());
}
export async function downloadPrescriptionFromServer(
  data: FormValues & { puid?: number; followupDays?: number }
) {
  const response = await fetch("/api/prescription-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Failed to generate prescription PDF", response.status, text);
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const puidPart =
    typeof data.puid === "number"
      ? `P-${String(data.puid).padStart(4, "0")}`
      : "P-XXXX";

  const namePart =
    data.name?.trim().length > 0
      ? data.name.trim().replace(/\s+/g, "_")
      : "Patient";

  const fileName = `${puidPart}_${namePart}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export function normalizeMobile(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }
  return trimmed.replace(/\D/g, "");
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
