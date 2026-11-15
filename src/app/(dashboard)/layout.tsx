import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f8f9] text-slate-900">
      <Sidebar />
      <main className="min-h-screen px-4 py-6 sm:px-7 md:ml-[248px] md:px-10 md:py-9">
        <div className="mx-auto w-full max-w-[1360px]">{children}</div>
      </main>
    </div>
  );
}
