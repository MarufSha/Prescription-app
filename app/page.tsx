"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useCurrentDoctorId,
  CURRENT_DOCTOR_LOADING_ID,
  CURRENT_DOCTOR_NONE_ID,
} from "@/hooks/use-CurrentDoctor";
import * as doctorStore from "@/lib/storage/doctor";
import type { DoctorTypeData } from "@/types/doctorTypeData";

export default function Home() {
  const doctorId = useCurrentDoctorId();

  const isLoading = doctorId === CURRENT_DOCTOR_LOADING_ID;
  const hasNoDoctor = doctorId === CURRENT_DOCTOR_NONE_ID;

  let currentDoctor: DoctorTypeData | null = null;
  if (!isLoading && !hasNoDoctor && doctorId > 0) {
    currentDoctor = doctorStore.getDoctorById(doctorId);
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center mb-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : currentDoctor ? (
          <div
            className="w-full max-w-xl p-6 rounded-2xl bg-white dark:bg-neutral-900 
                shadow-lg border border-neutral-200 dark:border-neutral-800 
                flex items-center gap-5"
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-lg">DR</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">
                Welcome, Dr. {currentDoctor.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your dashboard is ready — create or review prescriptions
                anytime.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center mt-4">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-950/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-600 dark:text-blue-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M5.93 19h12.14a2 2 0 001.79-2.894l-6.07-12.14a2 2 0 00-3.58 0L4.14 16.106A2 2 0 005.93 19z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold mt-4">No Doctor Profile Yet</h2>

            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Before you can create prescriptions, please set up your doctor
              information.
            </p>

            <Link href="/doctor-profile" className="mt-4">
              <Button className="cursor-pointer">Create Doctor Profile</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold font-sans">
          Welcome to the Prescription Application
        </h1>
        <p className="text-muted-foreground font-semibold mt-2">
          Select one of these options or go to the page directly from the
          sidebar
        </p>
      </div>
      <div className="space-x-6">
        <Link href="/create-prescription">
          <Button variant="outline" className="cursor-pointer">
            Create A Prescription
          </Button>
        </Link>
        <Link href="/previous-prescription">
          <Button variant="outline" className="cursor-pointer">
            View Past Prescriptions
          </Button>
        </Link>
      </div>
    </div>
  );
}
