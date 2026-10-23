"use client";

import { useMemo, useRef, useState } from "react";
import { reports, statuses, type Status } from "@/data/dashboard";
import { EASE, Flip, gsap, onceInView, useGSAP } from "@/lib/gsap";
import { useDashboard } from "./DashboardShell";
import Dropdown from "./Dropdown";

type SortKey = "name" | "status" | "date" | "progress";
const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "NAME" },
  { key: "status", label: "STATUS" },
  { key: "date", label: "DATE" },
  { key: "progress", label: "PROGRESS" },
];

// Figma column starts: 24.03 / 205.43 / 337.21 / 470.54 px on a 600px table,
// kept as proportions so the table also fits slightly narrower cards.
const GRID = "grid grid-cols-[31.5fr_22.9fr_23.1fr_22.5fr] pl-[4%]";

const statusIcon = (status: Status) => (status === "Error" ? "/figma/error.svg" : "/figma/check-circle.svg");

const compare: Record<SortKey, (a: (typeof reports)[number], b: (typeof reports)[number]) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  status: (a, b) => a.status.localeCompare(b.status),
  date: (a, b) => a.iso.localeCompare(b.iso),
  progress: (a, b) => a.progress - b.progress,
};

export default function ReportTable() {
  const { query } = useDashboard();
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const [filter, setFilter] = useState<Status[]>([]);
  const rootRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = reports.filter(
      (r) =>
        (filter.length === 0 || filter.includes(r.status)) &&
        (!q || `${r.name} ${r.status} ${r.date}`.toLowerCase().includes(q)),
    );
    return sort ? [...visible].sort((a, b) => compare[sort.key](a, b) * sort.dir) : visible;
  }, [query, filter, sort]);

  // Intro: rows slide in, then each progress bar fills from 0 to its value.
  useGSAP(
    () => {
      gsap
        .timeline({ scrollTrigger: onceInView(rootRef.current!), delay: 0.75 })
        .from("[data-th]", { autoAlpha: 0, y: -8, duration: 0.35, stagger: 0.05, ease: EASE })
        .from("[data-row]", { autoAlpha: 0, x: 24, duration: 0.5, stagger: 0.07, ease: EASE }, 0.1)
        .fromTo(
          "[data-progress]",
          { width: "0%" },
          { width: (_: number, el: HTMLElement) => `${el.dataset.progress}%`, duration: 1, stagger: 0.07, ease: "power2.out" },
          0.35,
        );
    },
    { scope: rootRef },
  );

  // Rows slide to their new places after sorting / filtering.
  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        duration: 0.45,
        ease: "power2.inOut",
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.35 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, x: -20, duration: 0.25 }),
        absolute: true,
      });
      flipState.current = null;
    },
    { dependencies: [rows], scope: rootRef },
  );

  const captureFlip = () => {
    if (listRef.current) flipState.current = Flip.getState(listRef.current.querySelectorAll("[data-row]"));
  };

  const toggleSort = (key: SortKey) => {
    captureFlip();
    setSort((s) => (s?.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null));
  };

  const toggleFilter = (status: Status) => {
    captureFlip();
    setFilter((list) => (list.includes(status) ? list.filter((s) => s !== status) : [...list, status]));
  };

  return (
    <section
      ref={rootRef}
      id="report-table"
      data-animate="card"
      className="flex min-h-[485px] scroll-mt-6 xl:self-start flex-col gap-[30px] rounded-[11px] bg-page px-4 pt-[22px] pb-6 sm:px-[23px]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl leading-none font-semibold whitespace-nowrap text-ink">Report Table</h2>
        <Dropdown
          label={`Filter by status${filter.length ? ` (${filter.length} selected)` : ""}`}
          triggerClassName="relative flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white"
          trigger={() => (
            <>
              <img src="/figma/filter.svg" alt="" width={18} height={18} />
              {filter.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-purple text-[10px] font-semibold text-white">
                  {filter.length}
                </span>
              )}
            </>
          )}
        >
          {() => (
            <>
              <p className="px-3 pt-1 pb-1.5 text-xs font-semibold text-grey">Filter by status</p>
              {statuses.map((status) => (
                <label
                  key={status}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy hover:bg-page"
                >
                  <input
                    type="checkbox"
                    checked={filter.includes(status)}
                    onChange={() => toggleFilter(status)}
                    className="size-4 accent-purple"
                  />
                  {status}
                </label>
              ))}
              {filter.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    captureFlip();
                    setFilter([]);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-purple hover:bg-page"
                >
                  Clear filters
                </button>
              )}
            </>
          )}
        </Dropdown>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[540px]">
          <div className={`${GRID} h-[37.26px] border-b border-outline`}>
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                role="columnheader"
                aria-sort={sort?.key === col.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                className="self-start"
              >
                <button
                  type="button"
                  data-th
                  onClick={() => toggleSort(col.key)}
                  className="flex h-[18.6px] items-center gap-1 text-left text-xs leading-[18.6px] font-medium tracking-[-0.24px] text-header transition-colors hover:text-ink"
                >
                  {col.label}
                  <span
                    aria-hidden
                    className={`text-[9px] transition-[opacity,rotate] duration-300 ${
                      sort?.key === col.key ? "opacity-100" : "opacity-0"
                    } ${sort?.key === col.key && sort.dir === -1 ? "rotate-180" : ""}`}
                  >
                    ▲
                  </span>
                </button>
              </div>
            ))}
          </div>

          <div ref={listRef} className="relative">
            {rows.length === 0 && (
              <p className="py-10 text-center text-xs text-grey">No reports match your search or filters.</p>
            )}
            {rows.map((r) => (
              <div
                key={r.id}
                data-row
                data-flip-id={r.id}
                className={`${GRID} h-14 items-center border-b border-outline text-xs leading-5 font-medium text-black transition-colors duration-200 hover:bg-white`}
              >
                <span className="whitespace-nowrap">{r.name}</span>
                <span className="flex items-center gap-[3.9px] whitespace-nowrap">
                  <img src={statusIcon(r.status)} alt="" width={18.6} height={18.6} />
                  {r.status}
                </span>
                <span className="whitespace-nowrap">{r.date}</span>
                <span
                  className="h-[6.2px] w-[83.72px] rounded-[16.28px] bg-white"
                  role="progressbar"
                  aria-label={`${r.name} progress`}
                  aria-valuenow={Math.round(r.progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    data-progress={r.progress}
                    className="block h-full rounded-[16.28px] bg-orange"
                    style={{ width: `${r.progress}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
