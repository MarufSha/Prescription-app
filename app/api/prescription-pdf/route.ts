import { NextRequest } from "next/server";
import { generatePrescriptionPdfBuffer } from "@/lib/pdf";
import type { FormValues } from "@/lib/prescription-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FormValues;

    const pdfBytes = await generatePrescriptionPdfBuffer(body);

    const arrayBuffer = new ArrayBuffer(pdfBytes.length);
    const view = new Uint8Array(arrayBuffer);
    view.set(pdfBytes);

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Prescription.pdf"',
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return new Response("PDF generation error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
