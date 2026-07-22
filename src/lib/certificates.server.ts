import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type CertPdfInput = {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  number: string;
};

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
  center(`for successfully completing the course`, 300, 13, regular, navy);
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

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export async function sendCertificateEmail(opts: {
  to: string;
  studentName: string;
  courseTitle: string;
  number: string;
  pdf: Uint8Array;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0A1E3D;background:#f6f8ff;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e5eaf5">
      <h1 style="margin:0 0 8px;color:#0A1E3D">Congratulations, ${escapeHtml(opts.studentName)}!</h1>
      <p style="margin:0 0 16px;color:#334">You've successfully completed <strong>${escapeHtml(opts.courseTitle)}</strong> at Arsalan Academy.</p>
      <p style="margin:0 0 16px;color:#334">Your official certificate <strong style="font-family:monospace">${escapeHtml(opts.number)}</strong> is attached to this email as a PDF.</p>
      <p style="margin:16px 0 0;color:#556">— Arsalan Academy</p>
    </div>
  </body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: "Arsalan Academy <onboarding@resend.dev>",
      to: [opts.to],
      subject: `Your certificate for ${opts.courseTitle}`,
      html,
      attachments: [
        { filename: `Certificate-${opts.number}.pdf`, content: toBase64(opts.pdf) },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
