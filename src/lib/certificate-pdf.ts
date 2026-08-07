import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type CertPdfInput = {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  number: string;
};

/** Browser- and server-safe vector PDF builder for certificates. */
export async function buildCertificatePdf(opts: CertPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  // A4 landscape in points
  const page = doc.addPage([842, 595]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const navy = rgb(0.039, 0.118, 0.239);
  const blue = rgb(0.118, 0.353, 1);
  const grey = rgb(0.3, 0.3, 0.3);

  page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderColor: navy, borderWidth: 3 });
  page.drawRectangle({ x: 30, y: 30, width: 782, height: 535, borderColor: blue, borderWidth: 1 });

  const center = (text: string, y: number, size: number, font = bold, color = navy) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (842 - w) / 2, y, size, font, color });
  };

  center("ARSALAN ACADEMY", 510, 14, bold, blue);
  center("Certificate of Completion", 455, 34, bold, navy);
  center("This certificate is proudly presented to", 400, 13, regular, grey);
  center(opts.studentName || "Student", 350, 30, italic, navy);
  center("for successfully completing the course", 300, 13, regular, navy);
  center(`"${opts.courseTitle}"`, 275, 16, bold, navy);
  center("at Arsalan Academy.", 250, 13, regular, navy);

  const date = new Date(opts.completionDate).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
  center(`Date of Completion: ${date}`, 195, 11, regular, navy);
  center(`Certificate Number: ${opts.number}`, 178, 11, regular, navy);

  center("Arsalan Munir", 110, 18, italic, navy);
  center("Founder & Lead Trainer  ·  CELTA Qualified", 90, 11, regular, blue);

  return await doc.save();
}
