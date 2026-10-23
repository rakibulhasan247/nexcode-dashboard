"use client";

import { useRef } from "react";
import { counterCards, dataByPeriod } from "@/data/dashboard";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { useDashboard } from "./DashboardShell";
import { AnimatedNumber } from "./Shared";

export default function RevenueSummary() {
  const { period, compare } = useDashboard();
  const rootRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const data = dataByPeriod[period];

  useGSAP(
    () => {
      gsap
        .timeline({ delay: 0.65 })
        .from("[data-revenue] > *", { autoAlpha: 0, y: 18, duration: 0.55, stagger: 0.08, ease: EASE })
        .from(
          "[data-counter]",
          { autoAlpha: 0, y: 30, rotateX: -35, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.1, ease: "back.out(1.6)" },
          0.1,
        );
    },
    { scope: rootRef },
  );

  // Toggle: fold the growth + comparison lines away when comparison is off.
  useGSAP(
    () => {
      gsap.to(compareRef.current, {
        height: compare ? "auto" : 0,
        autoAlpha: compare ? 1 : 0,
        duration: 0.4,
        ease: EASE,
      });
    },
    { dependencies: [compare], scope: rootRef },
  );

  const { contextSafe } = useGSAP({ scope: rootRef });
  const wobble = contextSafe((el: HTMLElement) => {
    gsap.fromTo(el, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  });

  return (
    <div ref={rootRef} className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div data-revenue className="flex flex-col gap-2.5">
        <p className="text-sm leading-6 font-medium tracking-[-0.28px] text-black">Total Revenue</p>
        <AnimatedNumber
          value={data.revenue}
          format="money"
          prefix="$"
          duration={1.6}
          className="text-[30px] leading-[1.2] font-semibold whitespace-nowrap text-black sm:text-4xl"
        />
        <div ref={compareRef} className="flex flex-col gap-2.5 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center">
              <img src="/figma/arrow-up-green.svg" alt="" width={20} height={18} />
              <AnimatedNumber
                value={data.growthPct}
                decimals={1}
                prefix="+"
                suffix="% Growth"
                className="text-xs leading-5 font-bold tracking-[-0.24px] text-success"
              />
            </span>
            <span className="flex items-center">
              <img src="/figma/arrow-up-green.svg" alt="" width={20} height={18} />
              <AnimatedNumber
                value={data.growthAbs}
                format="money"
                prefix="+$"
                className="text-xs leading-5 font-bold tracking-[-0.24px] text-success"
              />
            </span>
          </div>
          <p className="text-sm leading-6 font-light tracking-[-0.28px] text-black">
            Compared to ${data.previous.toLocaleString("en-US", { minimumFractionDigits: 2 })} in the previous period
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 [perspective:800px] sm:grid-cols-4 xl:w-[912px]">
        {counterCards.map((card, i) => (
          <button
            key={card.key}
            type="button"
            data-counter
            onClick={(event) => wobble(event.currentTarget)}
            className="flex flex-col items-start gap-2.5 rounded-[12px] p-5 text-left transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(28,29,33,0.12)] sm:p-[30px]"
            style={{ backgroundColor: card.bg }}
          >
            <span className={`text-sm leading-[22px] whitespace-nowrap ${card.light ? "text-white" : "text-black"}`}>
              {card.label}
            </span>
            <AnimatedNumber
              value={data.counters[i]}
              format="dotted"
              className={`text-2xl leading-none font-semibold ${card.light ? "text-white" : "text-ink"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
