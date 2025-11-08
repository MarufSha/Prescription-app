"use client";

import { useState } from "react";
import { z } from "zod";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { formatDate, todayFormatted } from "@/lib/utils";

/* --------------------------------
   Schema + types shared by pages
----------------------------------- */

export type Sex = "male" | "female" | "other";
export const sexEnum = z.enum(["male", "female", "other"]);

export const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    age: z.number({ message: "Age must be a number." }).min(1, {
      message: "Age must be at least 1 digit.",
    }),
    // optional in type so we can reset to undefined; enforced required via refine
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
  .refine((d) => !!d.sex, {
    path: ["sex"],
    message: "Please select a gender.",
  });

export type FormValues = z.infer<typeof formSchema>;

/* --------------------------------
   Reusable Field Components
----------------------------------- */

// Simple text input field
export function TextField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  className,
}: {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  const { control } = useFormContext<TFieldValues>();
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Number input with min=1 and “no wheel” glitch guard
export function NumberField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  className,
  min = 1,
}: {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  className?: string;
  min?: number;
}) {
  const { control } = useFormContext<TFieldValues>();
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={min}
              onWheel={(e) => e.currentTarget.blur()}
              onInput={(e) => {
                const v = e.currentTarget.value;
                if (Number(v) < min) e.currentTarget.value = "";
              }}
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") field.onChange(undefined);
                else {
                  const n = Number(raw);
                  field.onChange(n >= min ? n : undefined);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Sex Select that actually resets cleanly
export function SexField<TFieldValues extends FieldValues>({
  name,
  label = "Sex",
  className,
}: {
  name: FieldPath<TFieldValues>;
  label?: string;
  className?: string;
}) {
  const { control } = useFormContext<TFieldValues>();
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select
            value={field.value ?? ""}
            onValueChange={(val) => field.onChange(val as FormValues["sex"])}
          >
            <FormControl>
              <SelectTrigger className="w-full min-w-48">
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
  );
}

// Read-only date input with Calendar popover (self-contained state)
export function DateField<TFieldValues extends FieldValues>({
  name,
  label = "Date",
  className,
}: {
  name: FieldPath<TFieldValues>;
  label?: string;
  className?: string;
}) {
  const { control } = useFormContext<TFieldValues>();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(undefined);
  const [inputValue, setInputValue] = useState("");

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
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
                    selected={field.value as unknown as Date}
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
  );
}
