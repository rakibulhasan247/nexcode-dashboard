"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { DEFAULT_PERIOD, type Period } from "@/data/dashboard";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type Toast = { id: number; message: string };

type DashboardContextValue = {
  query: string;
  setQuery: (query: string) => void;
  period: Period;
  setPeriod: (period: Period) => void;
  compare: boolean;
  setCompare: (compare: boolean) => void;
  notify: (message: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const value = useContext(DashboardContext);
  if (!value) throw new Error("useDashboard must be used inside DashboardShell");
  return value;
}

// Shared state (search, period, comparison toggle, toasts) and the page's
// entrance animation: top bar drops in, the white panel rises, then each
// card rises in as it enters the viewport.
export default function DashboardShell({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [compare, setCompare] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const rootRef = useRef<HTMLElement>(null);
  const toastId = useRef(0);

  const notify = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((list) => [...list, { id, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 2600);
  }, []);

  useGSAP(
    () => {
      gsap
        .timeline()
        .fromTo("[data-animate='topbar']", { autoAlpha: 0, y: -24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE })
        .fromTo(
          "[data-animate='panel']",
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE, clearProps: "transform" },
          0.15,
        );

      gsap.set("[data-animate='card']", { autoAlpha: 0, y: 32 });
      ScrollTrigger.batch("[data-animate='card']", {
        start: "top bottom",
        once: true,
        onEnter: (cards) =>
          gsap.to(cards, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            delay: 0.35,
            ease: EASE,
            clearProps: "transform",
          }),
      });
    },
    { scope: rootRef },
  );

  return (
    <DashboardContext.Provider value={{ query, setQuery, period, setPeriod, compare, setCompare, notify }}>
      <main
        ref={rootRef}
        className="mx-auto flex max-w-[1440px] flex-col gap-6 px-3 pt-4 pb-8 sm:px-[30px] sm:pt-[30px]"
      >
        {children}
      </main>
      <Toasts toasts={toasts} />
    </DashboardContext.Provider>
  );
}

function Toasts({ toasts }: { toasts: Toast[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Slide each new toast in from the right.
  useGSAP(
    () => {
      const last = rootRef.current?.lastElementChild;
      if (last) gsap.fromTo(last, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: EASE });
    },
    { dependencies: [toasts.length], scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
