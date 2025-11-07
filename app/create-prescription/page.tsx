"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, isValidDate, todayFormatted } from "@/lib/utils";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const CreatePrescription = () => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(new Date());
  const [inputValue, setInputValue] = useState<string>("");

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    age: z.number().min(1, {
      message: "Age must be at least 1 digit.",
    }),
    sex: z.enum(["male", "female", "other"], {
      message: "Please select a gender.",
    }),
    date: z.date({
      message: "Please select a date.",
    }),
    cc: z.string().min(1, {
      message: "Please describe the main issue.",
    }),
    rx: z.string().optional(),
    pulse: z.string().optional(),
    bp: z.string().optional(),
    spq: z.string().optional(),
    others: z.string().optional(),
    investigations: z.string().optional(),
    advice: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 0,
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="flex flex-col pt-6 items-center h-full">
      <Card className="flex p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between">
              <FormField
                control={form.control}
                name="name"
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
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input placeholder="Please Enter Age" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>

                    <Select onValueChange={field.onChange} value={field.value}>
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
            <div className="flex justify-between gap-6">
              <FormField
                control={form.control}
                name="pulse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pulse</FormLabel>
                    <FormControl>
                      <Input placeholder="Please Enter Pulse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BP</FormLabel>
                    <FormControl>
                      <Input placeholder="Please Enter BP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spq"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SPQ</FormLabel>
                    <FormControl>
                      <Input placeholder="Please Enter SPQ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="others"
                render={({ field }) => (
                  <FormItem className="w-2/3">
                    <FormLabel>Others</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Other Information" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => {
                  return (
                    <FormItem className="flex-1 justify-end w-fit">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className="relative flex gap-2">
                          <Input
                            value={inputValue}
                            placeholder={todayFormatted()}
                            className="bg-background pr-10"
                            onChange={(e) => {
                              const raw = e.target.value;
                              setInputValue(raw);
                              const parsed = new Date(raw);
                              if (isValidDate(parsed)) {
                                field.onChange(parsed);
                                setMonth(parsed);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setOpen(true);
                              }
                            }}
                          />

                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-picker"
                                variant="ghost"
                                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
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
                              sideOffset={10}
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                captionLayout="dropdown"
                                month={month}
                                onMonthChange={setMonth}
                                onSelect={(date) => {
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
                  );
                }}
              />
            </div>
            <FormField
              control={form.control}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>C/C</FormLabel>
                  <FormControl>
                    <Input placeholder=" Enter C/C" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rx"
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
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};
export default CreatePrescription;
