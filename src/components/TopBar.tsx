"use client";

import { useRef, useState } from "react";
import { notifications as initialNotifications } from "@/data/dashboard";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { useDashboard } from "./DashboardShell";
import Dropdown, { MenuItem } from "./Dropdown";

export default function TopBar() {
  const { query, setQuery, notify } = useDashboard();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap
        .timeline({ delay: 0.1 })
        .from("[data-logo]", { autoAlpha: 0, x: -24, duration: 0.6, ease: EASE })
        .from("[data-search]", { autoAlpha: 0, width: 48, duration: 0.7, ease: "power3.inOut", clearProps: "width" }, 0.15)
        .from("[data-top-action]", { autoAlpha: 0, scale: 0.5, duration: 0.45, stagger: 0.08, ease: "back.out(2)" }, 0.3);
    },
    { scope: rootRef },
  );

  return (
    <header
      ref={rootRef}
      data-animate="topbar"
      className="relative z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
    >
      <a href="#" data-logo className="font-poppins text-[28px] leading-[1.4] font-semibold text-navy sm:text-4xl">
        NexCode
      </a>

      <div className="order-last flex w-full items-center gap-4 sm:order-none sm:w-auto">
        <label
          data-search
          className="flex h-12 w-full items-center gap-2.5 rounded-[20px] border border-outline px-4 transition-colors focus-within:border-purple sm:w-[405px]"
        >
          <img src="/figma/search.svg" alt="" width={19} height={19} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setQuery("")}
            placeholder="Search By A Taste of Tradition"
            aria-label="Search reports"
            className="min-w-0 flex-1 bg-transparent text-sm leading-[22px] text-navy outline-none placeholder:text-navy"
          />
        </label>
        <div className="hidden items-center gap-4 sm:flex">
          <Notifications />
          <NewMenu onPick={(item) => notify(`New ${item.toLowerCase()} created`)} />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:hidden">
        <Notifications />
        <NewMenu onPick={(item) => notify(`New ${item.toLowerCase()} created`)} />
      </div>
    </header>
  );
}

function Notifications() {
  const [items, setItems] = useState(initialNotifications);
  const [unread, setUnread] = useState(true);
  const dotRef = useRef<HTMLSpanElement>(null);

  // Gentle pulse on the unread dot.
  useGSAP(
    () => {
      if (!unread) return;
      gsap.to(dotRef.current, { scale: 1.6, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
    },
    { dependencies: [unread], revertOnUpdate: true },
  );

  return (
    <div data-top-action>
      <Dropdown
        label="Notifications"
        menuClassName="w-[min(300px,calc(100vw-32px))]"
        triggerClassName="relative flex size-12 items-center justify-center rounded-[20px] border border-outline transition-colors hover:bg-white"
        trigger={() => (
          <>
            <img src="/figma/notification.svg" alt="" width={24} height={24} />
            {unread && <span ref={dotRef} className="absolute top-[11px] right-[13px] size-2 rounded-full bg-orange" />}
          </>
        )}
      >
        {() => (
          <>
            <div className="flex items-center justify-between px-3 pt-1.5 pb-2">
              <span className="text-sm font-semibold text-navy">Notifications</span>
              <button
                type="button"
                onClick={() => setUnread(false)}
                disabled={!unread}
                className="text-xs font-medium text-purple hover:underline disabled:text-grey disabled:no-underline"
              >
                Mark all read
              </button>
            </div>
            {items.length === 0 && <p className="px-3 py-4 text-center text-xs text-grey">You&apos;re all caught up.</p>}
            {items.map((n) => (
              <div key={n.id} className="group flex items-start gap-2 rounded-lg px-3 py-2 hover:bg-page">
                <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${unread ? "bg-orange" : "bg-outline"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-navy">{n.title}</p>
                  <p className="text-[11px] text-grey">{n.time}</p>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => setItems((list) => list.filter((x) => x.id !== n.id))}
                  className="text-grey opacity-0 transition-opacity group-hover:opacity-100 hover:text-navy focus:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </>
        )}
      </Dropdown>
    </div>
  );
}

function NewMenu({ onPick }: { onPick: (item: string) => void }) {
  return (
    <div data-top-action>
      <Dropdown
        label="Create new"
        triggerClassName="group flex size-12 items-center justify-center rounded-full bg-yellow transition-[filter,scale] hover:brightness-95 active:scale-95"
        trigger={(open) => (
          <img
            src="/figma/add.svg"
            alt=""
            width={24}
            height={24}
            className={`transition-transform duration-300 ${open ? "rotate-45" : "group-hover:rotate-90"}`}
          />
        )}
      >
        {(close) =>
          ["Report", "Dashboard", "Widget"].map((item) => (
            <MenuItem
              key={item}
              onSelect={() => {
                onPick(item);
                close();
              }}
            >
              New {item.toLowerCase()}
            </MenuItem>
          ))
        }
      </Dropdown>
    </div>
  );
}
