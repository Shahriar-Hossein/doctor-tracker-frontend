"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, Stethoscope, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/lib/api";

type Stats = {
  summary: { totalDoctors: number; totalPatients: number };
  patientsPerDoctor: { name: string; patientCount: number }[];
  dailyPatients: { date: string; count: number }[];
  conditionBreakdown: { condition: string; count: number }[];
};
const colors = [
  "#0f766e",
  "#38a89d",
  "#8bc9be",
  "#b6ddd4",
  "#d3eae4",
  "#e5f2ee",
];
const tooltipStyle = { borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [todayLabel, setTodayLabel] = useState("");
  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch(() =>
        setError("Could not load dashboard data. Please refresh to try again."),
      );
  }, []);
  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);
  const dateLabel = (date: string) => {
    const [, month, day] = date.split("-").map(Number);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[month - 1]} ${day}`;
  };
  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            YOUR CLINIC AT A GLANCE
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Good day, Admin
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Here’s what’s happening across your care team.
          </p>
        </div>
        <div className="text-sm text-slate-400">{todayLabel}</div>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}
      <section className="grid gap-4 sm:grid-cols-2">
        <Metric
          title="Total doctors"
          value={stats?.summary.totalDoctors}
          icon={<Stethoscope size={19} />}
          tint="teal"
          hint="Care team members"
        />
        <Metric
          title="Total patients"
          value={stats?.summary.totalPatients}
          icon={<Users size={19} />}
          tint="blue"
          hint="Patient records"
        />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="Patients per doctor"
          subtitle="Patient assignments across your team"
          icon={<Users size={17} />}
        >
          <div className="h-[280px]">
            {stats?.patientsPerDoctor.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.patientsPerDoctor.slice(0, 8)}
                  margin={{ top: 12, right: 8, left: -20, bottom: 4 }}
                >
                  <CartesianGrid stroke="#edf1f2" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="patientCount"
                    name="Patients"
                    fill="#0f766e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart loading={!stats} />
            )}
          </div>
        </ChartCard>
        <ChartCard
          title="Patient conditions"
          subtitle="Most common recorded conditions"
          icon={<Activity size={17} />}
        >
          <div className="flex h-[280px] items-center">
            {stats?.conditionBreakdown.length ? (
              <div className="flex w-full items-center gap-2">
                <div className="h-[220px] min-w-0 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.conditionBreakdown}
                        dataKey="count"
                        nameKey="condition"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={3}
                      >
                        {stats.conditionBreakdown.map((entry, i) => (
                          <Cell
                            key={entry.condition}
                            fill={colors[i % colors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 pr-2">
                  {stats.conditionBreakdown.slice(0, 6).map((entry, i) => (
                    <div
                      key={entry.condition}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: colors[i % colors.length] }}
                      />
                      <span className="max-w-[108px] truncate text-slate-500">
                        {entry.condition}
                      </span>
                      <strong className="text-slate-800">{entry.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyChart loading={!stats} />
            )}
          </div>
        </ChartCard>
      </section>
      <ChartCard
        title="Daily patient intake"
        subtitle="New patient records over the last two weeks"
        icon={<Activity size={17} />}
      >
        <div className="h-[270px]">
          {stats?.dailyPatients.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.dailyPatients}
                margin={{ top: 15, right: 12, left: -18, bottom: 4 }}
              >
                <CartesianGrid stroke="#edf1f2" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={dateLabel}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={(value) => dateLabel(String(value))}
                  contentStyle={tooltipStyle}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="New patients"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#0f766e", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart loading={!stats} />
          )}
        </div>
      </ChartCard>
      <section className="grid gap-4 sm:grid-cols-2">
        <QuickLink
          href="/doctors"
          title="Manage your doctors"
          text="View the team and add a doctor profile"
          icon={<Stethoscope size={18} />}
        />
        <QuickLink
          href="/patients"
          title="Browse patient records"
          text="Search and update your patient directory"
          icon={<Users size={18} />}
        />
      </section>
    </div>
  );
}
function Metric({
  title,
  value,
  icon,
  tint,
  hint,
}: {
  title: string;
  value?: number;
  icon: React.ReactNode;
  tint: string;
  hint: string;
}) {
  const style =
    tint === "teal" ? "bg-teal-50 text-teal-700" : "bg-sky-50 text-sky-700";
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.025)]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <span className={`rounded-xl p-2.5 ${style}`}>{icon}</span>
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value ?? "—"}
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.025)] sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="rounded-lg bg-teal-50 p-2 text-teal-700">{icon}</span>
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
function EmptyChart({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      {loading ? "Loading chart…" : "No data to display yet"}
    </div>
  );
}
function QuickLink({
  href,
  title,
  text,
  icon,
}: {
  href: string;
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-teal-200 hover:shadow-sm"
    >
      <span className="rounded-xl bg-teal-50 p-3 text-teal-700">{icon}</span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm text-slate-800">{title}</strong>
        <span className="mt-1 block text-xs text-slate-400">{text}</span>
      </span>
      <ArrowUpRight
        size={17}
        className="text-slate-300 transition group-hover:text-teal-700"
      />
    </Link>
  );
}
