"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Search, Trash2, Users, X } from "lucide-react";
import api from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import Pagination from "@/components/Pagination";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  doctor?: { name: string };
  createdAt: string;
};
type Page = { total: number; page: number; totalPages: number };
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<Page>({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const debouncedSearch = useDebounce(search);
  const debouncedCondition = useDebounce(condition);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", condition: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/patients", {
          params: {
            page,
            limit: 10,
            search: debouncedSearch || undefined,
            condition: debouncedCondition || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
        });
        setPatients(data.data);
        setPagination(data.pagination);
      } catch {
        setError("Unable to load patient records. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, debouncedCondition, startDate, endDate],
  );
  useEffect(() => {
    void load(1);
  }, [load]);
  function beginEdit(patient: Patient) {
    setEditing(patient._id);
    setForm({
      name: patient.name,
      condition: patient.condition,
      phone: patient.phone,
    });
  }
  async function save(id: string) {
    try {
      await api.patch(`/patients/${id}`, form);
      setEditing(null);
      await load(pagination.page);
    } catch {
      setError(
        "Could not update this patient. Please check the details and try again.",
      );
    }
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this patient record? This cannot be undone."))
      return;
    try {
      await api.delete(`/patients/${id}`);
      await load(pagination.page);
    } catch {
      setError("Could not delete this patient. Please try again.");
    }
  }
  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-semibold text-teal-700">PATIENT DIRECTORY</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Patients</h1>
        <p className="mt-2 text-sm text-slate-500">
          Search, filter, and manage your clinic’s patient records.
        </p>
      </header>
      <section className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <label className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <input
            aria-label="Search patients"
            placeholder="Search name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          />
        </label>
        <input
          aria-label="Filter by condition"
          placeholder="Condition (e.g. Diabetes)"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
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
      </section>
      {error && (
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
            <h2 className="text-sm font-bold">All patient records</h2>
            <p className="mt-1 text-xs text-slate-400">
              {pagination.total} {pagination.total === 1 ? "record" : "records"}
            </p>
          </div>
          <span className="rounded-lg bg-sky-50 p-2 text-sky-700">
            <Users size={17} />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Condition</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Assigned doctor</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    {editing === p._id ? (
                      <div className="flex gap-2">
                        <input
                          aria-label="Patient name"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          className="w-40 rounded-lg border px-2 py-1.5 text-sm"
                        />
                        <span className="self-center text-xs text-slate-400">
                          {p.age} · {p.gender}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {p.age} years · {p.gender}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editing === p._id ? (
                      <input
                        aria-label="Patient condition"
                        value={form.condition}
                        onChange={(e) =>
                          setForm({ ...form, condition: e.target.value })
                        }
                        className="w-36 rounded-lg border px-2 py-1.5 text-sm"
                      />
                    ) : (
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                        {p.condition}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editing === p._id ? (
                      <input
                        aria-label="Patient phone"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className="w-32 rounded-lg border px-2 py-1.5 text-sm"
                      />
                    ) : (
                      <span className="text-slate-600">{p.phone}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {p.doctor?.name || "Unassigned"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {editing === p._id ? (
                      <div className="inline-flex gap-1">
                        <button
                          aria-label="Save changes"
                          onClick={() => void save(p._id)}
                          className="rounded-lg p-2 text-teal-700 hover:bg-teal-50"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          aria-label="Cancel editing"
                          onClick={() => setEditing(null)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex gap-1">
                        <button
                          aria-label={`Edit ${p.name}`}
                          onClick={() => beginEdit(p)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          aria-label={`Delete ${p.name}`}
                          onClick={() => void remove(p._id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !patients.length && (
            <div className="p-12 text-center text-sm text-slate-400">
              No matching patient records.
            </div>
          )}
          {loading && (
            <div className="p-12 text-center text-sm text-slate-400">
              Loading patient records…
            </div>
          )}
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => void load(page)}
        />
      </section>
    </div>
  );
}
