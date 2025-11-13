import { FormValues } from "./prescription-form";

type DownloadPdfInput = { filename?: string; data: FormValues };

export async function downloadPrescriptionPdf({
  filename = "Prescription.pdf",
  data,
}: DownloadPdfInput) {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const M = 40;
  const LEAD = 14;
  const SMALL = 10;
  const BODY = 11;
  const H1 = 14;

  const COLOR_TEXT: [number, number, number] = [28, 28, 28];
  const COLOR_SUB: [number, number, number] = [95, 95, 95];
  const COLOR_LINE: [number, number, number] = [170, 170, 170];

  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const bold = () => doc.setFont("helvetica", "bold");
  const normal = () => doc.setFont("helvetica", "normal");
  const text = (t: string, x: number, y: number, opts?: any) =>
    doc.text(t, x, y, opts);
  const line = (x1: number, y1: number, x2: number, y2: number, w = 0.9) => {
    doc.setDrawColor(...COLOR_LINE);
    doc.setLineWidth(w);
    doc.line(x1, y1, x2, y2);
  };
  const split = (t: string, w: number) => doc.splitTextToSize(t, w);

  doc.setTextColor(...COLOR_TEXT);
  normal();

  let y = M;

  bold();
  doc.setFontSize(H1);
  text("Dr. John Doe, MBBS (CMC), FCPS (Medicine)", M, y);
  normal();
  doc.setFontSize(SMALL);

  let yL = y + LEAD + 2;
  text("Consultant, Dept. of Medicine", M, yL);
  yL += LEAD;
  text("Doe Medical College Hospital", M, yL);
  yL += LEAD;
  text("Visiting Hours: 5:00 PM – 9:00 PM", M, yL);

  let yR = y + LEAD + 2;
  text("BMDC Reg. No.: A119962", W - M, yR, { align: "right" });
  yR += LEAD;
  text("Clinic: Medilife Chamber, Dhaka", W - M, yR, { align: "right" });
  yR += LEAD;
  text("Phone: 01700-000000", W - M, yR, { align: "right" });

  y = Math.max(yL, yR) + 10;
  line(M, y, W - M, y, 1.1);
  y += 14;
  doc.setFontSize(BODY);
  const rightColX = W - M - 360;
  const gap = 135;


  bold();
  text("Sex:", rightColX, y);
  normal();
  text(`${data.sex ?? "—"}`, rightColX + 40, y);
  bold();
  text("Reg No:", rightColX + gap, y);
  normal();
  text("1428", rightColX + gap + 56, y);
  bold();
  text("Mobile:", rightColX + 2 * gap, y);
  normal();
  text("—", rightColX + 2 * gap + 56, y);


  y += LEAD + 10;
  bold();
  text("Name:", M, y);
  normal();
  text(data.name || "—", M + 60, y);


  y += LEAD + 10;
  bold();
  text("Age:", rightColX, y);
  normal();
  text(`${data.age ?? "—"}`, rightColX + 40, y);
  bold();
  text("Weight:", rightColX + gap, y);
  normal();
  text("—", rightColX + gap + 60, y);
  bold();
  text("Date:", rightColX + 2 * gap, y);
  normal();
  text(
    data.date ? new Date(data.date).toLocaleDateString() : "—",
    rightColX + 2 * gap + 44,
    y
  );


  y += LEAD + 10;
  line(M, y, W - M, y, 1.1);
  y += 16;

  const GUTTER = 24;
  const splitX = M + Math.round((W - 2 * M) * 0.52); // ~52/48 split
  const leftX = M;
  const leftW = splitX - M - GUTTER / 2;
  const rightX = splitX + GUTTER / 2;
  const rightW = W - M - rightX;

  line(splitX, y - 24, splitX, H - M, 0.9);

  let yLeft = y;
  let yRight = y;
  const underlineTitle = (x: number, yTxt: number, label: string) => {
    const w = doc.getTextWidth(label);
    line(x, yTxt + 3, x + w, yTxt + 3, 0.6);
  };
  const leftTitle = (label: string) => {
    bold();
    doc.setFontSize(BODY);
    text(label, leftX, yLeft);
    underlineTitle(leftX, yLeft, label);
    yLeft += LEAD + 4;
    normal();
  };

  leftTitle("Visit No:");
  text("1", leftX + 70, yLeft - (LEAD + 4));

  leftTitle("C/C");
  const cc = (data.cc ?? []).filter(Boolean);
  const usable = leftW - 14;
  cc.forEach((s) =>
    split(`• ${s}`, usable).forEach((ln) => {
      text(ln, leftX + 14, yLeft);
      yLeft += LEAD;
    })
  );
  yLeft += 6;

  leftTitle("O/E");
  const oe = [
    `BP: ${data.bp || "—"}`,
    `SPO2: ${data.sp02 || "—"}`,
    `Pulse: ${data.pulse || "—"}`,
  ];
  oe.forEach((t) => {
    text(t, leftX + 14, yLeft);
    yLeft += LEAD;
  });
  yLeft += 6;

  leftTitle("Reports:");
  const inv = (data.investigations ?? []).filter(Boolean);
  inv.forEach((s) =>
    split(`• ${s}`, usable).forEach((ln) => {
      text(ln, leftX + 14, yLeft);
      yLeft += LEAD;
    })
  );
  yLeft += 6;

  leftTitle("Plan:");
  const adv = (data.advice ?? []).filter(Boolean);
  adv.forEach((s) =>
    split(`• ${s}`, usable).forEach((ln) => {
      text(ln, leftX + 14, yLeft);
      yLeft += LEAD;
    })
  );

  bold();
  doc.setFontSize(H1);
  text("Rx.", rightX, yRight);
  underlineTitle(rightX, yRight, "Rx.");
  yRight += LEAD + 8;
  normal();
  doc.setFontSize(BODY);

  const prettyTimes = (t?: string) => {
    if (!t) return "";
    const [m, e, n] = t.split("+");
    const chip = (f: string, lbl: string) => (f === "1" ? lbl : "");
    return [chip(m, "M"), chip(e, "E"), chip(n, "N")]
      .filter(Boolean)
      .join(" + ");
  };

  const rx = (data.rx ?? []).filter(
    (r) =>
      (r.drug && r.drug.trim()) || r.durationDays || r.timesPerDay || r.timing
  );

  rx.forEach((r, i) => {
    bold();
    text(`${i + 1}.`, rightX, yRight);
    const drugLines = split((r.drug ?? "").toString(), rightW - 120);
    text(drugLines[0] || "", rightX + 18, yRight);
    normal();

    const dur = r.durationDays
      ? `- ${r.durationDays} day${r.durationDays > 1 ? "s" : ""}`
      : "";
    if (dur) text(dur, rightX + rightW, yRight, { align: "right" });

    if (drugLines.length > 1) {
      for (let k = 1; k < drugLines.length; k++) {
        yRight += LEAD;
        text(drugLines[k], rightX + 18, yRight);
      }
    }
    yRight += LEAD;

    const sub = [
      r.timesPerDay ? prettyTimes(r.timesPerDay) : "",
      r.timing
        ? r.timing === "before"
          ? "Before meal"
          : r.timing === "after"
          ? "After meal"
          : "Anytime"
        : "",
    ]
      .filter(Boolean)
      .join("  ·  ");

    if (sub) {
      doc.setTextColor(...COLOR_SUB);
      text(sub, rightX + 18, yRight);
      doc.setTextColor(...COLOR_TEXT);
      yRight += LEAD;
    }
    yRight += 4;
  });

  // footer
  line(M, H - M, W - M, H - M, 0.9);
  doc.setFontSize(SMALL);
  doc.setTextColor(...COLOR_SUB);
  text("— Review after 2 weeks —", W - M, H - M - 10, { align: "right" });
  doc.setTextColor(...COLOR_TEXT);

  doc.save(filename);
}
