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
