import ChartsColumn from "@/components/ChartsColumn";
import DashboardShell from "@/components/DashboardShell";
import ReportHeader from "@/components/ReportHeader";
import ReportTable from "@/components/ReportTable";
import RevenueSummary from "@/components/RevenueSummary";
import Toolbar from "@/components/Toolbar";
import TopBar from "@/components/TopBar";

export default function Home() {
  return (
    <DashboardShell>
      <TopBar />
      <section
        data-animate="panel"
        className="flex flex-col gap-6 rounded-[20px] bg-white p-4 sm:p-[30px]"
      >
        <Toolbar />
        <div className="flex flex-col gap-[29px] pt-2">
          <ReportHeader />
          <RevenueSummary />
        </div>
        {/* minmax(0,1fr) lets the wide report table scroll inside its card on phones. */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-[26px] xl:grid-cols-[648px_minmax(0,1fr)]">
          <ChartsColumn />
          <ReportTable />
        </div>
      </section>
    </DashboardShell>
  );
}
