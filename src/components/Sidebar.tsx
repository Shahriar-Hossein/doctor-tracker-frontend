"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: UserRound },
  { href: "/patients", label: "Patients", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await api.post("/auth/logout").catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:left-0 md:w-[248px] md:border-r md:border-b-0">
      <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
          <Stethoscope size={21} />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-tight text-slate-900">
            CareTrack
          </p>
          <p className="text-[11px] font-medium text-slate-400">CLINIC ADMIN</p>
        </div>
      </div>
      <div className="px-5 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
        Workspace
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 md:flex-col">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${active ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon size={18} />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-600" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden p-4 md:block">
        <div className="mb-3 rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-teal-700">
            <Activity size={16} />
            <span className="text-xs font-bold">Care made clearer</span>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            One workspace for your doctors and patient records.
          </p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-500 hover:text-rose-600 md:hidden"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </aside>
  );
}
