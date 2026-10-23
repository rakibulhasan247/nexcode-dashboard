"use client";

import { useRef, useState } from "react";
import { dataByPeriod, timeLabels, yLabels } from "@/data/dashboard";
import { EASE, gsap, onceInView, useGSAP } from "@/lib/gsap";
import { useDashboard } from "./DashboardShell";
import { AxisStrip, ChartCard, Tooltip, YLegend } from "./Shared";

const BASELINE = 64; // px from the top of the 128px grid (the Ξ 16 line)

// Positive values grow up from the baseline, negative ones down.
const geometry = (v: number) => ({ top: v >= 0 ? BASELINE - v : BASELINE, height: Math.abs(v) });

export default function MarketingColumns({ onMove }: { onMove: () => void }) {
  const { period } = useDashboard();
  const [hovered, setHovered] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const introDone = useRef(false);
  const data = dataByPeriod[period];
  const initial = useRef(data.columns).current;

  // Intro: columns grow out of the baseline one by one.
  useGSAP(
    () => {
      gsap
        .timeline({
          // The wrapper is display:contents, so trigger on the card itself.
          scrollTrigger: onceInView(rootRef.current!.firstElementChild!),
          delay: 0.7,
          onComplete: () => {
            introDone.current = true;
          },
        })
        .from("[data-grid]", { autoAlpha: 0, duration: 0.5 })
        .from("[data-axis]", { autoAlpha: 0, x: -8, duration: 0.3, stagger: 0.05, ease: EASE }, 0)
        .fromTo(
          "[data-column]",
          { top: BASELINE, height: 0 },
          {
            top: (i: number) => geometry(initial[i]).top,
            height: (i: number) => geometry(initial[i]).height,
            duration: 0.8,
            stagger: 0.05,
            ease: "back.out(1.6)",
          },
          0.2,
        )
        .from("[data-time]", { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.06, ease: EASE }, 0.4);
    },
    { scope: rootRef },
  );

  // Period change: columns morph, flipping sides through the baseline if needed.
  useGSAP(
    () => {
      if (!introDone.current) return;
      gsap.to("[data-column]", {
        top: (i: number) => geometry(data.columns[i]).top,
        height: (i: number) => geometry(data.columns[i]).height,
        duration: 0.8,
        stagger: 0.03,
        ease: "power3.inOut",
      });
    },
    { dependencies: [period], scope: rootRef },
  );

  return (
    <div ref={rootRef} className="contents">
      <ChartCard caption="Marketing" value={data.chartValue} change={data.chartChange} onMove={onMove} className="h-[300px]">
        <div className="flex h-32 w-full gap-2.5 pr-3.5">
          <YLegend labels={yLabels} className="w-[33px]" />
          <div className="relative min-w-0 flex-1" onMouseLeave={() => setHovered(null)}>
            <span data-grid className="absolute inset-[-0.19%_0_-0.19%_-0.11%] w-[99.51%]">
              <img src="/figma/grid-columns.svg" alt="" className="block size-full max-w-none" />
            </span>
            <div className="absolute inset-0 flex justify-between pr-[0.49%]">
              {initial.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Column ${i + 1}: ${data.columns[i]}`}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className="relative h-full w-[7.4%] outline-none"
                >
                  <span
                    data-column
                    className={`absolute inset-x-0 bg-purple transition-[opacity,filter] duration-300 ${
                      hovered !== null && hovered !== i ? "opacity-40" : ""
                    } ${hovered === i ? "brightness-110" : ""}`}
                    style={geometry(v)}
                  />
                  {hovered === i && (
                    <Tooltip className="-top-7 left-1/2 -translate-x-1/2">
                      {data.columns[i] > 0 ? "+" : ""}
                      {data.columns[i].toFixed(1)}
                    </Tooltip>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <AxisStrip>
          <div className="flex justify-between pt-0.5 pr-3.5 pl-[22px]">
            {timeLabels.map((label) => (
              <span key={label} data-time className="w-[39.9px] text-center text-sm leading-[14px] font-semibold tracking-[0.42px] text-axis">
                {label}
              </span>
            ))}
          </div>
        </AxisStrip>
      </ChartCard>
    </div>
  );
}
