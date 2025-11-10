"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";
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
import { useFieldArray } from "react-hook-form";
import { X, Plus } from "lucide-react";

type RepeatableKey = "cc" | "rx" | "investigations" | "advice";

const optionalStringList = z.preprocess(
  (v) =>
    Array.isArray(v)
      ? v.filter((s) => typeof s === "string" && s.trim() !== "")
      : [],
  z.array(z.string().min(1)).default([])
);

const requiredStringList = z.preprocess(
  (v) =>
    Array.isArray(v)
      ? v.filter((s) => typeof s === "string" && s.trim() !== "")
      : [],
  z.array(z.string().min(1)).min(1, "Add at least one C/C.")
);

export function ArrayTextList({
  name,
  label,
  placeholder = "Type here...",
  className,
}: {
  name: RepeatableKey;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  const { control, register, formState, clearErrors } =
    useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  useEffect(() => {
    if (fields.length === 0) {
      append("");
    }
  }, [fields.length, append]);

  const listValues = useWatch({ control, name }) as string[] | undefined;
  useEffect(() => {
    const arr = Array.isArray(listValues) ? listValues : [];
    const hasNonEmpty = arr.some(
      (s) => typeof s === "string" && s.trim() !== ""
    );

    if (hasNonEmpty && (formState.errors as Record<string, unknown>)[name]) {
      clearErrors(name);
    }
  }, [listValues, name, clearErrors, formState.errors]);

  type ArrayErrShape = {
    message?: string;
    root?: { message?: string };
    _errors?: string[];
  };
  const rawErr = (formState.errors as Record<string, unknown>)[name] as
    | ArrayErrShape
    | undefined;
  const arrayErrorMessage =
    rawErr?.message ??
    rawErr?.root?.message ??
    (rawErr?._errors && rawErr._errors[0]) ??
    undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={className}>
          <FormLabel className="flex items-center justify-between">
            <span>{label}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append("")}
              className="cursor-pointer"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </FormLabel>

          <div className="space-y-2">
            {fields.map((f, idx) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input
                  placeholder={placeholder}
                  {...register(`${name}.${idx}` as const)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(idx)}
                  className="cursor-pointer"
                  aria-label={`Remove ${label} item ${idx + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <FormMessage />
          {arrayErrorMessage && (
            <p className="text-[0.8rem] font-medium text-destructive">
              {arrayErrorMessage}
            </p>
          )}
        </FormItem>
      )}
    />
  );
}

export type Sex = "male" | "female" | "other";
export const sexEnum = z.enum(["male", "female", "other"]);

export const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z
    .number({
      message: "Age is required.",
    })
    .min(0, "Invalid age."),
  sex: z.enum(["male", "female", "other"]),
  date: z.date(),

  cc: requiredStringList,
  rx: optionalStringList,
  investigations: optionalStringList,
  advice: optionalStringList,

  pulse: z.string().optional(),
  bp: z.string().optional(),
  sp02: z.string().optional(),
  others: z.string().optional(),
});

export type FormValues = z.output<typeof formSchema>;
export type FormInput = z.input<typeof formSchema>;

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
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

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
                    selected={(field.value as unknown as Date) ?? undefined}
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
