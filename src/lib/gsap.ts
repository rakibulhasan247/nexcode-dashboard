"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);

export const EASE = "power3.out";

// Honour the OS "reduce motion" setting: every animation still lands on its
// final state, just instantly.
if (typeof window !== "undefined") {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => gsap.globalTimeline.timeScale(query.matches ? 1000 : 1);
  apply();
  query.addEventListener("change", apply);
  // Dev-only handle for inspecting timelines from the browser console.
  if (process.env.NODE_ENV === "development") (window as unknown as { gsap: typeof gsap }).gsap = gsap;
}

// Fire once when any part of the element scrolls into view (immediately if it
// already is), so content near the bottom of a non-scrolling page still runs.
export const onceInView = (trigger: Element) => ({
  trigger,
  start: "top bottom",
  once: true,
});

export { Flip, gsap, ScrollTrigger, useGSAP };
