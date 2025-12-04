"use client";

import { useSyncExternalStore } from "react";
import * as doctorStore from "@/lib/storage/doctor";

const LOADING_ID = -2;
const NO_DOCTOR_ID = -1;

function subscribe(_callback: () => void) {
  return () => {};
}

function getSnapshot(): number {
  if (typeof window === "undefined") {
    return LOADING_ID;
  }
  const id = doctorStore.loadCurrentDoctorId();
  return id ?? NO_DOCTOR_ID;
}

function getServerSnapshot(): number {
  return LOADING_ID;
}

export function useCurrentDoctorId() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const CURRENT_DOCTOR_LOADING_ID = LOADING_ID;
export const CURRENT_DOCTOR_NONE_ID = NO_DOCTOR_ID;
