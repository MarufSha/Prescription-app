import type { DoctorTypeData } from "@/types/doctorTypeData";
import { DOCTORS_KEY, DOCTOR_ID_SEQ_KEY } from "@/lib/utils";

const CURRENT_DOCTOR_ID_KEY = "doctors:current-id";

export function loadDoctors(): DoctorTypeData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DOCTORS_KEY);
    return raw ? (JSON.parse(raw) as DoctorTypeData[]) : [];
  } catch {
    return [];
  }
}

export function saveDoctors(items: DoctorTypeData[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DOCTORS_KEY, JSON.stringify(items));
}

export function addDoctor(item: DoctorTypeData) {
  const items = loadDoctors();
  items.unshift(item);
  saveDoctors(items);
}

export function updateDoctor(id: number, patch: Partial<DoctorTypeData>) {
  const items = loadDoctors();
  const next = items.map((it) => (it.id === id ? { ...it, ...patch } : it));
  saveDoctors(next);
}

export function removeDoctor(id: number) {
  const items = loadDoctors().filter((it) => it.id !== id);
  saveDoctors(items);

  if (typeof window !== "undefined") {
    const currentRaw = window.localStorage.getItem(CURRENT_DOCTOR_ID_KEY);
    const currentId = currentRaw ? Number(currentRaw) : null;
    if (currentId === id) {
      const newCurrent = items[0]?.id ?? null;
      if (newCurrent == null) {
        window.localStorage.removeItem(CURRENT_DOCTOR_ID_KEY);
      } else {
        window.localStorage.setItem(CURRENT_DOCTOR_ID_KEY, String(newCurrent));
      }
    }
  }
}

export function getDoctorById(id: number): DoctorTypeData | null {
  return loadDoctors().find((it) => it.id === id) ?? null;
}

export function clearAllDoctors() {
  saveDoctors([]);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DOCTOR_ID_SEQ_KEY);
      window.localStorage.removeItem(CURRENT_DOCTOR_ID_KEY);
    }
  } catch {}
}

export function nextDoctorId(): number {
  if (typeof window === "undefined") return 1;

  let current = parseInt(
    window.localStorage.getItem(DOCTOR_ID_SEQ_KEY) ?? "0",
    10
  );
  if (!Number.isFinite(current) || current < 0) current = 0;

  if (current === 0) {
    const items = loadDoctors();
    const maxExisting = items.reduce((m, it) => (it.id > m ? it.id : m), 0);
    current = maxExisting;
  }

  const newId = current + 1;
  window.localStorage.setItem(DOCTOR_ID_SEQ_KEY, String(newId));
  return newId;
}

export function loadCurrentDoctorId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CURRENT_DOCTOR_ID_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function saveCurrentDoctorId(id: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_DOCTOR_ID_KEY, String(id));
}
