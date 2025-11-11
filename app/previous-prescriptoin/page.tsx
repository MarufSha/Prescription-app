"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import * as store from "@/lib/storage";
import type {
  PatientTypeData,
  RxItem,
  RxTimesPerDay,
} from "@/types/patientTypeData";
import { formatDate } from "@/lib/utils";

import {
  formSchema,
  FormValues,
  TextField,
  NumberField,
  SexField,
  DateField,
  ArrayTextList,
  ArrayRxList,
} from "@/lib/prescription-form";

function PreviousPrescriptionPageInner() {
  const [items, setItems] = useState<PatientTypeData[]>(() => store.loadAll());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldUnregister: true,
    defaultValues: {
      name: "",
      age: undefined,
      sex: undefined,
      date: new Date(),
      cc: [],
      rx: [],
      pulse: "",
      bp: "",
      sp02: "",
      others: "",
      investigations: [],
      advice: [],
    },
  });

  const hasItems = items.length > 0;
  const header = useMemo(() => "Previous Prescriptions", []);

  function openEdit(id: number) {
    const row = store.getById(id);
    if (!row) return;

    // ---- helpers ----
    const isTimesPerDay = (s: unknown): s is RxTimesPerDay =>
      typeof s === "string" && /^[01]\+[01]\+[01]$/.test(s);

    const toNumberish = (v: unknown): number | undefined => {
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const n = Number(v.trim());
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };

    const normalizedRx: RxItem[] = Array.isArray(row.rx)
      ? (row.rx as unknown[]).map((r) => {
          const obj = r as Record<string, unknown>;

          const drug =
            typeof obj.drug === "string" && obj.drug.trim() !== ""
              ? obj.drug
              : undefined;

          const durationDays = toNumberish(obj.durationDays);

          const timesPerDay = isTimesPerDay(obj.timesPerDay)
            ? obj.timesPerDay
            : undefined;

          const timing =
            obj.timing === "before" ||
            obj.timing === "after" ||
            obj.timing === "anytime"
              ? obj.timing
              : undefined;

          return { drug, durationDays, timesPerDay, timing };
        })
      : [];

    // Prepare values once
    const values: FormValues = {
      name: row.name ?? "",
      age: Number(row.age) as number,
      sex: (row.sex as FormValues["sex"]) ?? undefined,
      date: new Date(row.date),

      cc: Array.isArray(row.cc) ? row.cc : row.cc ? [row.cc] : [],
      rx: normalizedRx,
      investigations: Array.isArray(row.investigations)
        ? row.investigations
        : row.investigations
        ? [row.investigations]
        : [],
      advice: Array.isArray(row.advice)
        ? row.advice
        : row.advice
        ? [row.advice]
        : [],

      pulse: row.pulse || "",
      bp: row.bp || "",
      sp02: row.sp02 || "",
      others: row.others || "",
    };

    // ---- open first, then reset on next tick (needed with shouldUnregister: true) ----
    setEditingId(id);
    setDrawerOpen(true);

    setTimeout(() => {
      form.reset(values);
    }, 0);
  }
  function closeEdit() {
    setDrawerOpen(false);
    setEditingId(null);
    form.reset({
      name: "",
      age: undefined,
      sex: undefined,
      date: new Date(),

      cc: [""],
      rx: [],
      investigations: [],
      advice: [],

      pulse: "",
      bp: "",
      sp02: "",
      others: "",
    });
  }

  function submitEdit(values: FormValues) {
    if (!editingId) return;
    const patch: Partial<PatientTypeData> = {
      name: values.name,
      age: values.age,
      sex: values.sex!,
      date: values.date.toISOString(),
      cc: values.cc,
      rx: values.rx,
      investigations: values.investigations,
      advice: values.advice,
      pulse: values.pulse ?? "",
      bp: values.bp ?? "",
      sp02: values.sp02 ?? "",
      others: values.others ?? "",
    };

    store.update(editingId, patch);
    setItems(store.loadAll());
    closeEdit();
  }

  function handleDelete(id: number) {
    store.remove(id);
    setItems(store.loadAll());
    if (editingId === id) closeEdit();
  }

  function clearAll() {
    store.clearAll();
    setItems([]);
    closeEdit();
  }

  return (
    <div className="flex flex-col gap-6 pt-6 items-center h-full">
      <div className="w-full max-w-5xl flex items-center justify-between px-1">
        <h1 className="text-xl font-semibold">{header}</h1>
        <div className="flex gap-2">
          <Link href="/create-prescription">
            <Button variant="outline" className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Create
            </Button>
          </Link>
          <Button
            variant="destructive"
            disabled={!hasItems}
            onClick={clearAll}
            className="cursor-pointer"
          >
            Clear All
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-5xl p-4">
        {!hasItems ? (
          <p className="text-sm text-muted-foreground">
            No saved prescriptions yet.
          </p>
        ) : (
          <div className="grid gap-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex flex-wrap items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    #{it.id} · {it.name} · {it.age} · {it.sex}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Date: {formatDate(new Date(it.date))} · CC:{" "}
                    {Array.isArray(it.cc) ? it.cc[0] ?? "—" : it.cc || "—"} · RX
                    items: {Array.isArray(it.rx) ? it.rx.length : it.rx ? 1 : 0}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(it.id)}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => handleDelete(it.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Sheet
        open={drawerOpen}
        onOpenChange={(o) => (o ? setDrawerOpen(true) : closeEdit())}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl px-0 flex h-full flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="px-6">
            <SheetTitle className="font-semibold pt-8 text-2xl">
              Edit Prescription
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex-1 overflow-y-auto px-6">
            <FormProvider {...form} key={editingId ?? "new"}>
              <form
                onSubmit={form.handleSubmit(submitEdit)}
                className="space-y-6 w-full pb-24"
              >
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <TextField<FormValues>
                    name="name"
                    label="Name"
                    placeholder="Please Enter Name"
                  />
                  <NumberField<FormValues>
                    name="age"
                    label="Age"
                    placeholder="Please Enter Age"
                  />
                  <SexField<FormValues> name="sex" />
                </div>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <TextField<FormValues>
                    name="others"
                    label="Others"
                    placeholder="Enter Other Information"
                    className="sm:col-span-2"
                  />
                  <DateField<FormValues> name="date" />
                </div>

                <ArrayTextList
                  name="cc"
                  label="C/C"
                  placeholder="Enter a complaint..."
                />
                <ArrayRxList name="rx" label="R/X" />
                <ArrayTextList
                  name="investigations"
                  label="Investigations"
                  placeholder="Enter an investigation..."
                />
                <ArrayTextList
                  name="advice"
                  label="Advice"
                  placeholder="Enter advice..."
                />
              </form>
            </FormProvider>
          </div>
          <SheetFooter className="sticky bottom-0 border-t bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 px-6 py-4">
            <Button
              type="submit"
              className="cursor-pointer"
              onClick={form.handleSubmit(submitEdit)}
            >
              Update
            </Button>
            <SheetClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
                onClick={closeEdit}
              >
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default dynamic(() => Promise.resolve(PreviousPrescriptionPageInner), {
  ssr: false,
});
