"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message ?? "Could not create account.");
      } else {
        router.push("/onboarding");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.13_0_0)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-md bg-[oklch(0.72_0.16_240)] flex items-center justify-center">
            <span className="text-sm font-bold text-[oklch(0.13_0_0)]">T</span>
          </div>
          <span className="font-semibold text-base tracking-tight text-[oklch(0.95_0_0)]">Tower</span>
        </div>

        {/* Card */}
        <div className="bg-[oklch(0.15_0_0)] border border-[oklch(0.22_0_0)] rounded-xl p-8">
          <h1 className="text-xl font-bold text-[oklch(0.95_0_0)] mb-1">Create your account</h1>
          <p className="text-sm text-[oklch(0.55_0_0)] mb-6">Start tracking your competitors in minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[oklch(0.65_0_0)] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-4 py-3 text-sm text-[oklch(0.80_0_0)] placeholder-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[oklch(0.65_0_0)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-4 py-3 text-sm text-[oklch(0.80_0_0)] placeholder-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[oklch(0.65_0_0)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-4 py-3 text-sm text-[oklch(0.80_0_0)] placeholder-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[oklch(0.65_0_0)] mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-[oklch(0.18_0_0)] border border-[oklch(0.25_0_0)] rounded-lg px-4 py-3 text-sm text-[oklch(0.80_0_0)] placeholder-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(0.72_0.16_240/0.5)] w-full"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[oklch(0.60_0.20_25/0.1)] border border-[oklch(0.60_0.20_25/0.3)]">
                <p className="text-xs text-[oklch(0.72_0.15_25)]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[oklch(0.72_0.16_240)] text-[oklch(0.13_0_0)] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[oklch(0.78_0.16_240)] transition-colors disabled:opacity-50 w-full mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[oklch(0.45_0_0)] mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[oklch(0.72_0.16_240)] hover:text-[oklch(0.78_0.16_240)] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
