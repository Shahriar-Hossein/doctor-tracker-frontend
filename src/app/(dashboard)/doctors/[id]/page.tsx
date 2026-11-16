"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Pagination from "@/components/Pagination";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  phone: string;
  notes?: string;
};
type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  email: string;
  phone: string;
  patients: Patient[];
  pagination: { total: number; page: number; totalPages: number };
};
const empty = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  condition: "",
  notes: "",
};
function DoctorDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [patientPage, setPatientPage] = useState(1);
  const load = useCallback(async (page = 1) => {
    try {
      const { data } = await api.get(`/doctors/${id}`, {
        params: { page, limit: 10 },
      });
      setDoctor(data);
      setPatientPage(data.pagination.page);
      setError("");
    } catch {
      setError("Unable to load this doctor profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  async function addPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/patients", {
        ...form,
        age: Number(form.age),
        doctor: id,
      });
      setForm(empty);
      await load(patientPage);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
          "Could not add the patient. Check all fields and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function removePatient(patientId: string) {
    if (!window.confirm("Remove this patient record? This cannot be undone."))
      return;
    try {
      await api.delete(`/patients/${patientId}`);
      await load(patientPage);
    } catch {
      setError("Could not remove this patient. Please try again.");
    }
  }
  if (loading)
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        Loading doctor profile…
      </div>
    );
  if (!doctor)
    return (
      <div className="space-y-5">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700"
        >
          <ArrowLeft size={16} />
          Back to doctors
        </Link>
        <div
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error || "Doctor not found."}
        </div>
      </div>
    );
  return (
    <div className="space-y-7">
      <Link
        href="/doctors"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-700"
      >
        <ArrowLeft size={16} />
        Doctor directory
      </Link>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
            <Stethoscope size={28} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
              DOCTOR PROFILE
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {doctor.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {doctor.specialization}{" "}
              <span className="px-1 text-slate-300">·</span> {doctor.hospital}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-800">
              {doctor.pagination.total}
            </p>
            <p className="text-xs text-slate-400">Patients</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="mr-2 text-slate-400">Email</span>
            {doctor.email}
          </p>
          <p>
            <span className="mr-2 text-slate-400">Phone</span>
            {doctor.phone}
          </p>
        </div>
      </section>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}
      <form
        onSubmit={addPatient}
        className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-lg bg-teal-50 p-2 text-teal-700">
            <Plus size={17} />
          </span>
          <div>
            <h2 className="text-sm font-bold">Add patient</h2>
            <p className="mt-1 text-xs text-slate-400">
              Assign a new patient to Dr. {doctor.name.split(" ")[0]}.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <input
            required
            minLength={2}
            placeholder="Patient name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-teal-600"
          />
          <input
            required
            type="number"
            min="0"
            max="130"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-teal-600"
          />
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-teal-600"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input
            required
            minLength={6}
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-teal-600"
          />
          <input
            required
            minLength={2}
            placeholder="Condition"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-teal-600"
          />
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-teal-600"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            <Plus size={16} />
            {busy ? "Adding…" : "Add patient"}
          </button>
        </div>
      </form>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <span className="rounded-lg bg-sky-50 p-2 text-sky-700">
            <Users size={17} />
          </span>
          <div>
            <h2 className="text-sm font-bold">Assigned patients</h2>
            <p className="mt-1 text-xs text-slate-400">
              Patients currently under this doctor’s care
            </p>
          </div>
        </div>
        {doctor.patients.length ? (
          <div className="divide-y divide-slate-100">
            {doctor.patients.map((patient) => (
              <div
                key={patient._id}
                className="flex items-center gap-3 px-5 py-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <UserRound size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {patient.name}{" "}
                    <span className="font-normal text-slate-400">
                      · {patient.age}, {patient.gender}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {patient.condition}{" "}
                    <span className="px-1 text-slate-300">·</span>{" "}
                    {patient.phone}
                  </p>
                </div>
                <button
                  aria-label={`Remove ${patient.name}`}
                  onClick={() => void removePatient(patient._id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-slate-400">
            No patients assigned yet.
          </div>
        )}
        <Pagination
          page={doctor.pagination.page}
          totalPages={doctor.pagination.totalPages}
          onPageChange={(page) => void load(page)}
        />
      </section>
    </div>
  );
}

export default function DoctorDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-slate-400">
          Loading doctor profile…
        </div>
      }
    >
      <DoctorDetailContent />
    </Suspense>
  );
}
