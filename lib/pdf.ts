import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { FormValues } from "./prescription-form";

type PdfBytes = Uint8Array;

export async function generatePrescriptionPdfBuffer(
  data: FormValues
): Promise<PdfBytes> {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();
  const { width: W, height: H } = page.getSize();

  const margin = 40;
  const LEAD = 14;
  const SMALL = 10;
  const BODY = 11;
  const H1 = 14;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = H - margin;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    opts?: {
      size?: number;
      bold?: boolean;
      align?: "left" | "right";
      color?: { r: number; g: number; b: number };
    }
  ) => {
    const size = opts?.size ?? BODY;
    const useBold = opts?.bold ?? false;
    const f = useBold ? fontBold : font;
    const color = opts?.color ?? { r: 0.11, g: 0.11, b: 0.11 };

    let xPos = x;

    if (opts?.align === "right") {
      const width = f.widthOfTextAtSize(text, size);
      xPos = x - width;
    }

    page.drawText(text, {
      x: xPos,
      y: yPos,
      size,
      font: f,
      color: rgb(color.r, color.g, color.b),
    });
  };

  const drawLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    w = 0.7,
    color: { r: number; g: number; b: number } = {
      r: 0.67,
      g: 0.67,
      b: 0.67,
    }
  ) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: w,
      color: rgb(color.r, color.g, color.b),
    });
  };

  const splitText = (text: string, maxWidth: number, size: number) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(test, size);

      if (width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }

    if (current) lines.push(current);
    return lines;
  };

  drawText("Dr. John Doe, MBBS (CMC), FCPS (Medicine)", margin, y, {
    size: H1,
    bold: true,
  });

  y -= LEAD + 2;

  drawText("Consultant, Dept. of Medicine", margin, y, { size: SMALL });
  y -= LEAD;
  drawText("Doe Medical College Hospital", margin, y, { size: SMALL });
  y -= LEAD;
  drawText("Visiting Hours: 5:00 PM – 9:00 PM", margin, y, { size: SMALL });

  let rightY = H - margin - LEAD - 2;
  drawText("BMDC Reg. No.: A119962", W - margin, rightY, {
    size: SMALL,
    align: "right",
  });
  rightY -= LEAD;
  drawText("Clinic: Medilife Chamber, Dhaka", W - margin, rightY, {
    size: SMALL,
    align: "right",
  });
  rightY -= LEAD;
  drawText("Phone: 01700-000000", W - margin, rightY, {
    size: SMALL,
    align: "right",
  });

  const headerBottom = Math.min(y, rightY) - 10;
  drawLine(margin, headerBottom, W - margin, headerBottom, 1);

  const rightColX = W - margin - 360;
  const gap = 110;

  const row1Y = headerBottom - LEAD - 4;
  const row2Y = row1Y - (LEAD + 10);

  drawText("Name:", margin, row1Y, { bold: true });
  drawText(data.name || "—", margin + 40, row1Y);

  const col1X = rightColX;
  const col2X = rightColX + gap;
  const col3X = rightColX + 2 * gap;

  drawText("Sex:", col1X, row1Y, { bold: true });
  drawText(`${data.sex ?? "—"}`, col1X + 30, row1Y);

  drawText("Reg No:", col2X, row1Y, { bold: true });
  drawText("1428", col2X + 46, row1Y);

  drawText("Mobile:", col3X, row1Y, { bold: true });
  drawText("00000000000", col3X + 44, row1Y);

  drawText("Age:", col1X, row2Y, { bold: true });
  drawText(`${data.age ?? "—"}`, col1X + 30, row2Y);

  drawText("Weight:", col2X, row2Y, { bold: true });
  drawText("133", col2X + 46, row2Y);

  drawText("Date:", col3X, row2Y, { bold: true });
  drawText(
    data.date ? new Date(data.date).toLocaleDateString() : "—",
    col3X + 44,
    row2Y
  );

  y = row2Y - (LEAD + 2);
  drawLine(margin, y, W - margin, y, 1);
  y -= 36;

  const GUTTER = 24;
  const splitX = margin + Math.round((W - 2 * margin) * 0.52);
  const leftX = margin;
  const leftW = splitX - margin - GUTTER / 2;
  const rightX = splitX + GUTTER / 2;
  const rightW = W - margin - rightX;

  drawLine(splitX, y + 24, splitX, margin, 0.7);

  let yLeft = y;
  let yRight = y;

  const underlineTitle = (x: number, yTitle: number, label: string) => {
    const size = BODY;
    const width = fontBold.widthOfTextAtSize(label, size);
    drawLine(x, yTitle - 2, x + width, yTitle - 2, 0.6);
  };

  const leftTitle = (label: string) => {
    drawText(label, leftX, yLeft, { bold: true });
    underlineTitle(leftX, yLeft, label);
    yLeft -= LEAD + 4;
  };

  const leftTextLine = (content: string, indent = 14) => {
    drawText(content, leftX + indent, yLeft);
    yLeft -= LEAD;
  };

  drawText("Visit No:", leftX, yLeft, { bold: true });

  drawText("1", leftX + 70, yLeft);
  yLeft -= LEAD + 4;

  leftTitle("C/C");
  const cc = (data.cc ?? []).filter(Boolean);
  const usable = leftW - 14;
  cc.forEach((s) => {
    const lines = splitText(`• ${s}`, usable, BODY);
    lines.forEach((ln) => leftTextLine(ln));
  });
  yLeft -= 6;

  leftTitle("O/E");
  const oe = [
    `BP: ${data.bp || "—"}`,
    `SPO2: ${data.sp02 || "—"}`,
    `Pulse: ${data.pulse || "—"}`,
  ];
  oe.forEach((t) => leftTextLine(t));
  yLeft -= 6;

  leftTitle("Reports:");
  const inv = (data.investigations ?? []).filter(Boolean);
  inv.forEach((s) => {
    const lines = splitText(`• ${s}`, usable, BODY);
    lines.forEach((ln) => leftTextLine(ln));
  });
  yLeft -= 6;

  leftTitle("Plan:");
  const adv = (data.advice ?? []).filter(Boolean);
  adv.forEach((s) => {
    const lines = splitText(`• ${s}`, usable, BODY);
    lines.forEach((ln) => leftTextLine(ln));
  });

  drawText("Rx.", rightX, yRight, { bold: true, size: H1 });
  underlineTitle(rightX, yRight, "Rx.");
  yRight -= LEAD + 8;

  const prettyTimes = (t?: string) => {
    if (!t) return "";
      if (t === "0+0+0") {
    t = "1+1+1";
  }
    const [m, e, n] = t.split("+");
    const chip = (f: string, lbl: string) => (f === "1" ? lbl : "");
    return [chip(m, "Morning"), chip(e, "Evening"), chip(n, "Night")]
      .filter(Boolean)
      .join(" + ");
  };

  const rxList = (data.rx ?? []).filter(
    (r) =>
      (r.drug && r.drug.trim()) || r.durationDays || r.timesPerDay || r.timing
  );

  rxList.forEach((r, i) => {
    drawText(`${i + 1}.`, rightX, yRight, { bold: true });

    const drug = r.drug ?? "";
    const drugLines = splitText(drug, rightW - 120, BODY);
    const firstDrugLine = drugLines[0] ?? "";

    drawText(firstDrugLine, rightX + 18, yRight);

    const dur =
      r.durationDays && r.durationDays > 0
        ? `- ${r.durationDays} day${r.durationDays > 1 ? "s" : ""}`
        : "";

    if (dur) {
      drawText(dur, rightX + rightW, yRight, {
        align: "right",
      });
    }

    if (drugLines.length > 1) {
      for (let k = 1; k < drugLines.length; k += 1) {
        yRight -= LEAD;
        drawText(drugLines[k], rightX + 18, yRight);
      }
    }

    yRight -= LEAD;

    const subParts: string[] = [];

    if (r.timesPerDay) {
      subParts.push(prettyTimes(r.timesPerDay));
    }

    if (r.timing) {
      const label =
        r.timing === "before"
          ? "Before meal"
          : r.timing === "after"
          ? "After meal"
          : "Before/After meal";
      subParts.push(label);
    }

    const sub = subParts.join("   ::   ");

    if (sub) {
      drawText(sub, rightX + 18, yRight, {
        size: SMALL,
        color: { r: 0.37, g: 0.37, b: 0.37 },
      });
      yRight -= LEAD;
    }

    yRight -= 4;
  });

  drawLine(margin, margin, W - margin, margin, 0.7);
  drawText("— Review after 2 weeks —", W - margin, margin + 6, {
    size: SMALL,
    color: { r: 0.37, g: 0.37, b: 0.37 },
    align: "right",
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
