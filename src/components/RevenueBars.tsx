"use client";

import { useRef, useState } from "react";
import { dataByPeriod, legend, timeLabels, yLabels } from "@/data/dashboard";
import { EASE, gsap, onceInView, useGSAP } from "@/lib/gsap";
import { useDashboard } from "./DashboardShell";
import { AxisStrip, ChartCard, Tooltip } from "./Shared";

const GRID_WIDTH = 541.808; // Figma grid width the bar lengths are measured on
const pct = (px: number) => `${(px / GRID_WIDTH) * 100}%`;
const SERIES = [
  { key: "purple", color: "bg-purple", top: 8 },
  { key: "yellow", color: "bg-yellow", top: 15 },
  { key: "orange", color: "bg-orange", top: 15 }, // drawn over the yellow bar
] as const;

export default function RevenueBars({ onMove }: { onMove: () => void }) {
  const { period } = useDashboard();
  const [hovered, setHovered] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const introDone = useRef(false);
  const data = dataByPeriod[period];
  const initial = useRef(data.rows).current;

  // Intro: bars sweep out from the axis, row by row.
  useGSAP(
    () => {
      gsap
        .timeline({
          // The wrapper is display:contents, so trigger on the card itself.
          scrollTrigger: onceInView(rootRef.current!.firstElementChild!),
          delay: 0.8,
          onComplete: () => {
            introDone.current = true;
          },
        })
        .from("[data-grid]", { autoAlpha: 0, duration: 0.5 })
        .from("[data-row-label]", { autoAlpha: 0, x: -8, duration: 0.3, stagger: 0.06, ease: EASE }, 0)
        .fromTo(
          "[data-hbar]",
          { width: "0%" },
          {
            width: (_: number, el: HTMLElement) => pct(Number(el.dataset.length)),
            duration: 1.1,
            stagger: 0.05,
            ease: "power3.out",
          },
          0.2,
        )
        .from("[data-legend]", { autoAlpha: 0, y: 6, duration: 0.3, stagger: 0.06, ease: EASE }, 0.6);
    },
    { scope: rootRef },
  );

  // Period change: bars stretch or shrink to their new lengths.
  useGSAP(
    () => {
      if (!introDone.current) return;
      gsap.to("[data-hbar]", {
        width: (_: number, el: HTMLElement) => pct(Number(el.dataset.length)),
        duration: 0.8,
        stagger: 0.02,
        ease: "power3.inOut",
      });
    },
    { dependencies: [period], scope: rootRef },
  );

  return (
    <div ref={rootRef} className="contents">
      <ChartCard caption="Total Revenue" value={data.chartValue} change={data.chartChange} onMove={onMove} className="sm:col-span-2">
        <div className="flex w-full gap-2.5 pr-3.5">
          <div className="flex h-40 w-[30px] shrink-0 flex-col gap-2">
            {timeLabels.map((label) => (
              <span
                key={label}
                data-row-label
                className="flex flex-1 items-center text-sm leading-[14px] font-semibold tracking-[0.42px] text-axis"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="relative h-40 min-w-0 flex-1" onMouseLeave={() => setHovered(null)}>
            <span data-grid className="absolute inset-y-[-0.15%] right-0 left-[0.48%]">
              <img src="/figma/grid-grouped.svg" alt="" className="block size-full max-w-none" />
            </span>
            <div className="absolute inset-0 flex flex-col">
              {initial.map((row, r) => (
                <button
                  key={r}
                  type="button"
                  aria-label={`${timeLabels[r]}: ${data.rows[r].map((v) => v.toFixed(0)).join(", ")}`}
                  onMouseEnter={() => setHovered(r)}
                  onFocus={() => setHovered(r)}
                  onBlur={() => setHovered(null)}
                  className={`relative flex-1 rounded transition-[background-color,opacity] duration-300 outline-none ${
                    hovered === r ? "bg-white/60" : ""
                  } ${hovered !== null && hovered !== r ? "opacity-50" : ""}`}
                >
                  {SERIES.map((series, s) => (
                    <span
                      key={series.key}
                      data-hbar
                      data-length={data.rows[r][s]}
                      className={`absolute left-0 h-[5.389px] rounded-r-[2px] ${series.color}`}
                      style={{ top: series.top, width: pct(row[s]) }}
                    />
                  ))}
                  {hovered === r && (
                    <Tooltip className="top-1/2 right-2 -translate-y-1/2">
                      {data.rows[r].map((v) => v.toFixed(0)).join(" · ")}
                    </Tooltip>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="pb-4">
          <AxisStrip>
            <div className="flex h-full flex-col items-center gap-[3px] pr-3.5">
              <div className="flex w-full justify-between">
                {[...yLabels].reverse().map((label) => (
                  <span key={label} className="w-[38px] text-right text-sm leading-[14px] font-semibold tracking-[0.42px] text-axis">
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                {legend.map((item) => (
                  <span key={item.label} data-legend className="flex items-center">
                    <img src={item.icon} alt="" width={22} height={22} />
                    <span className="text-sm leading-[14px] font-semibold tracking-[0.42px] text-axis">{item.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </AxisStrip>
        </div>
      </ChartCard>
    </div>
  );
}
