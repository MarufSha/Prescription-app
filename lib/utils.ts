import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FormValues } from "@/lib/prescription-form";
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
export async function downloadPrescriptionFromServer(values: FormValues) {
  const res = await fetch("/api/prescription-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Failed to generate PDF:", res.status, msg);
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Prescription_${values.name || "Patient"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
export const DRAFT_KEY = "prescription_draft";