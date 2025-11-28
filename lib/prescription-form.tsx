"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
  useFieldArray,
  type FieldArrayPath,
  type Path,
  type PathValue,
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
import { X, Plus } from "lucide-react";
import { RHFInternalOptions, RxTimesPerDay } from "@/types/patientTypeData";

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
const emptyToUndefined = (v: unknown) =>
  v === "" || v === null ? undefined : v;

export const rxTimingEnum = z.enum(["before", "after", "anytime"]);
export type RxTiming = z.infer<typeof rxTimingEnum>;
export const isRxEmpty = (r: Partial<RxItem> | undefined) =>
  !r ||
  ((r.drug ?? "").trim() === "" &&
    r.durationDays === undefined &&
    r.timesPerDay === undefined &&
    r.timing === undefined);

export const rxItemSchema = z.object({
  drug: z.string().optional(),
  durationDays: z
    .preprocess(emptyToUndefined, z.number().int().optional())
    .refine((v) => v === undefined || v >= 1, {
      message: "Must be ≥ 1",
    }),

  timesPerDay: z
    .union([
      z
        .string()
        .regex(/^[01]\+[01]\+[01]$/, {
          message: "Format: 1/0+1/0+1/0",
        })
        .transform((v) => v as RxTimesPerDay),
      z.literal("").transform(() => undefined),
    ])
    .optional(),

  timing: rxTimingEnum.optional(),
});
export function TimesPerDayField<TFieldValues extends FieldValues>({
  name,
  label = "Times/Day",
  className,
}: {
  name: FieldPath<TFieldValues>;
  label?: string;
  className?: string;
}) {
  const { control, formState } = useFormContext<TFieldValues>();

  const extractDigits = (val: string) => val.replace(/[^01]/g, "").slice(0, 3);

  const format = (digits: string) =>
    digits
      .slice(0, 3)
      .split("")
      .map((d, i) => (i < 2 ? `${d}+` : d))
      .join("");

  const handleFormat = (value: string) => format(extractDigits(value));

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => {
        const v = (field.value as string) ?? "";

        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={v}
                onChange={(e) => {
                  field.onChange(handleFormat(e.target.value));
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Backspace") return;

                  const el = e.currentTarget;
                  const len = el.value?.length ?? 0;
                  const start = el.selectionStart ?? len;
                  const end = el.selectionEnd ?? len;
                  if (start === end && end === len) {
                    e.preventDefault();
                    const digits = extractDigits(v);
                    const newDigits = digits.slice(0, -1);
                    field.onChange(format(newDigits));
                  }
                }}
                onPaste={async (e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData?.getData("text") ?? "";
                  if (!pasted && navigator.clipboard) {
                    try {
                      const text = await navigator.clipboard.readText();
                      field.onChange(handleFormat(text));
                      return;
                    } catch {}
                  }
                  field.onChange(handleFormat(pasted));
                }}
                placeholder="D+N+E"
              />
            </FormControl>
            {formState.isSubmitted && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
export type RxItem = z.infer<typeof rxItemSchema>;
export const rx = z.preprocess((v) => {
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
    return (v as string[]).filter(Boolean).map((drug) => ({
      drug,
      durationDays: undefined,
      timesPerDay: undefined,
      timing: undefined,
    }));
  }
  return v;
}, z.array(rxItemSchema).optional().default([]));
export function ArrayTextList<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = "Type here...",
  className,
}: {
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  const { control, register, formState, clearErrors } =
    useFormContext<TFieldValues>();

  const { fields, append, remove } = useFieldArray<
    TFieldValues,
    FieldArrayPath<TFieldValues>,
    "id"
  >({
    control,
    name: name as unknown as FieldArrayPath<TFieldValues>,
  });
  useEffect(() => {
    if (fields.length === 0) {
      append("" as unknown as never);
    }
  }, [fields.length, append]);

  const listValues = useWatch({
    control,
    name: name as Path<TFieldValues>,
  }) as unknown as string[] | undefined;

  useEffect(() => {
    const arr = Array.isArray(listValues) ? listValues : [];
    const hasNonEmpty = arr.some(
      (s) => typeof s === "string" && s.trim() !== ""
    );
    if (hasNonEmpty) {
      clearErrors(name as Path<TFieldValues>);
    }
  }, [listValues, name, clearErrors]);

  type ArrayErrShape = {
    message?: string;
    root?: { message?: string };
    _errors?: string[];
  };
  const errorsRecord = formState.errors as Record<string, unknown>;
  const rawErr = errorsRecord[name as unknown as string] as
    | ArrayErrShape
    | undefined;
  const arrayErrorMessage =
    rawErr?.message ?? rawErr?.root?.message ?? rawErr?._errors?.[0];

  return (
    <FormField
      control={control}
      name={name as Path<TFieldValues>}
      render={() => (
        <FormItem className={className}>
          <FormLabel className="flex items-center justify-between">
            <span>{label}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append("" as unknown as never)}
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
                  {...register(`${name}.${idx}` as Path<TFieldValues>)}
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

          {arrayErrorMessage && (
            <p className="text-sm text-destructive">{arrayErrorMessage}</p>
          )}
        </FormItem>
      )}
    />
  );
}

