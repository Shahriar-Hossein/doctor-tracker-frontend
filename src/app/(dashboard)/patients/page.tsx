"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import Pagination from "@/components/Pagination";

type DoctorInfo = {
  _id: string;
  name: string;
  specialization?: string;
  hospital?: string;
};

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  notes?: string;
  doctor?: DoctorInfo;
  createdAt: string;
};

type Page = { total: number; page: number; totalPages: number };

const blank = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  condition: "",
  notes: "",
  doctor: "",
};

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

  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    api
      .get("/doctors", { params: { limit: 100 } })
      .then(({ data }) => {
        if (!ignore && Array.isArray(data.data)) {
          setDoctors(data.data);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

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

  function closeModal() {
    setOpen(false);
    setEditing(null);
    setEditingPatient(null);
    setForm(blank);
    setError("");
  }

  function editPatient(patient: Patient) {
    setError("");
    setEditing(patient._id);
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender || "Male",
      phone: patient.phone,
      condition: patient.condition,
      notes: patient.notes || "",
      doctor: patient.doctor?._id || "",
    });
    setOpen(true);
  }

  async function savePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        phone: form.phone.trim(),
        condition: form.condition.trim(),
        notes: form.notes.trim(),
      };

      if (form.doctor) {
        payload.doctor = form.doctor;
      }

      if (editing) {
        await api.patch(`/patients/${editing}`, payload);
      } else {
        if (!form.doctor) {
          setError("Please select an assigned doctor.");
          setBusy(false);
          return;
        }
        await api.post("/patients", payload);
      }

      closeModal();
      await load(editing ? pagination.page : 1);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Could not save patient. Check all fields and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(patient: Patient) {
    if (!window.confirm(`Delete ${patient.name}? This cannot be undone.`))
      return;
    setError("");
    try {
      await api.delete(`/patients/${patient._id}`);
      await load(pagination.page);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Could not delete this patient. Please try again.",
      );
    }
  }

  const doctorOptions = [...doctors];
  if (
    editingPatient?.doctor?._id &&
    !doctorOptions.some((d) => d._id === editingPatient.doctor?._id)
  ) {
    doctorOptions.unshift(editingPatient.doctor);
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-teal-700">PATIENT DIRECTORY</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Patients</h1>
          <p className="mt-2 text-sm text-slate-500">
            Search, filter, and manage your clinic’s patient records.
          </p>
        </div>
        <button
          onClick={() => {
            setError("");
            setEditing(null);
            setEditingPatient(null);
            setForm(blank);
            setOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800"
        >
          <Plus size={17} /> Add patient
        </button>
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
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UserRound size={18} />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {p.age} years · {p.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                      {p.condition}
                    </span>
                    {p.notes && (
                      <p
                        className="mt-1 line-clamp-1 max-w-xs text-xs text-slate-400"
                        title={p.notes}
                      >
                        {p.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{p.phone}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {p.doctor?._id ? (
                      <Link
                        href={`/doctors/${p.doctor._id}`}
                        className="font-medium text-slate-700 hover:text-teal-700"
                      >
                        {p.doctor.name}
                      </Link>
                    ) : (
                      <span className="text-slate-400">
                        {p.doctor?.name || "Unassigned"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        onClick={() => editPatient(p)}
                        aria-label={`Edit ${p.name}`}
                        className="text-slate-400 hover:text-teal-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => void remove(p)}
                        aria-label={`Delete ${p.name}`}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-form-heading"
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="patient-form-heading" className="text-lg font-bold">
                  {editing ? "Edit patient" : "Add a patient"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editing
                    ? "Update patient details and care information."
                    : "Add a new patient record to your clinic."}
                </p>
              </div>
              <button
                onClick={closeModal}
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

            <form onSubmit={savePatient} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Full name
                <input
                  required
                  minLength={2}
                  type="text"
                  placeholder="Patient full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Age
                <input
                  required
                  type="number"
                  min="0"
                  max="130"
                  placeholder="Age"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Gender
                <select
                  required
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Phone number
                <input
                  required
                  minLength={6}
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Condition
                <input
                  required
                  minLength={2}
                  type="text"
                  placeholder="Primary condition"
                  value={form.condition}
                  onChange={(e) =>
                    setForm({ ...form, condition: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Assigned doctor
                <select
                  required={!editing}
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                >
                  <option value="" disabled={!editing}>
                    {editing
                      ? "Keep current doctor / Select a doctor"
                      : "Select a doctor"}
                  </option>
                  {doctorOptions.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name}
                      {doc.specialization ? ` (${doc.specialization})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Notes (optional)
                <textarea
                  rows={3}
                  placeholder="Medical notes or special observations"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  disabled={busy}
                  className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {busy ? "Saving…" : editing ? "Save changes" : "Save patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
