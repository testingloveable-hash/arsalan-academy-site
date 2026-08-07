export { buildCertificatePdf } from "./certificate-pdf";
export type { CertPdfInput } from "./certificate-pdf";
import { buildCertificatePdf } from "./certificate-pdf";
void buildCertificatePdf;

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
