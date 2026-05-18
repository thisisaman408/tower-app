import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatImpact(impact: number): { color: string; label: string } {
  if (impact >= 80) return { color: "text-red-400", label: "Critical" };
  if (impact >= 60) return { color: "text-orange-400", label: "High" };
  if (impact >= 40) return { color: "text-yellow-400", label: "Medium" };
  return { color: "text-zinc-400", label: "Low" };
}

export function impactColor(impact: number): string {
  if (impact >= 80) return "oklch(0.68 0.24 25)";
  if (impact >= 60) return "oklch(0.75 0.20 50)";
  if (impact >= 40) return "oklch(0.82 0.20 85)";
  return "oklch(0.55 0 0)";
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function signalTypeLabel(type: string): string {
  const map: Record<string, string> = {
    pricing_tier: "Pricing",
    feature_change: "Feature",
    hiring_role: "Hiring",
    headcount_metric: "Headcount",
    blog_post: "Blog",
    release_note: "Release",
    partnership: "Partnership",
    customer_win: "Customer Win",
    funding_round: "Funding",
    leadership_change: "Leadership",
    case_study: "Case Study",
    product_launch: "Product Launch",
  };
  return map[type] ?? type;
}

export function signalTypeColor(type: string): string {
  const map: Record<string, string> = {
    pricing_tier: "oklch(0.82 0.20 85)",
    feature_change: "oklch(0.72 0.16 240)",
    hiring_role: "oklch(0.71 0.22 145)",
    headcount_metric: "oklch(0.71 0.22 145)",
    blog_post: "oklch(0.72 0.16 240)",
    release_note: "oklch(0.72 0.16 240)",
    partnership: "oklch(0.80 0.18 300)",
    customer_win: "oklch(0.71 0.22 145)",
    funding_round: "oklch(0.68 0.24 25)",
    leadership_change: "oklch(0.68 0.24 25)",
    case_study: "oklch(0.71 0.22 145)",
    product_launch: "oklch(0.68 0.24 25)",
  };
  return map[type] ?? "oklch(0.55 0 0)";
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "…";
}

export function generateShareToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 22 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
