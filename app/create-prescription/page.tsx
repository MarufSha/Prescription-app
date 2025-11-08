"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

import { formatDate, todayFormatted } from "@/lib/utils";
import * as store from "@/lib/storage";
import type { PatientTypeData } from "@/types/patientTypeData";

type Sex = "male" | "female" | "other";

const sexEnum = z.enum(["male", "female", "other"]);
const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    age: z.number({ message: "Age must be a number." }).min(1, {
      message: "Age must be at least 1 digit.",
    }),
    // optional in type (so we can reset), enforced required via refine
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

const CreatePrescription = () => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(undefined);
  const [inputValue, setInputValue] = useState<string>("");

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

  const submitLabel = useMemo(() => "Save Offline", []);

  function resetForm() {
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
    setInputValue("");
    setMonth(undefined);
  }

  function onSubmit(values: FormValues) {
    const id = store.nextId();

    const payload: PatientTypeData = {
      id,
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

    store.add(payload);
    resetForm();
  }

  return (
    <div className="flex flex-col pt-6 items-center h-full">
      <Card className="flex p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="shrink-0">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Please Enter Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="age"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="shrink-0">
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
                  <FormItem className="shrink-0">
                    <FormLabel>Sex</FormLabel>
                    <Select
                      value={field.value ?? ""} // keep controlled; "" shows placeholder
                      onValueChange={(val) =>
                        field.onChange(val as FormValues["sex"])
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
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

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <FormField
                name="pulse"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="shrink-0">
                    <FormLabel>Pulse</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Please Enter Pulse"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="bp"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="shrink-0">
                    <FormLabel>BP</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Please Enter BP"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="spq"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="shrink-0">
                    <FormLabel>SPQ</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Please Enter SPQ"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <FormField
                name="others"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2 shrink-0">
                    <FormLabel>Others</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter Other Information"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="date"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="shrink-0">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          readOnly
                          className="w-full bg-background pr-7 cursor-pointer"
                          value={inputValue || formatDate(field.value)}
                          placeholder={todayFormatted()}
                          onClick={() => setOpen(true)}
                        />
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="date-picker"
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
                              month={month}
                              onMonthChange={setMonth}
                              onSelect={(date) => {
                                if (!date) return;
                                field.onChange(date);
                                setInputValue(formatDate(date));
                                setOpen(false);
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

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <FormField
                name="cc"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>C/C</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter C/C"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <FormField
                name="rx"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>R/X</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter R/X"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <FormField
                name="investigations"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Investigations</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter Investigations"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <FormField
                name="advice"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Advice</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter Advice"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 justify-between">
              <Button type="submit" variant={"blue"}>
                {submitLabel}
              </Button>
              <Link href="/previous-prescriptoin">
                <Button
                  type="button"
                  variant="default"
                  className="cursor-pointer"
                >
                  View Saved
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePrescription;
