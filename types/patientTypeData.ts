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
