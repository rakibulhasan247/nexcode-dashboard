"use client";

import { useRef } from "react";
import { periods } from "@/data/dashboard";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { useDashboard } from "./DashboardShell";
import Dropdown, { MenuItem } from "./Dropdown";

export default function ReportHeader() {
  const { period, setPeriod, compare, setCompare } = useDashboard();
  const rootRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useGSAP(
    () => {
      gsap.from("[data-title] span", { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.08, delay: 0.55, ease: EASE });
    },
    { scope: rootRef },
  );

  // Slide the toggle knob (Figma: knob centre at 27px when on, 9px when off).
  useGSAP(
    () => {
      const x = compare ? 0 : -18;
      if (placed.current) gsap.to(knobRef.current, { x, duration: 0.35, ease: "back.out(2)" });
      else gsap.set(knobRef.current, { x });
      placed.current = true;
    },
    { dependencies: [compare], scope: rootRef },
  );

  return (
    <div ref={rootRef} className="flex flex-wrap items-start justify-between gap-4">
      <h1 data-title className="font-poppins text-[28px] leading-[1.4] font-semibold text-navy sm:text-4xl">
        {"Create New Report".split(" ").map((word) => (
          <span key={word} className="mr-[0.25em] inline-block last:mr-0">
            {word}
          </span>
        ))}
      </h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={compare}
          aria-label="Compare with previous period"
          title="Compare with previous period"
          onClick={() => setCompare(!compare)}
          className={`relative h-[18px] w-9 shrink-0 rounded-[9px] transition-colors duration-300 ${
            compare ? "bg-green" : "bg-outline"
          }`}
        >
          {/* The design's toggle.svg is the "on" state; its knob is drawn here so it can slide. */}
          <span ref={knobRef} className="absolute top-[1.93px] left-[19.93px] size-[14.14px] rounded-full bg-white" />
        </button>
        <Dropdown
          label="Change period"
          triggerClassName="flex h-12 items-center gap-2 rounded-[7px] bg-chip px-3 transition-colors hover:bg-page"
          trigger={() => (
            <>
              <img src="/figma/calendar-today.svg" alt="" width={18} height={18} />
              <span className="font-dm text-sm leading-6 font-medium tracking-[-0.28px] whitespace-nowrap text-grey">
                {period}
              </span>
            </>
          )}
        >
          {(close) =>
            periods.map((p) => (
              <MenuItem
                key={p}
                active={p === period}
                onSelect={() => {
                  setPeriod(p);
                  close();
                }}
              >
                {p}
              </MenuItem>
            ))
          }
        </Dropdown>
      </div>
    </div>
  );
}
