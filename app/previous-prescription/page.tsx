"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowLeft, Download, ArrowUpDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import * as store from "@/lib/storage/patients";
import type {
  PatientTypeData,
  RxItem,
  RxTimesPerDay,
  SortKey,
  SearchKey,
} from "@/types/patientTypeData";
import { formatDate, formatFullDate } from "@/lib/utils";

import {
  formSchema,
  FormValues,
  TextField,
  SexField,
  DateField,
  ArrayTextList,
  ArrayRxList,
  isRxEmpty,
  NumberField,
} from "@/lib/prescription-form";
import { downloadPrescriptionFromServer } from "@/lib/utils";
import { useDoctorsStore } from "@/hooks/use-DoctorsStore";
import { Input } from "@/components/ui/input";
function PreviousPrescriptionPageInner() {
  const [items, setItems] = useState<PatientTypeData[]>(() => store.loadAll());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { doctors, currentDoctorId } = useDoctorsStore();
  const currentDoctor = doctors.find((d) => d.id === currentDoctorId) ?? null;
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchKey, setSearchKey] = useState<SearchKey>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const resolver = zodResolver(formSchema) as unknown as Resolver<
    FormValues,
    undefined,
    FormValues
  >;

  const form = useForm<FormValues>({
    resolver,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldUnregister: false,
    defaultValues: {
      name: "",
      age: undefined as unknown as number,
      sex: undefined,
      mobile: "",
      date: new Date(),
      cc: [],
      rx: [],
      pulse: "",
      bp: "",
      sp02: "",
      weight: undefined as unknown as number,
      others: "",
      investigations: [],
      advice: [],
      followupDays: undefined as unknown as number,
    },
  });

  const hasItems = items.length > 0;
  const header = useMemo(() => "Previous Prescriptions", []);

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
  const rowToFormValues = (row: PatientTypeData): FormValues => {
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
              ? (obj.timing as RxItem["timing"])
              : undefined;

          return { drug, durationDays, timesPerDay, timing };
        })
      : [];

    return {
      name: row.name ?? "",
      age: Number(row.age) as number,
      sex: (row.sex as FormValues["sex"]) ?? undefined,
      date: new Date(row.date),
      mobile: row.mobile ?? "",

      cc: Array.isArray(row.cc)
        ? row.cc.length
          ? row.cc
          : [""]
        : row.cc
        ? [row.cc]
        : [""],
      dx: Array.isArray(row.dx) ? row.dx : row.dx ? [row.dx] : [],
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
      weight:
        typeof row.weight === "number"
          ? (row.weight as number)
          : (undefined as unknown as number),
      others: row.others || "",
      followupDays:
        typeof row.followupDays === "number"
          ? (row.followupDays as number)
          : (undefined as unknown as number),
    };
  };
  const openEdit = useCallback(
    (id: number) => {
      const row = store.getById(id);
      if (!row) return;

      const values = rowToFormValues(row);

      setEditingId(id);
      setDrawerOpen(true);
      setTimeout(() => form.reset(values), 0);
    },
    [form]
  );

  const closeEdit = useCallback(() => {
    setDrawerOpen(false);
    setEditingId(null);
    form.reset({
      name: "",
      age: undefined as unknown as number,
      sex: undefined,
      date: new Date(),
      cc: [""],
      dx: [],
      rx: [],
      investigations: [],
      advice: [],
      pulse: "",
      bp: "",
      sp02: "",
      others: "",
    });
  }, [form]);

  const submitEdit = useCallback(
    (values: FormValues) => {
      if (!editingId) return;

      const rawRx = (values.rx ?? []) as RxItem[];
      const rxClean: RxItem[] = rawRx
        .map((r) => {
          const drug =
            typeof r.drug === "string" && r.drug.trim() !== ""
              ? r.drug.trim()
              : undefined;

          const durationDays =
            typeof r.durationDays === "number" &&
            Number.isFinite(r.durationDays)
              ? r.durationDays
              : undefined;

          const timesPerDay = r.timesPerDay ?? undefined;
          const timing =
            r.timing === "before" ||
            r.timing === "after" ||
            r.timing === "anytime"
              ? r.timing
              : undefined;
          return {
            drug,
            durationDays,
            timesPerDay,
            timing,
          };
        })

        .filter((r) => !isRxEmpty(r));

      const patch: Partial<PatientTypeData> = {
        name: values.name,
        age: values.age,
        sex: values.sex!,
        mobile: values.mobile,
        date: values.date.toISOString(),
        cc: values.cc,
        dx: values.dx,
        rx: rxClean,
        investigations: values.investigations,
        advice: values.advice,
        pulse: values.pulse ?? "",
        bp: values.bp ?? "",
        sp02: values.sp02 ?? "",
        weight: values.weight,
        others: values.others ?? "",
        followupDays: values.followupDays ?? undefined,
      };

      store.update(editingId, patch);
      setItems(store.loadAll());
      closeEdit();
    },
    [editingId, closeEdit, setItems]
  );
  const onFormSubmit = useCallback(
    (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();
      return form.handleSubmit(submitEdit)(e);
    },
    [form, submitEdit]
  );

  const handleDelete = useCallback(
    (id: number) => {
      store.remove(id);
      setItems(store.loadAll());
      if (editingId === id) closeEdit();
    },
    [editingId, closeEdit]
  );

  const handleDownload = useCallback(
    async (id: number) => {
      const row = store.getById(id);
      if (!row) return;

      const values = rowToFormValues(row);

      await downloadPrescriptionFromServer(
        {
          ...values,
          puid: typeof row.puid === "number" ? row.puid : undefined,
          followupDays:
            typeof row.followupDays === "number"
              ? row.followupDays
              : values.followupDays,
        },
        currentDoctor
      );
    },
    [currentDoctor]
  );

  const clearAll = useCallback(() => {
    store.clearAll();
    setItems([]);
    closeEdit();
  }, [closeEdit]);
  const getSortValue = (
    row: PatientTypeData,
    key: SortKey
  ): string | number => {
    switch (key) {
      case "id":
        return row.id ?? 0;

      case "name":
        return (row.name ?? "").toString().toLowerCase();

      case "age": {
        const n = Number(row.age);
        return Number.isFinite(n) ? n : 0;
      }

      case "visitNo": {
        const raw =
          typeof row.visitNo === "number"
            ? row.visitNo
            : row.visitNo !== undefined
            ? Number(row.visitNo)
            : 0;
        return Number.isFinite(raw) ? raw : 0;
      }

      case "puid": {
        const raw =
          typeof row.puid === "number"
            ? row.puid
            : row.puid !== undefined
            ? Number(row.puid)
            : 0;
        return Number.isFinite(raw) ? raw : 0;
      }

      case "weight": {
        const n =
          typeof row.weight === "number"
            ? row.weight
            : row.weight !== undefined
            ? Number(row.weight)
            : 0;
        return Number.isFinite(n) ? n : 0;
      }

      default:
        return row.id ?? 0;
    }
  };
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;

    return items.filter((row) => {
      switch (searchKey) {
        case "name": {
          const v = (row.name ?? "").toString().toLowerCase();
          return v.includes(q);
        }
        case "mobile": {
          const v = (row.mobile ?? "").toString().toLowerCase();
          return v.includes(q);
        }
        case "puid": {
          const raw =
            typeof row.puid === "number"
              ? row.puid
              : row.puid !== undefined
              ? Number(row.puid)
              : undefined;
          const v = raw !== undefined ? String(raw) : "";
          return v.toLowerCase().includes(q);
        }
        case "visitNo": {
          const raw =
            typeof row.visitNo === "number"
              ? row.visitNo
              : row.visitNo !== undefined
              ? Number(row.visitNo)
              : undefined;
          const v = raw !== undefined ? String(raw) : "";
          return v.toLowerCase().includes(q);
        }
        case "cc": {
          let ccText = "";
          if (Array.isArray(row.cc)) {
            ccText = row.cc.join(" ");
          } else if (row.cc) {
            ccText = String(row.cc);
          }
          return ccText.toLowerCase().includes(q);
        }
        default:
          return true;
      }
    });
  }, [items, searchKey, searchQuery]);

  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    list.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);

      if (av < bv) return sortDirection === "asc" ? -1 : 1;
      if (av > bv) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredItems, sortKey, sortDirection]);
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

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
      <div className="w-full max-w-5xl px-1 flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={sortKey}
            onValueChange={(val) => setSortKey(val as SortKey)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="id">ID</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="age">Age</SelectItem>
              <SelectItem value="visitNo">Visit No</SelectItem>
              <SelectItem value="puid">PUID</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleSortDirection}
            className="cursor-pointer"
            disabled={!hasItems}
            aria-label="Toggle sort direction"
            title={
              sortDirection === "asc"
                ? "Ascending (click to switch to descending)"
                : "Descending (click to switch to ascending)"
            }
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {sortDirection === "asc" ? "Ascending" : "Descending"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={searchKey}
            onValueChange={(val) => setSearchKey(val as SearchKey)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="puid">PUID</SelectItem>
              <SelectItem value="visitNo">Visit No</SelectItem>
              <SelectItem value="cc">C/C</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="w-40 sm:w-56"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="w-full max-w-5xl p-4">
        {!hasItems ? (
          <p className="text-sm text-muted-foreground">
            No saved prescriptions yet.
          </p>
        ) : (
          <div className="grid gap-2">
            {sortedItems.map((it) => (
              <div
                key={it.id}
                className="flex flex-wrap items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="font-medium">
                    #{it.id} · {it.name} · {it.age} ·{" "}
                    {it.sex
                      ? it.sex.charAt(0).toUpperCase() + it.sex.slice(1)
                      : "—"}{" "}
                    · Visit: {typeof it.visitNo === "number" ? it.visitNo : "—"}{" "}
                    · PUID:{" "}
                    {typeof it.puid === "number"
                      ? `P-${String(it.puid).padStart(4, "0")}`
                      : "—"}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Date: {formatDate(new Date(it.date))} · Mobile:{" "}
                    {it.mobile || "—"}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    CC: {Array.isArray(it.cc) ? it.cc[0] ?? "—" : it.cc || "—"}{" "}
                    · RX items: {Array.isArray(it.rx) ? it.rx.length : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Follow up:{" "}
                    {typeof it.followupDays === "number"
                      ? formatFullDate(
                          new Date(
                            new Date(it.date).getTime() +
                              it.followupDays * 24 * 60 * 60 * 1000
                          )
                        )
                      : "—"}
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
                    variant="outline"
                    onClick={() => handleDownload(it.id)}
                    className="cursor-pointer"
                  >
                    <Download className="mr-1 h-4 w-4" /> Download PDF
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
              <form onSubmit={onFormSubmit} className="space-y-6 w-full pb-24">
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
                  <TextField<FormValues>
                    name="mobile"
                    label="Mobile"
                    placeholder="Enter Mobile Number"
                    className="sm:col-span-2"
                  />
                  <NumberField<FormValues>
                    name="weight"
                    label="Weight (kg)"
                    placeholder="0.1 – 1000"
                    step={0.1}
                    min={0.1}
                    max={1000}
                  />
                </div>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <TextField<FormValues> name="pulse" label="Pulse" />
                  <TextField<FormValues> name="sp02" label="Sp02" />
                  <TextField<FormValues> name="bp" label="BP" />
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

                <ArrayTextList<FormValues>
                  name="cc"
                  label="C/C"
                  placeholder="Enter a complaint..."
                />
                <ArrayTextList<FormValues>
                  name="dx"
                  label="D/x"
                  placeholder="Enter a diagnosis..."
                />
                <ArrayRxList<FormValues> name="rx" label="R/X" />
                <ArrayTextList<FormValues>
                  name="investigations"
                  label="Investigations"
                  placeholder="Enter an investigation..."
                />
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <ArrayTextList<FormValues>
                    name="advice"
                    label="Advice"
                    placeholder="Enter advice..."
                    className="sm:col-span-2"
                  />
                  <NumberField<FormValues>
                    name="followupDays"
                    label="Follow up in (days)"
                    placeholder="e.g. 3"
                  />
                </div>

                <button type="submit" className="hidden" />
              </form>
            </FormProvider>
          </div>
          <SheetFooter className="sticky bottom-0 border-t bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 px-6 py-4">
            <Button
              type="submit"
              className="cursor-pointer"
              onClick={onFormSubmit}
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
