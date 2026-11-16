"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Menu,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: UserRound },
  { href: "/patients", label: "Patients", icon: Users },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
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
  );
}

function Navigation({
  pathname,
  closeMobile,
}: {
  pathname: string;
  closeMobile?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={closeMobile}
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
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await api.post("/auth/logout").catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-5 md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
        >
          <Menu size={22} />
        </button>
      </header>

      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 md:hidden ${mobileOpen ? "visible" : "invisible delay-300"}`}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          tabIndex={mobileOpen ? 0 : -1}
          className={`absolute inset-0 h-full w-full bg-slate-950/40 transition-opacity duration-300 ease-in-out ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          inert={!mobileOpen}
          className={`absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
            <Brand />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-5 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
            Workspace
          </div>
          <Navigation
            pathname={pathname}
            closeMobile={() => setMobileOpen(false)}
          />
          <div className="mt-auto border-t border-slate-100 p-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>
      </div>

      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-[76px] items-center border-b border-slate-100 px-6">
          <Brand />
        </div>
        <div className="px-5 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
          Workspace
        </div>
        <Navigation pathname={pathname} />
        <div className="mt-auto p-4">
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
      </aside>
    </>
  );
}
