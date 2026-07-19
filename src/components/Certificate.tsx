import { forwardRef } from "react";
import { Calendar } from "lucide-react";
import logoAsset from "@/assets/arsalan-logo.asset.json";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  number: string;
}

function formatDate(iso: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

/**
 * Fixed A4 landscape canvas (1123 x 794 CSS px at 96dpi). Scaled to container with CSS transform.
 * Kept as a self-contained block so html2canvas captures it faithfully.
 */
export const Certificate = forwardRef<HTMLDivElement, { data: CertificateData; scale?: number }>(
  ({ data, scale = 1 }, ref) => {
    return (
      <div className="mx-auto" style={{ width: 1123 * scale, height: 794 * scale }}>
        <div
          ref={ref}
          id="certificate-canvas"
          className="relative overflow-hidden bg-white font-serif text-[color:var(--brand-navy)]"
          style={{
            width: 1123,
            height: 794,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {/* Corner ribbon accents */}
          <div className="absolute left-0 top-0" style={{ width: 260, height: 260 }}>
            <div className="absolute -left-24 -top-24 h-64 w-64 rotate-45 bg-[#0A1E3D]" />
            <div className="absolute -left-16 -top-32 h-64 w-64 rotate-45 bg-[#1E5AFF]" />
            <div className="absolute -left-8 -top-40 h-64 w-64 rotate-45 bg-black" />
          </div>
          <div className="absolute right-0 bottom-0" style={{ width: 260, height: 260 }}>
            <div className="absolute -right-24 -bottom-24 h-64 w-64 rotate-45 bg-[#0A1E3D]" />
            <div className="absolute -right-16 -bottom-32 h-64 w-64 rotate-45 bg-[#1E5AFF]" />
            <div className="absolute -right-8 -bottom-40 h-64 w-64 rotate-45 bg-black" />
          </div>

          {/* Dot grid pattern top-right */}
          <div
            className="absolute right-16 top-16 opacity-30"
            style={{
              width: 140,
              height: 90,
              backgroundImage: "radial-gradient(#1E5AFF 1.5px, transparent 1.5px)",
              backgroundSize: "10px 10px",
            }}
          />
          {/* Dot grid bottom-left */}
          <div
            className="absolute left-16 bottom-16 opacity-30"
            style={{
              width: 140,
              height: 90,
              backgroundImage: "radial-gradient(#1E5AFF 1.5px, transparent 1.5px)",
              backgroundSize: "10px 10px",
            }}
          />

          {/* Watermark A */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]"
            aria-hidden
          >
            <span style={{ fontSize: 640, fontWeight: 900, lineHeight: 1, color: "#0A1E3D" }}>A</span>
          </div>

          {/* Border frame */}
          <div className="pointer-events-none absolute inset-8 border-2 border-[#0A1E3D]/40" />
          <div className="pointer-events-none absolute inset-10 border border-[#1E5AFF]/40" />

          {/* Content */}
          <div className="relative flex h-full flex-col items-center px-24 pt-20 pb-16 text-center">
            <img src={logoAsset.url} alt="Arsalan Academy" style={{ height: 88, width: "auto" }} crossOrigin="anonymous" />

            <p
              className="mt-6 text-xs uppercase text-[#1E5AFF]"
              style={{ letterSpacing: "0.5em", fontFamily: "'Inter', sans-serif" }}
            >
              Arsalan Academy
            </p>

            <h1
              className="mt-4"
              style={{ fontSize: 56, fontWeight: 700, letterSpacing: "0.08em", color: "#0A1E3D" }}
            >
              CERTIFICATE
            </h1>
            <p
              className="text-sm uppercase text-black/60"
              style={{ letterSpacing: "0.6em", fontFamily: "'Inter', sans-serif", marginTop: 4 }}
            >
              of Completion
            </p>

            <p
              className="mt-8 text-base text-black/70"
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.2em" }}
            >
              THIS CERTIFICATE IS PROUDLY PRESENTED TO
            </p>

            <div className="mt-6 min-h-[80px]">
              <p
                style={{
                  fontSize: 64,
                  fontStyle: "italic",
                  color: "#0A1E3D",
                  fontFamily: "'Great Vibes', 'Playfair Display', cursive",
                  lineHeight: 1,
                }}
              >
                {data.studentName || "Student Name"}
              </p>
              <div className="mx-auto mt-2 h-px w-[70%] bg-[#0A1E3D]/40" />
            </div>

            <p
              className="mx-auto mt-8 max-w-3xl text-[15px] leading-relaxed text-black/75"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              has successfully completed the course{" "}
              <span className="font-semibold text-[#0A1E3D]">
                “{data.courseTitle || "Course Title"}”
              </span>{" "}
              at Arsalan Academy, demonstrating dedication, consistent practice, and mastery of the
              programme requirements under a CELTA-qualified instructor.
            </p>

            {/* Footer row */}
            <div className="mt-auto grid w-full grid-cols-3 items-end pt-8" style={{ fontFamily: "'Inter', sans-serif" }}>
              {/* Date */}
              <div className="text-left">
                <div className="flex items-center gap-2 text-sm text-black/80">
                  <Calendar className="h-4 w-4 text-[#1E5AFF]" />
                  <span className="font-semibold">{formatDate(data.completionDate) || "Date"}</span>
                </div>
                <div className="mt-1 h-px w-40 bg-[#0A1E3D]/50" />
                <p className="mt-1 text-[11px] uppercase tracking-widest text-black/50">Date of Completion</p>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center">
                <div
                  className="relative flex items-center justify-center rounded-full border-4 border-[#1E5AFF] text-center"
                  style={{ width: 110, height: 110 }}
                >
                  <div className="absolute inset-2 rounded-full border border-[#0A1E3D]/60" />
                  <div className="px-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#0A1E3D]">Official</p>
                    <p className="text-[13px] font-black uppercase text-[#0A1E3D]">Seal</p>
                    <p className="text-[8px] uppercase tracking-widest text-[#1E5AFF]">Arsalan Academy</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-black/50">
                  Cert No. <span className="font-semibold text-[#0A1E3D]">{data.number || "AA-XXXX-YYYY-0000"}</span>
                </p>
              </div>

              {/* Signature */}
              <div className="text-right">
                <p
                  style={{
                    fontSize: 28,
                    fontStyle: "italic",
                    fontFamily: "'Great Vibes', cursive",
                    color: "#0A1E3D",
                    lineHeight: 1,
                  }}
                >
                  Arsalan Munir
                </p>
                <div className="ml-auto mt-1 h-px w-48 bg-[#0A1E3D]/50" />
                <p className="mt-1 text-[11px] uppercase tracking-widest text-black/60">Arsalan Munir</p>
                <p className="text-[10px] text-[#1E5AFF]">CELTA Qualified · Director</p>
              </div>
            </div>

            <p
              className="mt-6 text-[10px] italic text-black/50"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              This certificate is issued by Arsalan Academy and remains the property of the Academy.
              Its authenticity can be verified using the certificate number above.
            </p>
          </div>
        </div>
      </div>
    );
  },
);
Certificate.displayName = "Certificate";
