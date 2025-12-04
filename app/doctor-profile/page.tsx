"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Trash2 } from "lucide-react";

import * as doctorStore from "@/lib/storage/doctor";
import type { DoctorTypeData } from "@/types/doctorTypeData";
import { normalizeMobile } from "@/lib/utils";
import {
  useDoctorsStore,
  notifyDoctorsStore,
} from "../../hooks/use-DoctorsStore";

const doctorFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  degrees: z.string().min(1, "Degrees are required"),
  specialty: z.string().min(1, "Specialty is required"),
  bmdcNo: z.string().min(1, "BMDC No is required"),
  chamberName: z.string().min(1, "Chamber name is required"),
  chamberAddress: z.string().min(1, "Chamber address is required"),
  mobile: z
    .string()
    .min(1, { message: "Mobile number is required." })
    .transform((val) => normalizeMobile(val))
    .refine((val) => val.length >= 11 && val.length <= 14, {
      message: "Enter a valid mobile number.",
    }),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

const defaultValues: DoctorFormValues = {
  name: "",
  degrees: "",
  specialty: "",
  bmdcNo: "",
  chamberName: "",
  chamberAddress: "",
  mobile: "",
  email: "",
};

export default function DoctorProfile() {
  const { doctors: items, currentDoctorId } = useDoctorsStore();

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues,
  });

  const handleSubmit = (values: DoctorFormValues) => {
    const degreesArr =
      values.degrees
        ?.split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

    const payload: DoctorTypeData = {
      id: doctorStore.nextDoctorId(),
      name: values.name.trim(),
      degrees: degreesArr,
      specialty: values.specialty.trim(),
      bmdcNo: values.bmdcNo.trim(),
      chamberName: values.chamberName.trim(),
      chamberAddress: values.chamberAddress.trim(),
      mobile: values.mobile.trim(),
      email: values.email?.trim() || undefined,
    };

    doctorStore.addDoctor(payload);

    const all = doctorStore.loadDoctors();
    const storedCurrent = doctorStore.loadCurrentDoctorId();
    if (!storedCurrent && all.length === 1) {
      doctorStore.saveCurrentDoctorId(payload.id);
    }

    notifyDoctorsStore();
    form.reset(defaultValues);
  };

  function handleDelete(id: number) {
    doctorStore.removeDoctor(id);

    const remaining = doctorStore.loadDoctors();
    let current = doctorStore.loadCurrentDoctorId();

    if (current === id) {
      if (remaining.length === 1) {
        current = remaining[0].id;
        doctorStore.saveCurrentDoctorId(current);
      } else {
        current = null;
        doctorStore.saveCurrentDoctorId(null as unknown as number);
      }
    }

    notifyDoctorsStore();
  }

  function handleClearAll() {
    doctorStore.clearAllDoctors();
    doctorStore.saveCurrentDoctorId(null as unknown as number);
    notifyDoctorsStore();
  }

  function handleSetCurrent(id: number) {
    doctorStore.saveCurrentDoctorId(id);
    notifyDoctorsStore();
  }

  const hasItems = items.length > 0;

  return (
    <div className="flex flex-col gap-6 pt-6 items-center h-full">
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <h1 className="text-xl font-semibold">Doctor Settings</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dr. Abdullah Al Mamun" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Medicine Specialist" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bmdcNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BMDC No *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="A-12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        inputMode="tel"
                        placeholder="+8801XXXXXXXXX"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="doctor@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="degrees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degrees *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={"MBBS, FCPS (Medicine)\nOr one per line"}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="chamberName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chamber Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City Health Clinic" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chamberAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chamber Address *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="House-12, Road-5, Dhanmondi, Dhaka"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(defaultValues)}
                className="cursor-pointer"
              >
                Reset
              </Button>
              <Button type="submit" className="cursor-pointer">
                Save Doctor
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <Card className="w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Saved Doctors</h2>
          <Button
            variant="destructive"
            disabled={!hasItems}
            onClick={handleClearAll}
            className="cursor-pointer"
          >
            Clear All
          </Button>
        </div>

        {!hasItems && (
          <p className="text-sm text-muted-foreground">
            No doctors saved yet. Add one above to replace the hard-coded PDF
            header.
          </p>
        )}

        {hasItems && (
          <div className="space-y-3">
            {items.map((doc: DoctorTypeData) => {
              const isCurrent = doc.id === currentDoctorId;

              return (
                <div
                  key={doc.id}
                  className={`flex items-start justify-between rounded-md p-3 border ${
                    isCurrent
                      ? "border-2 border-blue-500 bg-blue-50/40 dark:bg-blue-950/20"
                      : "border-muted"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{doc.name}</div>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          Current
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {doc.degrees.join(", ")}
                    </div>

                    <div className="text-xs">
                      {doc.specialty && <span>{doc.specialty} · </span>}
                      {doc.bmdcNo && <span>BMDC: {doc.bmdcNo}</span>}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {doc.chamberName && <span>{doc.chamberName} · </span>}
                      {doc.chamberAddress}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {doc.mobile}
                      {doc.email && <> · {doc.email}</>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {!isCurrent && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleSetCurrent(doc.id)}
                      >
                        Set as current
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive cursor-pointer"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
