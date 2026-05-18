"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Eye, Shield, Bell, BarChart2, Settings, Zap, Network, LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

const STATIC_NAV_ITEMS = [
  { href: "/demo/extract", label: "Live Extract", icon: Zap },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/security/lobster", label: "Lobster Trap", icon: Shield },
  { href: "/settings/keys", label: "Settings", icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const dashboardHref = "/watchlists";
  const graphHref = "/watchlists";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[oklch(0.22_0_0)] bg-[oklch(0.13_0_0/0.92)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center h-14 gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[oklch(0.72_0.16_240)] flex items-center justify-center">
            <span className="text-xs font-bold text-[oklch(0.13_0_0)]">T</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Tower</span>
          <span className="text-[oklch(0.38_0_0)] text-xs font-mono">v0.1</span>
        </Link>
        <nav className="flex items-center gap-1 flex-1">
          {/* Dashboard - dynamic watchlist */}
          <Link
            href={dashboardHref}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
              pathname.startsWith("/watchlists")
                ? "bg-[oklch(0.72_0.16_240/0.12)] text-[oklch(0.72_0.16_240)] border border-[oklch(0.72_0.16_240/0.2)]"
                : "text-[oklch(0.55_0_0)] hover:text-[oklch(0.80_0_0)] hover:bg-[oklch(0.17_0_0)]"
            )}
          >
            <BarChart2 size={13} />
            Dashboard
          </Link>
          {/* KG Graph - resolved dynamically via watchlist redirect */}
          <Link
            href={graphHref}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
              pathname.includes("/graph")
                ? "bg-[oklch(0.72_0.16_240/0.12)] text-[oklch(0.72_0.16_240)] border border-[oklch(0.72_0.16_240/0.2)]"
                : "text-[oklch(0.55_0_0)] hover:text-[oklch(0.80_0_0)] hover:bg-[oklch(0.17_0_0)]"
            )}
          >
            <Network size={13} />
            KG Graph
          </Link>
          <Link
            href="/briefs"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
              pathname.startsWith("/briefs")
                ? "bg-[oklch(0.72_0.16_240/0.12)] text-[oklch(0.72_0.16_240)] border border-[oklch(0.72_0.16_240/0.2)]"
                : "text-[oklch(0.55_0_0)] hover:text-[oklch(0.80_0_0)] hover:bg-[oklch(0.17_0_0)]"
            )}
          >
            <Eye size={13} />
            Briefs
          </Link>
          {STATIC_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                  active
                    ? "bg-[oklch(0.72_0.16_240/0.12)] text-[oklch(0.72_0.16_240)] border border-[oklch(0.72_0.16_240/0.2)]"
                    : "text-[oklch(0.55_0_0)] hover:text-[oklch(0.80_0_0)] hover:bg-[oklch(0.17_0_0)]"
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[oklch(0.71_0.22_145/0.1)] border border-[oklch(0.71_0.22_145/0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.71_0.22_145)] animate-pulse" />
            <span className="text-[oklch(0.71_0.22_145)] text-xs font-mono">LIVE</span>
          </div>
          {session && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-[oklch(0.45_0_0)] hover:text-[oklch(0.68_0.24_25)] hover:bg-[oklch(0.17_0_0)] transition-colors"
              title={`Logged in as ${session.user.email}`}
            >
              <LogOut size={12} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
