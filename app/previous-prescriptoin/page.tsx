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
import type { PatientTypeData } from "@/types/patientTypeData";
import { formatDate } from "@/lib/utils";

import {
  formSchema,
  FormValues,
  TextField,
  NumberField,
  SexField,
  DateField,
} from "@/lib/prescription-form";

function PreviousPrescriptionPageInner() {
  const [items, setItems] = useState<PatientTypeData[]>(() => store.loadAll());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: undefined,
      sex: undefined,
      date: new Date(),
      cc: "",
      rx: "",
      pulse: "",
      bp: "",
      spq: "",
      others: "",
      investigations: "",
      advice: "",
    },
  });

  const hasItems = items.length > 0;
  const header = useMemo(() => "Previous Prescriptions", []);

  function openEdit(id: number) {
    const row = store.getById(id);
    if (!row) return;

    setEditingId(id);
    form.reset({
      name: row.name,
      age: Number(row.age),
      sex: (row.sex as FormValues["sex"]) ?? undefined,
      date: new Date(row.date),
      cc: row.cc,
      rx: row.rx || "",
      pulse: row.pulse || "",
      bp: row.bp || "",
      spq: row.spq || "",
      others: row.others || "",
      investigations: row.investigations || "",
      advice: row.advice || "",
    });

    setDrawerOpen(true);
  }

  function closeEdit() {
    setDrawerOpen(false);
    setEditingId(null);
    form.reset({
      name: "",
      age: undefined,
      sex: undefined,
      date: new Date(),
      cc: "",
      rx: "",
      pulse: "",
      bp: "",
      spq: "",
      others: "",
      investigations: "",
      advice: "",
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
      rx: values.rx ?? "",
      pulse: values.pulse ?? "",
      bp: values.bp ?? "",
      spq: values.spq ?? "",
      others: values.others ?? "",
      investigations: values.investigations ?? "",
      advice: values.advice ?? "",
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
                    #{it.id} · {it.name} · {it.age} · {it.sex.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Date: {formatDate(new Date(it.date))} · CC: {it.cc || "—"} ·
                    RX: {it.rx || "—"}
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
          className="w-full sm:max-w-2xl px-6"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle className="font-semibold pt-8 text-2xl">
              Edit Prescription
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(submitEdit)}
                className="space-y-6 w-full"
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

                <TextField<FormValues>
                  name="cc"
                  label="C/C"
                  placeholder="Enter C/C"
                />
                <TextField<FormValues>
                  name="rx"
                  label="R/X"
                  placeholder="Enter R/X"
                />
                <TextField<FormValues>
                  name="investigations"
                  label="Investigations"
                  placeholder="Enter Investigations"
                />
                <TextField<FormValues>
                  name="advice"
                  label="Advice"
                  placeholder="Enter Advice"
                />

                <SheetFooter className="pt-2">
                  <Button type="submit">Update</Button>
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={closeEdit}
                    >
                      Close
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </FormProvider>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default dynamic(() => Promise.resolve(PreviousPrescriptionPageInner), {
  ssr: false,
});
