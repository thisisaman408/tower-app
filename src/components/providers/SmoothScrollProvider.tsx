"use client";
import { useEffect } from "react";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: { raf: (time: number) => void; destroy: () => void } | undefined;

    const initLenis = async () => {
      const { default: Lenis } = await import("lenis");
      const instance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      }) as { raf: (time: number) => void; destroy: () => void };

      lenis = instance;

      function raf(time: number) {
        instance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };

    initLenis();
    return () => lenis?.destroy();
  }, []);

  return <>{children}</>;
}
