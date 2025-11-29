"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import {
  FormProvider,
  Resolver,
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as store from "@/lib/storage";
import type { PatientTypeData, RxItem } from "@/types/patientTypeData";

import {
  ArrayRxList,
  ArrayTextList,
  DateField,
  NumberField,
  SexField,
  TextField,
  formSchema,
  type FormInput,
  type FormValues,
} from "@/lib/prescription-form";
import { Download, Save, Trash2 } from "lucide-react";
import { downloadPrescriptionFromServer, DRAFT_KEY } from "@/lib/utils";

const blankRx = (): RxItem => ({
  drug: "",
  durationDays: undefined,
  timesPerDay: undefined,
  timing: undefined,
});

const defaultFormValues: FormValues = {
  name: "",
  age: undefined as unknown as number,
  sex: undefined,
  date: new Date(),
  cc: [""],
  dx: [],
  rx: [blankRx()],
  investigations: [],
  advice: [],
  pulse: "",
  bp: "",
  sp02: "",
  others: "",
};

const loadDefaultValues = async (): Promise<FormValues> => {
  if (typeof window === "undefined") {
    return defaultFormValues;
  }

  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) {
    return defaultFormValues;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FormValues>;

    const merged: FormValues = {
      ...defaultFormValues,
      ...parsed,
      date:
        parsed.date && typeof parsed.date === "string"
          ? new Date(parsed.date)
          : parsed.date instanceof Date
          ? parsed.date
          : new Date(),
      rx:
        Array.isArray(parsed.rx) && parsed.rx.length > 0
          ? (parsed.rx as RxItem[])
          : [blankRx()],
    };

    return merged;
  } catch {
    return defaultFormValues;
  }
};

const CreatePrescription = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<
      FormValues,
      unknown,
      FormValues
    >,
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    shouldUnregister: false,
    defaultValues: loadDefaultValues,
  });

  const submitLabel = useMemo(() => "Save Offline", []);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      try {
        const values = form.getValues();

        const toSave: Record<string, unknown> = {
          ...values,
          date:
            values.date instanceof Date
              ? values.date.toISOString()
              : values.date,
        };

        if (!Array.isArray(values.rx) || values.rx.length === 0) {
          toSave.rx = [blankRx()];
        }

        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      } catch {}
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [form]);

  function resetForm() {
    form.reset(defaultFormValues);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }

  const handleSubmitCommon = async (
    values: FormInput,
    options: { download: boolean }
  ) => {
    const parsed: FormValues = formSchema.parse(values);
    const id = store.nextId();

    const payload: PatientTypeData = {
      id,
      name: parsed.name,
      age: parsed.age,
      sex: parsed.sex!,
      date: parsed.date.toISOString(),

      cc: parsed.cc,
      dx: parsed.dx,
      rx: (values.rx ?? []) as RxItem[],
      investigations: parsed.investigations,
      advice: parsed.advice,

      pulse: parsed.pulse ?? "",
      bp: parsed.bp ?? "",
      sp02: parsed.sp02 ?? "",
      others: parsed.others ?? "",
    };

    store.add(payload);
    if (options.download) {
      await downloadPrescriptionFromServer(parsed);
    }
    resetForm();
  };

  const handleSaveOffline: SubmitHandler<FormInput> = (values) => {
    void handleSubmitCommon(values, { download: false });
  };

  const handleSaveAndDownload: SubmitHandler<FormInput> = (values) => {
    void handleSubmitCommon(values, { download: true });
  };

  return (
    <div className="flex flex-col pt-6 items-center h-full">
      <Card className="flex p-6">
        <FormProvider {...(form as unknown as UseFormReturn<FormValues>)}>
          <form
            onSubmit={form.handleSubmit(handleSaveOffline)}
            className="space-y-6 w-full"
          >
            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormInput>
                name="name"
                label="Name"
                placeholder="Please Enter Name"
              />
              <NumberField<FormInput>
                name="age"
                label="Age"
                placeholder="Please Enter Age"
              />
              <SexField<FormInput> name="sex" label="Sex" />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormInput>
                name="pulse"
                label="Pulse"
                placeholder="Please Enter Pulse"
              />
              <TextField<FormInput>
                name="bp"
                label="BP"
                placeholder="Please Enter BP"
              />
              <TextField<FormInput>
                name="sp02"
                label="Sp02"
                placeholder="Please Enter Sp02"
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormInput>
                name="others"
                label="Others"
                placeholder="Enter Other Information"
                className="col-span-2"
              />
              <DateField<FormInput> name="date" label="Date" />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <ArrayTextList
                name="cc"
                label="C/C"
                placeholder="Enter a complaint..."
                className="col-span-3"
              />
            </div>
            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <ArrayTextList<FormValues>
                name="dx"
                label="D/x"
                placeholder="Enter a diagnosis..."
                className="col-span-3"
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <ArrayRxList<FormValues>
                name="rx"
                label="R/X"
                className="col-span-3"
                blockAddIfLastEmpty
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <ArrayTextList
                name="investigations"
                label="Investigations"
                placeholder="Enter an investigation..."
                className="col-span-3"
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <ArrayTextList
                name="advice"
                label="Advice"
                placeholder="Enter advice..."
                className="col-span-3"
              />
            </div>

            <div className="flex gap-3 justify-between">
              <Button type="submit" variant="blue">
                <Save className="mr-1 h-4 w-4" />
                {submitLabel}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={resetForm}
                className="cursor-pointer"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Clear Form
              </Button>

              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={form.handleSubmit(handleSaveAndDownload)}
              >
                <Download className="mr-1 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
};

export default CreatePrescription;
