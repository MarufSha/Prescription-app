export type PatientTypeData = {
  id: number;
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  date: string;
  cc: string[];
  rx: string[];
  investigations: string[];
  advice: string[];
  pulse?: string;
  bp?: string;
  sp02?: string;
  others?: string;
};
