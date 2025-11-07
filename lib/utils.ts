import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
