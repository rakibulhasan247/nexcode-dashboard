"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { invitees, people as initialPeople, reports } from "@/data/dashboard";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { useDashboard } from "./DashboardShell";
import Dropdown, { MenuItem } from "./Dropdown";
import { IconButton } from "./Shared";

type Person = { id: number; name: string; avatar: string | null };

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

export default function Toolbar() {
  const { notify } = useDashboard();
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [selected, setSelected] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLImageElement>(null);
  const added = useRef<number | null>(null);

  useGSAP(
    () => {
      gsap
        .timeline({ delay: 0.45 })
        .from("[data-add]", { scale: 0, rotate: -90, duration: 0.6, ease: "back.out(2)" })
        .from("[data-person]", { autoAlpha: 0, x: -20, duration: 0.5, stagger: 0.08, ease: EASE }, 0.15)
        .from("[data-tool]", { autoAlpha: 0, scale: 0.6, duration: 0.4, stagger: 0.07, ease: "back.out(2)" }, 0.2);
    },
    { scope: rootRef },
  );

  // Pop in a newly added collaborator.
  useGSAP(
    () => {
      if (added.current === null) return;
      const pill = rootRef.current?.querySelector(`[data-person="${added.current}"]`);
      gsap.fromTo(pill ?? [], { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" });
      added.current = null;
    },
    { dependencies: [people.length], scope: rootRef },
  );

  const { contextSafe } = useGSAP({ scope: rootRef });

  const addPerson = (name: string) => {
    const id = Date.now();
    added.current = id;
    setPeople((list) => [...list, { id, name, avatar: null }]);
    notify(`${name} was added to the report`);
  };

  // Download the report table as a CSV file.
  const download = () => {
    const rows = [["Name", "Status", "Date", "Progress"], ...reports.map((r) => [r.name, r.status, r.date, `${r.progress}%`])];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "nexcode-report.csv" });
    link.click();
    URL.revokeObjectURL(url);
    notify("Report downloaded as CSV");
  };

  const sync = contextSafe(() => {
    if (syncing) return;
    setSyncing(true);
    gsap.fromTo(
      cloudRef.current,
      { y: 0 },
      {
        y: -4,
        duration: 0.35,
        repeat: 3,
        yoyo: true,
        ease: "sine.inOut",
        onComplete: () => {
          setSyncing(false);
          notify("Report synced to the cloud");
        },
      },
    );
  });

  const remaining = invitees.filter((name) => !people.some((p) => p.name === name));

  return (
    <div ref={rootRef} className="flex flex-wrap items-center justify-between gap-3">
      <div className="-mx-1 flex w-full min-w-0 items-center gap-3 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:w-auto sm:flex-1">

        <div data-add className="shrink-0">
          <Dropdown
            label="Add people"
            align="left"
            triggerClassName="group flex size-12 items-center justify-center rounded-full bg-lime transition-[filter,scale] hover:brightness-95 active:scale-95"
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
              remaining.length === 0 ? (
                <p className="px-3 py-2 text-xs text-grey">Everyone is already here.</p>
              ) : (
                remaining.map((name) => (
                  <MenuItem
                    key={name}
                    onSelect={() => {
                      addPerson(name);
                      close();
                    }}
                  >
                    Add {name}
                  </MenuItem>
                ))
              )
            }
          </Dropdown>
        </div>
        {people.map((person) => (
          <button
            key={person.id}
            type="button"
            data-person={person.id}
            aria-pressed={selected === person.id}
            onClick={() => setSelected((id) => (id === person.id ? null : person.id))}
            className={`flex h-12 shrink-0 items-center gap-2.5 rounded-[40px] border pr-3 pl-2 transition-colors duration-300 ${
              selected === person.id ? "border-purple bg-purple/10" : "border-outline hover:bg-page"
            }`}
          >
            {person.avatar ? (
              <Image src={person.avatar} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-yellow text-xs font-semibold text-navy">
                {initials(person.name)}
              </span>
            )}
            <span className="text-sm leading-5 font-medium whitespace-nowrap text-navy">{person.name}</span>
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div data-tool>
          <IconButton label="Filters" onClick={() => document.getElementById("report-table")?.scrollIntoView({ behavior: "smooth" })}>
            <img src="/figma/filter.svg" alt="" width={18} height={18} />
          </IconButton>
        </div>
        <div data-tool>
          <IconButton label="Download report" onClick={download}>
            <img src="/figma/download.svg" alt="" width={18} height={18} className="p-[1.8px]" />
          </IconButton>
        </div>
        <div data-tool>
          <IconButton label={syncing ? "Syncing" : "Sync to cloud"} onClick={sync} className={syncing ? "bg-chip" : ""}>
            <img ref={cloudRef} src="/figma/cloud.svg" alt="" width={18} height={18} className="py-[1.9px]" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
