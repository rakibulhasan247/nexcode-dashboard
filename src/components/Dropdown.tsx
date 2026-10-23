"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

type DropdownProps = {
  trigger: (open: boolean) => ReactNode;
  label: string;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  triggerClassName?: string;
  menuClassName?: string;
};

export default function Dropdown({
  trigger,
  label,
  children,
  align = "right",
  triggerClassName = "",
  menuClassName = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useGSAP(
    () => {
      if (!open || !menuRef.current) return;
      gsap.fromTo(
        menuRef.current,
        { autoAlpha: 0, y: -8, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: EASE },
      );
      gsap.from(menuRef.current.children, {
        autoAlpha: 0,
        x: -6,
        duration: 0.2,
        stagger: 0.04,
        delay: 0.05,
        ease: EASE,
      });
    },
    { dependencies: [open], scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {trigger(open)}
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={`invisible absolute top-[calc(100%+8px)] z-30 min-w-[160px] rounded-xl border border-outline bg-white p-1.5 shadow-[0px_18px_40px_0px_rgba(112,144,176,0.18)] ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          } ${menuClassName}`}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onSelect,
  active = false,
}: {
  children: ReactNode;
  onSelect: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors hover:bg-page ${
        active ? "font-semibold text-orange" : "text-navy"
      }`}
    >
      {children}
      {active && <span aria-hidden>✓</span>}
    </button>
  );
}
