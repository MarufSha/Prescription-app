export type RxTiming = "before" | "after" | "anytime";
export type RxItem = {
  drug?: string;
  durationDays?: number;
  timesPerDay?: number;
  timing?: RxTiming;
};

export type PatientTypeData = {
  id: number;
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  date: string;
  cc: string[];
  rx: RxItem[];
  investigations: string[];
  advice: string[];
  pulse?: string;
  bp?: string;
  sp02?: string;
  others?: string;
};