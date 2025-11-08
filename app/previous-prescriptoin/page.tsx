"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Pencil, Trash2, ArrowLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { formatDate, todayFormatted } from "@/lib/utils";

type Sex = "male" | "female" | "other";

const sexEnum = z.enum(["male", "female", "other"]);
const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    age: z.number({ message: "Age must be a number." }).min(1, {
      message: "Age must be at least 1 digit.",
    }),
    sex: sexEnum.optional(),
    date: z.date({ message: "Please select a date." }),
    cc: z.string().min(1, { message: "Please describe the main issue." }),
    rx: z.string().optional(),
    pulse: z.string().optional(),
    bp: z.string().optional(),
    spq: z.string().optional(),
    others: z.string().optional(),
    investigations: z.string().optional(),
    advice: z.string().optional(),
  })
  .refine((data) => !!data.sex, {
    path: ["sex"],
    message: "Please select a gender.",
  });

type FormValues = z.infer<typeof formSchema>;

function PreviousPrescriptionPageInner() {
  // Local data (lazy init from localStorage; no effects)
  const [items, setItems] = useState<PatientTypeData[]>(() => store.loadAll());

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Date UI state inside drawer
  const [dateInput, setDateInput] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(undefined);

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
    const d = new Date(row.date);
    form.reset({
      name: row.name,
      age: Number(row.age),
      sex: (row.sex as Sex) ?? undefined,
      date: d,
      cc: row.cc,
      rx: row.rx || "",
      pulse: row.pulse || "",
      bp: row.bp || "",
      spq: row.spq || "",
      others: row.others || "",
      investigations: row.investigations || "",
      advice: row.advice || "",
    });
    setDateInput(formatDate(d));
    setCalendarMonth(d);
    setCalendarOpen(false);
    setDrawerOpen(true);
  }

  function closeEdit() {
    setDrawerOpen(false);
    setEditingId(null);
    setDateInput("");
    setCalendarMonth(undefined);
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
      sex: (values.sex as Sex)!,
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
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Create
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
          <p className="text-sm text-muted-foreground">No saved prescriptions yet.</p>
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
                    Date: {formatDate(new Date(it.date))} · CC: {it.cc || "—"} · RX: {it.rx || "—"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(it.id)}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => handleDelete(it.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Right-side drawer for editing */}
      <Sheet open={drawerOpen} onOpenChange={(o) => (o ? setDrawerOpen(true) : closeEdit())}>
        <SheetContent side="right" className="w-full sm:max-w-2xl px-6">
          <SheetHeader>
            <SheetTitle className="font-semibold pt-8 text-2xl">Edit Prescription</SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitEdit)} className="space-y-6 w-full">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Please Enter Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="age"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            onWheel={(e) => e.currentTarget.blur()}
                            onInput={(e) => {
                              const v = e.currentTarget.value;
                              if (Number(v) < 1) e.currentTarget.value = "";
                            }}
                            placeholder="Please Enter Age"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") field.onChange(undefined);
                              else {
                                const n = Number(raw);
                                field.onChange(n > 0 ? n : undefined);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="sex"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select
                          value={field.value ?? ""} // controlled; "" shows placeholder
                          onValueChange={(val) => field.onChange(val as FormValues["sex"])}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Please Select a Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <FormField
                    name="others"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Others</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Other Information" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <div className="relative w-full">
                            <Input
                              readOnly
                              className="bg-background pr-7 cursor-pointer"
                              value={dateInput || formatDate(field.value)}
                              placeholder={todayFormatted()}
                              onClick={() => setCalendarOpen(true)}
                            />
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  id="date-picker-edit"
                                  variant="ghost"
                                  className="absolute top-1/2 right-1.5 -translate-y-1/2 size-6"
                                  type="button"
                                >
                                  <CalendarIcon className="size-3.5" />
                                  <span className="sr-only">Select date</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="end"
                                alignOffset={-8}
                                sideOffset={8}
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  captionLayout="dropdown"
                                  month={calendarMonth}
                                  onMonthChange={setCalendarMonth}
                                  onSelect={(date) => {
                                    if (!date) return;
                                    field.onChange(date);
                                    setDateInput(formatDate(date));
                                    setCalendarOpen(false);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  name="cc"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>C/C</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter C/C" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="rx"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R/X</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter R/X" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="investigations"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investigations</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Investigations" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="advice"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advice</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Advice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SheetFooter className="pt-2">
                  <Button type="submit">Update</Button>
                  <SheetClose asChild>
                    <Button type="button" variant="secondary" onClick={closeEdit}>
                      Close
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Disable SSR for this page (safe localStorage usage; no hydration lint)
export default dynamic(() => Promise.resolve(PreviousPrescriptionPageInner), {
  ssr: false,
});
