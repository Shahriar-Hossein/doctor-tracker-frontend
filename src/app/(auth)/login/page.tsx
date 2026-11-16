"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  LockKeyhole,
  Mail,
  Stethoscope,
} from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (!data.user) throw new Error("Invalid login response");
      router.replace("/");
      router.refresh();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      setError(
        message || "Unable to sign in. Check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#073e3b] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-3">
            <Stethoscope size={24} />
          </div>
          <span className="text-lg font-bold tracking-tight">CareTrack</span>
        </div>
        <div className="relative max-w-xl pb-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-teal-100">
            <Activity size={14} /> CLINIC OPERATIONS, IN FOCUS
          </div>
          <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
            Better care starts with a clearer picture.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-teal-100/75">
            A calm, connected workspace for managing your doctors, patients, and
            the details that keep care moving.
          </p>
          <div className="mt-12 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="h-9 w-9 rounded-full border-2 border-[#073e3b] bg-teal-200" />
              <div className="h-9 w-9 rounded-full border-2 border-[#073e3b] bg-amber-200" />
              <div className="h-9 w-9 rounded-full border-2 border-[#073e3b] bg-rose-200" />
            </div>
            <span className="text-xs text-teal-100/70">
              Thoughtfully organized for your team
            </span>
          </div>
        </div>
        <p className="relative text-xs text-teal-100/50">
          Secure administrative access · CareTrack
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-teal-700 p-2.5 text-white">
              <Stethoscope size={22} />
            </div>
            <span className="font-bold">CareTrack</span>
          </div>
          <p className="mb-3 text-sm font-semibold text-teal-700">
            WELCOME BACK
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your workspace
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your administrator credentials to continue.
          </p>
          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </span>
              <span className="relative block">
                <Mail
                  className="absolute left-3.5 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                  placeholder="you@clinic.com"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <span className="relative block">
                <LockKeyhole
                  className="absolute left-3.5 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                  placeholder="Enter your password"
                />
              </span>
            </label>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3.5 text-sm font-bold text-white shadow-sm shadow-teal-900/10 transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? (
                "Signing in…"
              ) : (
                <>
                  Sign in <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-slate-400">
            Your account is protected with secure authentication.
          </p>
        </div>
      </section>
    </main>
  );
}