export type Sex = "male" | "female" | "other";
export const sexEnum = z.enum(["male", "female", "other"]);
export function SelectField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  options,
  className,
}: {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
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
            value={(field.value as string | undefined) ?? ""}
            onValueChange={(val) => field.onChange(val as unknown)}
          >
            <FormControl>
              <SelectTrigger className="w-full relative z-10">
                <SelectValue placeholder={placeholder ?? "Select..."} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export function ArrayRxList<TFieldValues extends FieldValues>({
  name,
  label,
  className,
  blockAddIfLastEmpty = false,
}: {
  name: FieldArrayPath<TFieldValues>;
  label: string;
  className?: string;
  blockAddIfLastEmpty?: boolean;
}) {
  const { control, getValues, resetField } = useFormContext<TFieldValues>();
  const shouldUnregister =
    (control as unknown as { _options?: RHFInternalOptions })._options
      ?.shouldUnregister ?? false;
  const { fields, append, remove } = useFieldArray<
    TFieldValues,
    FieldArrayPath<TFieldValues>,
    "id"
  >({ control, name });
  const blankRx = (): RxItem => ({
    drug: "",
    durationDays: undefined,
    timesPerDay: undefined,
    timing: undefined,
  });
  const syncRxArray = () => {
    if (shouldUnregister) return;

    const current = getValues(
      name as unknown as Path<TFieldValues>
    ) as PathValue<TFieldValues, Path<TFieldValues>>;

    resetField(name as unknown as Path<TFieldValues>, {
      defaultValue: current,
    });
  };
  useEffect(() => {
    const current = (getValues(name as unknown as Path<TFieldValues>) ??
      []) as unknown as RxItem[];

    if (fields.length === 0 && current.length === 0) {
      append(blankRx() as unknown as never);
    }
  }, [fields.length, append, getValues, name]);

  return (
    <FormField
      control={control}
      name={name as unknown as Path<TFieldValues>}
      render={() => (
        <FormItem className={className}>
          <FormLabel className="flex items-center justify-between">
            <span>{label}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = (getValues(
                  name as unknown as Path<TFieldValues>
                ) ?? []) as unknown as RxItem[];

                if (blockAddIfLastEmpty) {
                  const last = current[current.length - 1];
                  if (!last || isRxEmpty(last)) {
                    return;
                  }
                }
                append(blankRx() as unknown as never);
                syncRxArray();
              }}
              className="cursor-pointer"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </FormLabel>

          <div className="space-y-3">
            {fields.map((f, idx) => (
              <div
                key={f.id}
                className="grid gap-4 grid-cols-1 sm:grid-cols-7 items-start"
              >
                <TextField<TFieldValues>
                  name={
                    `${name}.${idx}.drug` as unknown as FieldPath<TFieldValues>
                  }
                  label="Medicine"
                  placeholder="Amoxicillin 500mg..."
                  className="sm:col-span-3"
                />

                <NumberField<TFieldValues>
                  name={
                    `${name}.${idx}.durationDays` as unknown as FieldPath<TFieldValues>
                  }
                  label="Days"
                  placeholder="e.g. 7"
                  className="sm:col-span-1"
                />

                <TimesPerDayField<TFieldValues>
                  name={
                    `${name}.${idx}.timesPerDay` as unknown as FieldPath<TFieldValues>
                  }
                  label="Times/Day"
                  className="sm:col-span-1"
                />

                <SelectField<TFieldValues>
                  name={
                    `${name}.${idx}.timing` as unknown as FieldPath<TFieldValues>
                  }
                  label="Timing"
                  placeholder="When to take"
                  options={[
                    { value: "before", label: "Before eating" },
                    { value: "after", label: "After eating" },
                    { value: "anytime", label: "Anytime" },
                  ]}
                  className="sm:col-span-1"
                />
                <div className="sm:col-span-1 flex justify-end self-end relative z-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      remove(idx);
                      syncRxArray();
                    }}
                    className="cursor-pointer"
                    aria-label={`Remove RX ${idx + 1}`}
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
export const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z
    .number({
      message: "Age is required.",
    })
    .min(0, "Invalid age."),
  sex: z
    .enum(["male", "female", "other"])
    .optional()
    .refine((val) => !!val, {
      message: "Please select a gender",
    }),
  date: z.date(),

  cc: requiredStringList,
  dx: optionalStringList,
  rx: rx,
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
            <Input
              placeholder={placeholder}
              value={(field.value ?? "") as string}
              onChange={(e) => field.onChange(e.target.value)}
            />
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
            <Input
              type="number"
              inputMode="numeric"
              placeholder={placeholder}
              value={(field.value ?? "") as string | number}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  field.onChange("");
                } else {
                  const n = e.currentTarget.valueAsNumber;
                  field.onChange(Number.isNaN(n) ? "" : n);
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
            value={(field.value as string | undefined) ?? ""}
            onValueChange={(val) => field.onChange(val as unknown)}
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
                value={inputValue || formatDate(field.value as unknown as Date)}
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
                      field.onChange(date as unknown);
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
