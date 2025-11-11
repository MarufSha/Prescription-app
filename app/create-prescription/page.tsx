"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo } from "react";
import {
  FormProvider,
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as store from "@/lib/storage";
import type {
  PatientTypeData,
  RxItem,
} from "@/types/patientTypeData";

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

const CreatePrescription = () => {
  const form = useForm<FormInput>({
    resolver: zodResolver<FormInput, undefined, FormValues>(formSchema),
    defaultValues: {
      name: "",
      age: undefined as unknown as number,
      sex: undefined,
      date: new Date(),

      cc: [""],
      rx: [
        {
          drug: "",
          durationDays: undefined,
          timesPerDay: undefined,
          timing: undefined,
        },
      ],
      investigations: [""],
      advice: [""],
      pulse: "",
      bp: "",
      sp02: "",
      others: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const submitLabel = useMemo(() => "Save Offline", []);

  function resetForm() {
    form.reset({
      name: "",
      age: undefined as unknown as number,
      sex: undefined,
      date: new Date(),
      cc: [""],
      rx: [],
      investigations: [""],
      advice: [""],
      pulse: "",
      bp: "",
      sp02: "",
      others: "",
    });
  }

  const onSubmit: SubmitHandler<FormInput> = (values) => {
    const parsed: FormValues = formSchema.parse(values);

    const id = store.nextId();

    const payload: PatientTypeData = {
      id,
      name: parsed.name,
      age: parsed.age,
      sex: parsed.sex!,
      date: parsed.date.toISOString(),

      cc: parsed.cc,
      rx: (values.rx ?? []) as RxItem[],
      investigations: parsed.investigations,
      advice: parsed.advice,

      pulse: parsed.pulse ?? "",
      bp: parsed.bp ?? "",
      sp02: parsed.sp02 ?? "",
      others: parsed.others ?? "",
    };

    store.add(payload);
    resetForm();
  };

  return (
    <div className="flex flex-col pt-6 items-center h-full">
      <Card className="flex p-6">
        <FormProvider {...(form as unknown as UseFormReturn<FormValues>)}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
              <ArrayRxList name="rx" label="R/X" className="col-span-3" />
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
        </FormProvider>
      </Card>
    </div>
  );
};

export default CreatePrescription;
