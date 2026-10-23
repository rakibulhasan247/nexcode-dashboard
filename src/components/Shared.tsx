"use client";

import { useRef, type ReactNode } from "react";
import { gsap, onceInView, useGSAP } from "@/lib/gsap";

/* ---------- Number formats ---------- */

// Counters use dots for thousands: 1.345 → "1.345", 16.14 → "16.140".
export const formatDotted = (thousands: number) =>
  Math.round(thousands * 1000)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Money uses commas: 528976.82 → "528,976.82".
export const formatMoney = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Format = "dotted" | "money" | "fixed";

const formatters: Record<Format, (n: number, decimals: number) => string> = {
  dotted: (n) => formatDotted(n),
  money: (n) => formatMoney(n),
  fixed: (n, d) => n.toFixed(d),
};

// Counts from the previous value to `value`; starts from 0 once in view.
export function AnimatedNumber({
  value,
  format = "fixed",
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  duration = 1.2,
}: {
  value: number;
  format?: Format;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef({ value: 0 });
  const started = useRef(false);
  const render = (n: number) => {
    const sign = n < 0 ? "-" : "";
    return `${sign}${prefix}${formatters[format](Math.abs(n), decimals)}${suffix}`;
  };

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.to(current.current, {
        value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = render(current.current.value);
        },
        scrollTrigger: started.current ? undefined : onceInView(el),
      });
      started.current = true;
    },
    { dependencies: [value] },
  );

  return (
    <span ref={ref} className={className}>
      {render(0)}
    </span>
  );
}

/* ---------- Chart card chrome ---------- */

export function ChartCard({
  caption,
  value,
  change,
  onMove,
  className = "",
  children,
}: {
  caption: string;
  value: number;
  change: number;
  onMove?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      data-animate="card"
      className={`flex flex-col gap-[30px] rounded-[11px] bg-tile px-[23px] pt-[22px] ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <p className="h-4 text-sm leading-6 font-medium tracking-[-0.28px] text-black">{caption}</p>
          <div className="flex items-start gap-2.5 font-semibold">
            <AnimatedNumber value={value} format="dotted" className="text-2xl leading-none whitespace-nowrap text-ink" />
            <AnimatedNumber
              value={change}
              decimals={2}
              prefix={change >= 0 ? "↗ " : "↘ "}
              suffix="%"
              className={`text-sm leading-[14px] tracking-[0.42px] whitespace-nowrap ${
                change >= 0 ? "text-success" : "text-danger"
              }`}
            />
          </div>
        </div>
        <button
          type="button"
          aria-label={`Move ${caption} card`}
          onClick={onMove}
          className="group -m-1.5 rounded-lg p-1.5 transition-colors hover:bg-white"
        >
          <img
            src="/figma/move.svg"
            alt=""
            width={23}
            height={23}
            className="transition-transform duration-300 group-hover:rotate-45"
          />
        </button>
      </div>
      {children}
    </article>
  );
}

// Bottom strip of the chart cards: the design's small white dash, then labels.
export function AxisStrip({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-9 w-full gap-2">
      <div className="w-4 shrink-0 p-2.5">
        <span className="block h-1 w-[34px] bg-white" />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function YLegend({ labels, className = "" }: { labels: string[]; className?: string }) {
  return (
    <div className={`flex h-full w-9 shrink-0 flex-col justify-between text-right ${className}`}>
      {labels.map((label) => (
        <span
          key={label}
          data-axis
          className="flex h-1.5 items-center justify-end text-sm leading-[14px] font-semibold tracking-[0.42px] whitespace-nowrap text-axis"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function Tooltip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`pointer-events-none absolute z-10 rounded-md bg-ink px-2 py-1 text-[11px] leading-4 font-semibold whitespace-nowrap text-white shadow-lg ${className}`}
    >
      {children}
    </span>
  );
}

// Round bordered icon button used across the toolbar and top bar.
export function IconButton({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex size-12 shrink-0 items-center justify-center rounded-full border border-outline transition-[background-color,scale] duration-200 hover:bg-chip active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}
