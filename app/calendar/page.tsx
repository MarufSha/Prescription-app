"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowLeft,
} from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import * as store from "@/lib/storage/patients";
import type {
  FollowupAppointment,
  PatientTypeData,
} from "@/types/patientTypeData";
import { formatFullDate } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dateKey(d: Date) {
  return startOfDay(d).toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function CalendarPageInner() {
  const today = useMemo(() => startOfDay(new Date()), []);

  const items = useMemo<PatientTypeData[]>(() => store.loadAll(), []);

  const appointmentsByDate = useMemo(() => {
    const map: Record<string, FollowupAppointment[]> = {};

    for (const row of items) {
      const followupDays =
        typeof row.followupDays === "number" ? row.followupDays : NaN;
      if (!Number.isFinite(followupDays) || followupDays < 1) continue;

      const baseDate = new Date(row.date);
      const followup = startOfDay(
        new Date(baseDate.getTime() + followupDays * DAY_MS)
      );

      if (followup < today) continue;

      const key = dateKey(followup);
      const ccSummary = Array.isArray(row.cc) ? row.cc[0] ?? "" : row.cc ?? "";

      const appt: FollowupAppointment = {
        id: row.id,
        puid: row.puid,
        visitNo: row.visitNo,
        patientName: row.name,
        appointmentDate: followup,
        originalDate: baseDate,
        followupDays,
        ccSummary,
      };

      if (!map[key]) map[key] = [];
      map[key].push(appt);
    }

    for (const arr of Object.values(map)) {
      arr.sort(
        (a, b) =>
          a.appointmentDate.getTime() - b.appointmentDate.getTime() ||
          a.id - b.id
      );
    }

    return map;
  }, [items, today]);

  const allAppointments = useMemo(
    () => Object.values(appointmentsByDate).flat(),
    [appointmentsByDate]
  );

  const firstAppointmentDate = useMemo(() => {
    if (!allAppointments.length) return today;
    const earliest = Math.min(
      ...allAppointments.map((a) => a.appointmentDate.getTime())
    );
    return new Date(earliest);
  }, [allAppointments, today]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(firstAppointmentDate);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(firstAppointmentDate);

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date | undefined>(
    selectedDate ?? firstAppointmentDate
  );
  const [pickerMonth, setPickerMonth] = useState<Date>(currentMonth);
  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth]
  );

  const monthlyAppointmentCount = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    let count = 0;

    for (const list of Object.values(appointmentsByDate)) {
      for (const appt of list) {
        if (
          appt.appointmentDate.getFullYear() === year &&
          appt.appointmentDate.getMonth() === month
        ) {
          count += 1;
        }
      }
    }
    return count;
  }, [appointmentsByDate, currentMonth]);

  const days = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const firstOfMonth = new Date(y, m, 1);
    const startDay = firstOfMonth.getDay();

    const startDate = new Date(y, m, 1 - startDay);
    startDate.setHours(0, 0, 0, 0);

    const result: { date: Date; inCurrentMonth: boolean }[] = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      d.setHours(0, 0, 0, 0);

      result.push({
        date: d,
        inCurrentMonth: d.getMonth() === m,
      });
    }
    return result;
  }, [currentMonth]);

  const goPrev = () => {
    setCurrentMonth((old) =>
      startOfDay(new Date(old.getFullYear(), old.getMonth() - 1, 1))
    );
  };

  const goNext = () => {
    setCurrentMonth((old) =>
      startOfDay(new Date(old.getFullYear(), old.getMonth() + 1, 1))
    );
  };

  const handleSelectFromPopover = (date: Date | undefined) => {
    if (!date) return;

    setPickerDate(date);

    const monthStart = startOfDay(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );

    setCurrentMonth(monthStart);
    setSelectedDate(date);
    setPickerMonth(monthStart);
    setMonthPickerOpen(false);
  };

  const selectedKey = dateKey(selectedDate);
  const selectedList = appointmentsByDate[selectedKey] ?? [];
  const handleResetToToday = () => {
    const monthStart = startOfDay(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    setCurrentMonth(monthStart);
    setSelectedDate(today);
    setPickerDate(today);
    setPickerMonth(monthStart);
    setMonthPickerOpen(false);
  };

  const handleApplySelection = () => {
    const base = pickerMonth ?? today;

    const monthStart = startOfDay(
      new Date(base.getFullYear(), base.getMonth(), 1)
    );

    setCurrentMonth(monthStart);
    setSelectedDate(monthStart);
    setMonthPickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pt-6 items-center h-full">
      <div className="w-full max-w-6xl flex items-center justify-between px-1">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Follow-up Calendar
        </h1>

        <div className="flex gap-2">
          <Link href="/create-prescription">
            <Button variant="outline" className="cursor-pointer">
              <ArrowLeft /> Back to Create
            </Button>
          </Link>
          <Link href="/previous-prescription">
            <Button variant="outline" className="cursor-pointer">
              <ArrowLeft /> Previous Prescriptions
            </Button>
          </Link>
        </div>
      </div>

      <Card className="w-full max-w-6xl p-4 md:p-6">
        {!allAppointments.length ? (
          <p className="text-sm text-muted-foreground">
            No follow-up appointments yet.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <Popover
                    open={monthPickerOpen}
                    onOpenChange={(open) => {
                      setMonthPickerOpen(open);
                      if (open) {
                        setPickerMonth(currentMonth);
                        setPickerDate(selectedDate);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="font-semibold text-lg hover:underline underline-offset-4 cursor-pointer text-left inline-flex items-center gap-2"
                      >
                        {monthLabel}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="center"
                      className="p-0 w-auto rounded-md!"
                      sideOffset={4}
                    >
                      <div className="flex flex-col">
                        <Calendar
                          mode="single"
                          selected={pickerDate ?? selectedDate}
                          onSelect={handleSelectFromPopover}
                          month={pickerMonth}
                          onMonthChange={setPickerMonth}
                          initialFocus
                          captionLayout="dropdown"
                          fromYear={2000}
                          toYear={2100}
                          className="rounded-md"
                          modifiers={{
                            today: today,
                          }}
                          modifiersClassNames={{
                            today:
                              "border-blue-500 ring-2 ring-blue-400 bg-blue-50/40 rounded-md",
                          }}
                        />

                        <div className="border-t px-3 py-2 flex items-center justify-between">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="px-4"
                            onClick={handleResetToToday}
                          >
                            Clear
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            className="px-4"
                            onClick={handleApplySelection}
                          >
                            OK
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <span className="text-xs text-muted-foreground">
                    {monthlyAppointmentCount} appointment
                    {monthlyAppointmentCount === 1 ? "" : "s"} in{" "}
                    {currentMonth.toLocaleString("en-US", { month: "long" })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={goPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={goNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-xs font-medium text-center mb-2 text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map(({ date, inCurrentMonth }) => {
                  const key = dateKey(date);
                  const appts = appointmentsByDate[key] ?? [];
                  const isSel = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, today);

                  const cls = [
                    "flex flex-col w-full items-start justify-between p-2.5 h-24 text-xs rounded-lg border transition-all cursor-pointer",
                    inCurrentMonth
                      ? "bg-muted/40"
                      : "bg-muted/20 text-muted-foreground/70",
                    appts.length
                      ? "border-primary/50 shadow-sm"
                      : "border-border/60",
                    isToday &&
                      "border-blue-500 ring-2 ring-blue-400 bg-blue-50/40",
                    isSel
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                      : "hover:bg-background hover:border-primary/40",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={key}
                      type="button"
                      className={cls}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-semibold">
                          {date.getDate()}
                        </span>
                      </div>

                      <div className="mt-auto w-full text-[0.7rem] flex items-center justify-center text-center">
                        {appts.length > 0 ? (
                          <span className="font-medium">
                            {appts.length} appointment
                            {appts.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="opacity-0 select-none">
                            0 appointments
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-sm font-semibold">
                  Appointments on {formatFullDate(selectedDate)}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Showing follow-ups computed from saved prescriptions.
                </p>
              </div>

              {!selectedList.length ? (
                <p className="text-sm text-muted-foreground">
                  No appointments on this day.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedList.map((appt) => (
                    <div
                      key={appt.id}
                      className="border rounded-md p-3 text-sm space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {appt.patientName}
                        </span>
                        <span className="text-[0.7rem] text-muted-foreground ml-2">
                          #{appt.id} • Visit {appt.visitNo}
                        </span>
                      </div>

                      {appt.ccSummary && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          CC: {appt.ccSummary}
                        </p>
                      )}

                      <p className="text-[0.7rem] text-muted-foreground">
                        Prescribed: {formatFullDate(appt.originalDate)} • After{" "}
                        {appt.followupDays} day
                        {appt.followupDays > 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CalendarPageInner), {
  ssr: false,
});
