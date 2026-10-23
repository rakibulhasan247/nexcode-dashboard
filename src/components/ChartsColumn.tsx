"use client";

import { useRef, useState } from "react";
import { Flip, useGSAP } from "@/lib/gsap";
import MarketingColumns from "./MarketingColumns";
import RevenueBars from "./RevenueBars";
import SalesAreaChart from "./SalesAreaChart";

const CHARTS = { sales: SalesAreaChart, marketing: MarketingColumns, revenue: RevenueBars } as const;
type ChartKey = keyof typeof CHARTS;

// The three chart cards; each card's move icon shifts it one slot forward,
// and GSAP Flip slides every card into its new place.
export default function ChartsColumn() {
  const [order, setOrder] = useState<ChartKey[]>(["sales", "marketing", "revenue"]);
  const rootRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, { duration: 0.6, ease: "power3.inOut", absolute: true });
      flipState.current = null;
    },
    { dependencies: [order], scope: rootRef },
  );

  const move = (key: ChartKey) => {
    if (rootRef.current) flipState.current = Flip.getState(rootRef.current.querySelectorAll("article"));
    setOrder((current) => {
      const next = [...current];
      const from = next.indexOf(key);
      const to = (from + 1) % next.length;
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  return (
    <div ref={rootRef} className="grid grid-cols-[minmax(0,1fr)] content-start gap-2.5 sm:grid-cols-2">
      {order.map((key) => {
        const Chart = CHARTS[key];
        return <Chart key={key} onMove={() => move(key)} />;
      })}
    </div>
  );
}
