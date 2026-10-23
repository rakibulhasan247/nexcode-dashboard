"use client";

import { useRef, useState } from "react";
import { dataByPeriod, timeLabels, yLabels } from "@/data/dashboard";
import { EASE, gsap, onceInView, useGSAP } from "@/lib/gsap";
import { useDashboard } from "./DashboardShell";
import { AxisStrip, ChartCard, Tooltip, YLegend } from "./Shared";

const COLUMNS = 6; // the square grid has 7 vertical lines

export default function SalesAreaChart({ onMove }: { onMove: () => void }) {
  const { period } = useDashboard();
  const [hovered, setHovered] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const introDone = useRef(false);
  const data = dataByPeriod[period];

  // Intro: grid fades up, then the line + gradient draw in left to right.
  useGSAP(
    () => {
      gsap
        .timeline({
          // The wrapper is display:contents, so trigger on the card itself.
          scrollTrigger: onceInView(rootRef.current!.firstElementChild!),
          delay: 0.6,
          onComplete: () => {
            introDone.current = true;
          },
        })
        .from("[data-grid]", { autoAlpha: 0, duration: 0.5 })
        .from("[data-axis]", { autoAlpha: 0, x: -8, duration: 0.3, stagger: 0.05, ease: EASE }, 0)
        .fromTo(
          "[data-area]",
          { clipPath: "inset(-30% 100% -10% 0)" },
          { clipPath: "inset(-30% -10% -10% 0)", duration: 1.6, ease: "power2.inOut" },
          0.2,
        )
        .from("[data-time]", { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.06, ease: EASE }, 0.4);
    },
    { scope: rootRef },
  );

  // Period change: redraw the curve.
  useGSAP(
    () => {
      if (!introDone.current) return;
      gsap.fromTo(
        "[data-area]",
        { clipPath: "inset(-30% 100% -10% 0)" },
        { clipPath: "inset(-30% -10% -10% 0)", duration: 1.1, ease: "power2.inOut" },
      );
    },
    { dependencies: [period], scope: rootRef },
  );

  return (
    <div ref={rootRef} className="contents">
      <ChartCard caption="Sales" value={data.chartValue} change={data.chartChange} onMove={onMove} className="h-[300px]">
        <div className="flex h-32 w-full gap-2.5 pr-3.5">
          <YLegend labels={yLabels} />
          <div className="relative min-w-0 flex-1" onMouseLeave={() => setHovered(null)}>
            <span data-grid className="absolute inset-[-0.19%_-0.11%]">
              <img src="/figma/grid-area.svg" alt="" className="block size-full max-w-none" />
            </span>
            {/* Figma rotates the line asset 180°, which puts its gradient above the line. */}
            <div data-area className="absolute inset-x-0 top-0 h-[79.273px]">
              <div className="size-full rotate-180">
                <span className="absolute inset-[-25.23%_-8.44%_0_-7.77%]">
                  <img src="/figma/area-line.svg" alt="" className="block size-full max-w-none" />
                </span>
              </div>
            </div>
            <div className="absolute inset-0 flex" role="group" aria-label="Sales by hour">
              {Array.from({ length: COLUMNS }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Hour ${i + 1}: Ξ ${data.area[i]}`}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className="relative h-full flex-1 outline-none"
                >
                  {hovered === i && (
                    <>
                      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-orange/60" />
                      <Tooltip className="-top-7 left-1/2 -translate-x-1/2">Ξ {data.area[i].toFixed(1)}</Tooltip>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <AxisStrip>
          <div className="flex justify-between pt-0.5 pr-3.5 pl-[22px]">
            {timeLabels.map((label) => (
              <span key={label} data-time className="text-sm leading-[14px] font-semibold tracking-[0.42px] text-axis">
                {label}
              </span>
            ))}
          </div>
        </AxisStrip>
      </ChartCard>
    </div>
  );
}
