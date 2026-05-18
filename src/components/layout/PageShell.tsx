import { NavBar } from "./NavBar";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageShell({ children, className, fullWidth }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[oklch(0.13_0_0)]">
      <NavBar />
      <main className={cn("pt-14", className)}>
        <div className={cn(fullWidth ? "w-full" : "max-w-7xl mx-auto px-6 py-8")}>
          {children}
        </div>
      </main>
    </div>
  );
}
