import { PatientRegistryEntry, PatientTypeData } from "@/types/patientTypeData";
import {
  ID_SEQ_KEY,
  LS_KEY,
  NEXT_PUID_KEY,
  normalizeMobile,
  PATIENTS_KEY,
} from "./utils";

export function loadAll(): PatientTypeData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as PatientTypeData[]) : [];
  } catch {
    return [];
  }
}

export function saveAll(items: PatientTypeData[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function add(item: PatientTypeData) {
  const items = loadAll();
  items.unshift(item);
  saveAll(items);
}

export function update(id: number, patch: Partial<PatientTypeData>) {
  const items = loadAll();
  const next = items.map((it) => (it.id === id ? { ...it, ...patch } : it));
  saveAll(next);
}

export function remove(id: number) {
  const items = loadAll();
  saveAll(items.filter((it) => it.id !== id));
}

export function getById(id: number) {
  return loadAll().find((it) => it.id === id) ?? null;
}

export function clearAll() {
  saveAll([]);
  try {
    localStorage.removeItem(ID_SEQ_KEY);
  } catch {}
}

export function nextId(): number {
  if (typeof window === "undefined") return 1;


  let current = parseInt(localStorage.getItem(ID_SEQ_KEY) ?? "0", 10);
  if (!Number.isFinite(current) || current < 0) current = 0;

  if (current === 0) {
    const items = loadAll();
    const maxExisting = items.reduce((m, it) => (it.id > m ? it.id : m), 0);
    current = maxExisting;
  }

  const newId = current + 1;
  localStorage.setItem(ID_SEQ_KEY, String(newId));
  return newId;
}
export function loadPatientRegistry(): PatientRegistryEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PATIENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PatientRegistryEntry[];
  } catch {
    return [];
  }
}

export function savePatientRegistry(patients: PatientRegistryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function loadNextPuid(): number {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(NEXT_PUID_KEY);
  const n = raw ? Number(raw) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function saveNextPuid(next: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEXT_PUID_KEY, String(next));
}

export function getOrCreatePatient(
  name: string,
  mobile: string
): PatientRegistryEntry {
  const patients = loadPatientRegistry();
  const normalizedMobile = normalizeMobile(mobile);
  const normalizedName = name.trim();
  let patient = patients.find(
    (p) => normalizeMobile(p.mobile) === normalizedMobile
  );

  if (!patient) {
    const next = loadNextPuid();
    patient = {
      puid: next,
      name: normalizedName,
      mobile: normalizedMobile,
      lastVisitNo: 0,
    };
    patients.push(patient);
    saveNextPuid(next + 1);
  } else {
    if (patient.name !== normalizedName) {
      patient.name = normalizedName;
    }
  }

  savePatientRegistry(patients);
  return patient;
}

export function incrementVisitNo(puid: number): number {
  const patients = loadPatientRegistry();
  const patient = patients.find((p) => p.puid === puid);
  if (!patient) return 1;
  patient.lastVisitNo += 1;
  savePatientRegistry(patients);
  return patient.lastVisitNo;
}
