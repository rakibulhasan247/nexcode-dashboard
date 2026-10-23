export const periods = ["This week", "This month", "This year"] as const;
export type Period = (typeof periods)[number];
export const DEFAULT_PERIOD: Period = "This month";

export const people = [
  { id: 1, name: "Brooklyn Simmons", avatar: "/figma/avatar-1.png" },
  { id: 2, name: "Savannah Nguyen", avatar: "/figma/avatar-2.png" },
  { id: 3, name: "Ronald Richards", avatar: "/figma/avatar-3.png" },
];

// People the green "+" can add to the report.
export const invitees = ["Jenny Wilson", "Cody Fisher", "Esther Howard"];

export const counterCards = [
  { key: "sales", label: "Sales", bg: "#c77df5", light: true },
  { key: "marketing", label: "Marketing", bg: "#fec338", light: false },
  { key: "development", label: "Development", bg: "#fb8e65", light: false },
  { key: "support", label: "Customer Support", bg: "#81cb55", light: false },
] as const;

type PeriodData = {
  revenue: number;
  growthPct: number;
  growthAbs: number;
  previous: number;
  counters: [number, number, number, number]; // thousands, shown as "1.345"
  chartValue: number;
  chartChange: number;
  // Sales area chart: value for each of the six hourly grid columns (hover tooltip).
  area: number[];
  // Marketing columns: + above the baseline, - below, in px on a 128px grid.
  columns: number[];
  // Total Revenue bars per row: [purple, yellow, orange] lengths in px of a 541.8px grid.
  rows: [number, number, number][];
};

// "This month" is the Figma design; the other periods are sample data.
export const dataByPeriod: Record<Period, PeriodData> = {
  "This week": {
    revenue: 124380.4,
    growthPct: 3.2,
    growthAbs: 3857.12,
    previous: 120523.28,
    counters: [0.312, 0.578, 0.845, 0.664],
    chartValue: 0.578,
    chartChange: 12.4,
    area: [14.2, 12.8, 13.6, 15.1, 13.9, 14.7],
    columns: [-18, 22, 30, 26, 14, -12, -34, -20, 20, 28, 40, 24],
    rows: [
      [210.4, 180.6, 48.2],
      [168.3, 140.1, 36.9],
      [240.8, 196.2, 52.4],
      [190.2, 150.7, 40.3],
      [130.6, 110.5, 29.8],
    ],
  },
  "This month": {
    revenue: 528976.82,
    growthPct: 7.9,
    growthAbs: 27335.08,
    previous: 501641.73,
    counters: [1.345, 2.456, 3.678, 2.89],
    chartValue: 2.456,
    chartChange: 41.67,
    area: [18.4, 15.2, 16.9, 20.6, 17.8, 19.3],
    columns: [-11.8, 34, 34.9, 47.2, 28.3, -22, -29.1, -48, 14.5, 35.3, 28.3, 15.1],
    rows: [
      [300.56, 261.72, 64.81],
      [145.71, 126.88, 31.53],
      [286.9, 249.82, 63.06],
      [355.2, 309.29, 77.08],
      [173.05, 150.67, 37.56],
    ],
  },
  "This year": {
    revenue: 6214508.9,
    growthPct: 12.4,
    growthAbs: 685710.3,
    previous: 5528798.6,
    counters: [16.14, 29.47, 44.13, 34.68],
    chartValue: 29.47,
    chartChange: 18.2,
    area: [21.1, 19.4, 20.2, 23.5, 22.0, 22.8],
    columns: [8, 26, 38, 44, 36, -10, -18, -26, 30, 42, 46, 34],
    rows: [
      [420.3, 360.5, 96.2],
      [380.1, 330.2, 88.4],
      [455.6, 392.8, 104.7],
      [470.2, 410.5, 110.3],
      [398.7, 344.1, 92.6],
    ],
  },
};

export const yLabels = ["Ξ 24", "Ξ 20", "Ξ 16", "Ξ 12", "Ξ 8"];
export const timeLabels = ["1AM", "2AM", "3AM", "4AM", "5AM"];
export const legend = [
  { icon: "/figma/legend-1.svg", label: "Online" },
  { icon: "/figma/legend-2.svg", label: "Retail" },
  { icon: "/figma/legend-3.svg", label: "Wholesale" },
];

export type Status = "Approved" | "Error" | "Pending" | "In Progress";

export const reports: {
  id: number;
  name: string;
  status: Status;
  date: string;
  iso: string;
  progress: number;
}[] = [
  { id: 1, name: "Marketplace", status: "Approved", date: "18 Apr 2021", iso: "2021-04-18", progress: 72.2 },
  { id: 2, name: "Marketplace", status: "Error", date: "20 May 2021", iso: "2021-05-20", progress: 85.2 },
  { id: 3, name: "Weekly Updates", status: "Approved", date: "12 Jul 2021", iso: "2021-07-12", progress: 54.6 },
  { id: 4, name: "Monthly Review", status: "Pending", date: "19 Jul 2021", iso: "2021-07-19", progress: 54.6 },
  { id: 5, name: "Feature Launch", status: "Approved", date: "26 Jul 2021", iso: "2021-07-26", progress: 54.6 },
  { id: 6, name: "Bug Fixes", status: "In Progress", date: "02 Aug 2021", iso: "2021-08-02", progress: 54.6 },
];

export const statuses: Status[] = ["Approved", "Error", "Pending", "In Progress"];

export const notifications = [
  { id: 1, title: "Savannah Nguyen commented on Monthly Review", time: "Just now" },
  { id: 2, title: "Marketplace report failed to sync", time: "1h ago" },
  { id: 3, title: "Revenue grew 7.9% this month", time: "Yesterday" },
];
