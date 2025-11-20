export type JsPdfTextOptions =
  | undefined
  | {
      align?: "left" | "right" | "center" | undefined;
      baseline?:
        | "alphabetic"
        | "top"
        | "middle"
        | "bottom"
        | "ideographic"
        | "hanging"
        | undefined;
    }
  | string;
