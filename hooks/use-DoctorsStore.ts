"use client";

import { useSyncExternalStore } from "react";
import * as doctorStore from "@/lib/storage/doctor";
import type { DoctorTypeData } from "@/types/doctorTypeData";

type DoctorsSnapshot = {
  doctors: DoctorTypeData[];
  currentDoctorId: number | null;
};

const SERVER_SNAPSHOT: DoctorsSnapshot = {
  doctors: [],
  currentDoctorId: null,
};

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function notifyDoctorsStore() {
  for (const cb of listeners) cb();
}

let clientSnapshot: DoctorsSnapshot = SERVER_SNAPSHOT;
let clientSnapshotKey = "";

function getClientSnapshot(): DoctorsSnapshot {
  if (typeof window === "undefined") {
    return SERVER_SNAPSHOT;
  }

  const doctors = doctorStore.loadDoctors();
  const currentDoctorId = doctorStore.loadCurrentDoctorId() ?? null;

  const key = JSON.stringify({
    currentDoctorId,
    doctors,
  });

  if (key === clientSnapshotKey) {
    return clientSnapshot;
  }

  clientSnapshotKey = key;
  clientSnapshot = { doctors, currentDoctorId };
  return clientSnapshot;
}

function getServerSnapshot(): DoctorsSnapshot {
  return SERVER_SNAPSHOT;
}

export function useDoctorsStore() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
