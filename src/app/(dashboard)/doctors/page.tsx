"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Pencil,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import Pagination from "@/components/Pagination";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  email: string;
  phone: string;
};
type Page = { total: number; page: number; totalPages: number };
const blank = {
  name: "",
  specialization: "",
  hospital: "",
  email: "",
  phone: "",
};
export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState<Page>({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const query = useDebounce(search);
  const [specialization, setSpecialization] = useState("");
  const specializationQuery = useDebounce(specialization);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await api.get("/doctors", {
          params: {
            page,
            limit: 10,
            search: query || undefined,
            specialization: specializationQuery || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
        });
        setDoctors(data.data);
        setPagination(data.pagination);
      } catch {
        setError("Unable to load doctors. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [query, specializationQuery, startDate, endDate],
  );
  useEffect(() => {
    void load(1);
  }, [load]);
  async function saveDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (editing) await api.patch(`/doctors/${editing}`, form);
      else await api.post("/doctors", form);
      setForm(blank);
      setEditing(null);
      setOpen(false);
      await load(1);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Could not save doctor. Check all fields and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function editDoctor(doctor: Doctor) {
    setError("");
    setEditing(doctor._id);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      email: doctor.email,
      phone: doctor.phone,
    });
    setOpen(true);
  }
  async function deleteDoctor(doctor: Doctor) {
    if (!window.confirm(`Delete ${doctor.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await api.delete(`/doctors/${doctor._id}`);
      await load(pagination.page);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Could not delete doctor. Please try again.",
      );
    }
  }
  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-teal-700">YOUR CARE TEAM</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage doctor profiles and view their patient lists.
          </p>
        </div>
        <button
          onClick={() => {
            setError("");
            setEditing(null);
            setForm(blank);
            setOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800"
        >
          <Plus size={17} /> Add doctor
        </button>
      </header>
      <div className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <input
            aria-label="Search doctors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, specialty, or hospital"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          />
        </label>
        <input
          aria-label="Filter by specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          placeholder="Filter specialization"
          className="rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
        />
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5">
          <span className="shrink-0 text-xs font-semibold text-slate-400">
            From
          </span>
          <input
            aria-label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="min-w-0 flex-1 py-2 text-sm text-slate-600 outline-none"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5">
          <span className="shrink-0 text-xs font-semibold text-slate-400">
            To
          </span>
          <input
            aria-label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="min-w-0 flex-1 py-2 text-sm text-slate-600 outline-none"
          />
        </label>
      </div>
      {error && !open && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold">Doctor directory</h2>
            <p className="mt-1 text-xs text-slate-400">
              {pagination.total} {pagination.total === 1 ? "doctor" : "doctors"}
            </p>
          </div>
          <span className="rounded-lg bg-teal-50 p-2 text-teal-700">
            <Stethoscope size={17} />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Doctor</th>
                <th className="px-5 py-3.5">Specialization</th>
                <th className="px-5 py-3.5">Hospital</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                        {doctor.name
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {doctor.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {doctor.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {doctor.specialization}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {doctor.hospital}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{doctor.phone}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        onClick={() => editDoctor(doctor)}
                        aria-label={`Edit ${doctor.name}`}
                        className="text-slate-400 hover:text-teal-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => void deleteDoctor(doctor)}
                        aria-label={`Delete ${doctor.name}`}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900"
                      >
                        View <ArrowRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !doctors.length && (
            <div className="p-12 text-center text-sm text-slate-400">
              No doctors found. Add a doctor to build your team.
            </div>
          )}
          {loading && (
            <div className="p-12 text-center text-sm text-slate-400">
              Loading doctor directory…
            </div>
          )}
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => void load(page)}
        />
      </section>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-form-heading"
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="doctor-form-heading" className="text-lg font-bold">
                  {editing ? "Edit doctor" : "Add a doctor"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add their profile to your care team.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
              >
                {error}
              </div>
            )}
            <form onSubmit={saveDoctor} className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Full name", "text"],
                  ["specialization", "Specialization", "text"],
                  ["hospital", "Hospital", "text"],
                  ["email", "Email address", "email"],
                  ["phone", "Phone number", "tel"],
                ] as const
              ).map(([key, label, type]) => (
                <label
                  key={key}
                  className="text-sm font-semibold text-slate-700"
                >
                  {label}
                  <input
                    required
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                  />
                </label>
              ))}
              <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  disabled={busy}
                  className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy ? "Saving…" : editing ? "Save changes" : "Save doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
