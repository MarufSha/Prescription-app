"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PatientTypeData } from "@/types/patientTypeData";
import * as store from "@/lib/storage";

import {
  formSchema,
  FormValues,
  TextField,
  NumberField,
  SexField,
  DateField,
} from "@/lib/prescription-form";

const CreatePrescription = () => {
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
  }

  function onSubmit(values: FormValues) {
    const id = store.nextId();

    const payload: PatientTypeData = {
      id,
      name: values.name,
      age: values.age,
      sex: values.sex!, // non-null after refine
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
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
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

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormValues>
                name="pulse"
                label="Pulse"
                placeholder="Please Enter Pulse"
              />
              <TextField<FormValues>
                name="bp"
                label="BP"
                placeholder="Please Enter BP"
              />
              <TextField<FormValues>
                name="spq"
                label="SPQ"
                placeholder="Please Enter SPQ"
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormValues>
                name="others"
                label="Others"
                placeholder="Enter Other Information"
                className="col-span-2"
              />
              <DateField<FormValues> name="date" />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormValues>
                name="cc"
                label="C/C"
                placeholder="Enter C/C"
                className="col-span-3"
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormValues>
                name="rx"
                label="R/X"
                placeholder="Enter R/X"
                className="col-span-3"
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormValues>
                name="investigations"
                label="Investigations"
                placeholder="Enter Investigations"
                className="col-span-3"
              />
            </div>

            <div className="grid gap-6 grid-cols-[repeat(3,12rem)]">
              <TextField<FormValues>
                name="advice"
                label="Advice"
                placeholder="Enter Advice"
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
