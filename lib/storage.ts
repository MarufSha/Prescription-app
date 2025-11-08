import { PatientTypeData } from "@/types/patientTypeData";

const LS_KEY = "prescriptions:v1";
const ID_SEQ_KEY = "prescriptions:id-seq";

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
  items.unshift(item); // newest first
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
  // optional: reset the counter too
  try {
    localStorage.removeItem(ID_SEQ_KEY);
  } catch {}
}

/**
 * Returns a fresh unique ID.
 * Safe to call inside event handlers (e.g., onSubmit). Do NOT call during render.
 */
export function nextId(): number {
  if (typeof window === "undefined") return 1;

  // Read persisted sequence
  let current = parseInt(localStorage.getItem(ID_SEQ_KEY) ?? "0", 10);
  if (!Number.isFinite(current) || current < 0) current = 0;

  // If the counter is missing or behind, seed from the current max id
  if (current === 0) {
    const items = loadAll();
    const maxExisting = items.reduce((m, it) => (it.id > m ? it.id : m), 0);
    current = maxExisting;
  }

  const newId = current + 1;
  localStorage.setItem(ID_SEQ_KEY, String(newId));
  return newId;
}
