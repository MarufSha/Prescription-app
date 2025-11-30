import { FieldValues, Path } from "react-hook-form";

export type RxTiming = "before" | "after" | "anytime";
export type RxTimesPerDay = `${0 | 1}+${0 | 1}+${0 | 1}`;
export type RxItem = {
  drug?: string;
  durationDays?: number;
  timesPerDay?: RxTimesPerDay;
  timing?: RxTiming;
};

export type PatientTypeData = {
  id: number;
  puid: number;
  visitNo: number;

  name: string;
  age: number;
  sex: "male" | "female" | "other";
  mobile: string;

  date: string;
  dx?: string[];
  cc: string[];
  rx: RxItem[];
  investigations: string[];
  advice: string[];

  pulse?: string;
  bp?: string;
  sp02?: string;
  weight?: number;
  others?: string;

  followupDays?: number;
};

export type RHFInternalOptions = {
  shouldUnregister?: boolean;
};

export type PatientRegistryEntry = {
  puid: number;
  name: string;
  mobile: string;
  lastVisitNo: number;
};

export type NumberFieldProps<TFormValues extends FieldValues> = {
  name: Path<TFormValues>;
  label: string;
  placeholder?: string;
  className?: string;
  step?: number;
  min?: number;
  max?: number;
};
