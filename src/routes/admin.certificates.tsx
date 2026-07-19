import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Award, Download, FileText, Loader2, Printer, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { actions, useStore, type Certificate as Cert } from "@/lib/store";
import { Certificate, type CertificateData } from "@/components/Certificate";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/certificates")({
  component: CertificatesAdmin,
  head: () => ({ meta: [{ title: "Certificates — Admin" }, { name: "robots", content: "noindex" }] }),
});

const todayISO = () => new Date().toISOString().slice(0, 10);
const pad4 = (n: number) => String(n).padStart(4, "0");
const safe = (s: string) => (s || "").replace(/[^a-z0-9\-_.]+/gi, "_").replace(/^_+|_+$/g, "") || "Certificate";
const fileBase = (name: string, num: string) => `Certificate-${safe(name)}-${safe(num)}`;

type DBCert = {
  id: string;
  number: string;
  student_name: string;
  course_id: string | null;
  course_title: string;
  completion_date: string;
  issued_at: string;
};

function CertificatesAdmin() {
  const courses = useStore((s) => s.courses);
  const localCerts = useStore((s) => s.certificates);
  const [remote, setRemote] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentName, setStudentName] = useState("");
  const [courseId, setCourseId] = useState<string>(courses[0]?.id ?? "");
  const [completionDate, setCompletionDate] = useState(todayISO());

  const course = courses.find((c) => c.id === courseId) ?? courses[0];

  const loadRemote = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("certificates" as never)
      .select("*")
      .order("issued_at", { ascending: false });
    if (error) {
      console.warn("Could not load certificates from cloud:", error.message);
    } else if (data) {
      setRemote(
        (data as unknown as DBCert[]).map((r) => ({
          id: r.id,
          number: r.number,
          studentName: r.student_name,
          courseId: r.course_id ?? "",
          courseTitle: r.course_title,
          completionDate: r.completion_date,
          issuedAt: r.issued_at,
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => { void loadRemote(); }, []);

  // Merge remote + local (dedupe by number)
  const certificates: Cert[] = useMemo(() => {
    const seen = new Set<string>();
    const out: Cert[] = [];
    for (const c of [...remote, ...localCerts]) {
      if (seen.has(c.number)) continue;
      seen.add(c.number);
      out.push(c);
    }
    return out;
  }, [remote, localCerts]);

  const certificateNumber = useMemo(() => {
    if (!course) return "AA-XXXX-0000-0000";
    const year = (completionDate ? new Date(completionDate) : new Date()).getFullYear();
    const code = course.code || "GEN";
    const existing = certificates.filter((c) => c.number.startsWith(`AA-${code}-${year}-`)).length;
    return `AA-${code}-${year}-${pad4(existing + 1)}`;
  }, [course, completionDate, certificates]);

  const data: CertificateData = {
    studentName,
    courseTitle: course?.title ?? "",
    completionDate,
    number: certificateNumber,
  };

  const certRef = useRef<HTMLDivElement>(null);

  const guard = () => {
    if (!studentName.trim()) { toast.error("Enter a student name first."); return false; }
    if (!course) { toast.error("Pick a course first."); return false; }
    return true;
  };

  const persist = async (): Promise<Cert> => {
    const local = actions.addCertificate({
      number: certificateNumber,
      studentName: studentName.trim(),
      courseId: course?.id ?? "",
      courseTitle: course?.title ?? "",
      completionDate,
      issuedAt: new Date().toISOString(),
    });
    const { error } = await supabase.from("certificates" as never).insert({
      number: certificateNumber,
      student_name: studentName.trim(),
      course_id: course?.id ?? null,
      course_title: course?.title ?? "",
      completion_date: completionDate,
    } as never);
    if (error && !/duplicate/i.test(error.message)) {
      console.warn("Could not save certificate to cloud:", error.message);
      toast.warning("Saved locally — cloud save failed.");
    } else {
      void loadRemote();
    }
    return local;
  };

  const [busy, setBusy] = useState<null | "pdf" | "docx" | "print">(null);

  const captureCanvas = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const node = document.getElementById("certificate-canvas") as HTMLElement | null;
    if (!node) throw new Error("Certificate preview not found in DOM");
    // Wait for web fonts (Playfair, Great Vibes, Inter) so the capture matches the preview
    if ((document as any).fonts?.ready) {
      try { await (document as any).fonts.ready; } catch { /* ignore */ }
    }
    return html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: 1123,
      height: 794,
      windowWidth: 1123,
      windowHeight: 794,
    });
  };

  const handlePdf = async () => {
    if (!guard() || busy) return;
    setBusy("pdf");
    try {
      const canvas = await captureCanvas();
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1123, 794], compress: true });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 1123, 794);
      pdf.save(`${fileBase(studentName, certificateNumber)}.pdf`);
      await persist();
      toast.success("PDF downloaded");
    } catch (e: any) {
      console.error("[Certificate PDF] failed:", e);
      toast.error(`Could not export PDF: ${e?.message ?? "unknown error"}`);
    } finally {
      setBusy(null);
    }
  };

  const handleDocx = async () => {
    if (!guard() || busy) return;
    setBusy("docx");
      const {
        Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
        PageOrientation, BorderStyle,
      } = await import("docx");

      const hr = new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "1E5AFF", space: 1 } },
      });

      const label = (text: string) =>
        new Paragraph({
          spacing: { before: 200, after: 40 },
          children: [new TextRun({ text, bold: true, size: 20, color: "1E5AFF", allCaps: true })],
        });
      const value = (text: string) =>
        new Paragraph({ children: [new TextRun({ text, size: 28, color: "0A1E3D" })] });

      const doc = new Document({
        creator: "Arsalan Academy",
        title: `Certificate ${certificateNumber}`,
        styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
        sections: [
          {
            properties: {
              page: {
                size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE },
                margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
              },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [new TextRun({ text: "ARSALAN ACADEMY", bold: true, size: 28, color: "1E5AFF", allCaps: true })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                heading: HeadingLevel.TITLE,
                spacing: { after: 100 },
                children: [new TextRun({ text: "Certificate of Completion", bold: true, size: 56, color: "0A1E3D" })],
              }),
              hr,
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 200 },
                children: [new TextRun({ text: "This certificate is proudly presented to", size: 24, color: "444444" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                children: [new TextRun({ text: studentName, bold: true, italics: true, size: 60, color: "0A1E3D" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                children: [
                  new TextRun({ text: "for successfully completing the course ", size: 24 }),
                  new TextRun({ text: `"${course?.title ?? ""}"`, bold: true, size: 24, color: "0A1E3D" }),
                  new TextRun({ text: " at Arsalan Academy.", size: 24 }),
                ],
              }),
              hr,
              label("Certificate Number"),
              value(certificateNumber),
              label("Course"),
              value(course?.title ?? ""),
              label("Date of Completion"),
              value(new Date(completionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })),
              new Paragraph({
                spacing: { before: 600, after: 0 },
                children: [new TextRun({ text: "Arsalan Munir", bold: true, italics: true, size: 32, color: "0A1E3D" })],
              }),
              new Paragraph({ children: [new TextRun({ text: "Founder & Lead Trainer", size: 22, color: "0A1E3D" })] }),
              new Paragraph({ children: [new TextRun({ text: "CELTA Qualified", size: 20, color: "1E5AFF" })] }),
            ],
          },
        ],
      });

      const { saveAs } = await import("file-saver");
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileBase(studentName, certificateNumber)}.docx`);
      await persist();
      toast.success("DOCX downloaded");
    } catch (e) {
      console.error(e); toast.error("Could not export DOCX");
    }
  };

  const handlePrint = async () => {
    if (!guard()) return;
    try {
      document.body.classList.add("printing-certificate");
      await new Promise((r) => setTimeout(r, 50));
      window.print();
      setTimeout(() => document.body.classList.remove("printing-certificate"), 500);
      await persist();
    } catch (e) {
      console.error(e); toast.error("Could not print");
      document.body.classList.remove("printing-certificate");
    }
  };

  const redownload = (c: Cert) => {
    setStudentName(c.studentName);
    if (courses.some((x) => x.id === c.courseId)) setCourseId(c.courseId);
    setCompletionDate(c.completionDate);
    toast("Loaded into preview — use Download PDF/DOCX/Print above.");
  };

  const remove = async (c: Cert) => {
    if (!confirm("Delete this certificate record?")) return;
    actions.deleteCertificate(c.id);
    const { error } = await supabase.from("certificates" as never).delete().eq("number", c.number);
    if (error) toast.error(error.message); else void loadRemote();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body.printing-certificate * { visibility: hidden !important; }
          body.printing-certificate #certificate-print-area,
          body.printing-certificate #certificate-print-area * { visibility: visible !important; }
          body.printing-certificate #certificate-print-area {
            position: fixed !important; inset: 0 !important; margin: 0 !important; padding: 0 !important;
            width: 100vw !important; height: 100vh !important; background: white !important;
            display: flex; align-items: center; justify-content: center;
          }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>

      <div className="flex items-center gap-3 no-print">
        <Award className="h-6 w-6 text-[color:var(--brand-blue)]" />
        <div>
          <h2 className="text-2xl font-bold">Certificate Generator</h2>
          <p className="text-sm text-muted-foreground">Create branded completion certificates and keep a searchable history.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="space-y-4 p-5 no-print">
          <div>
            <Label htmlFor="student">Student Name</Label>
            <Input id="student" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Ayesha Khan" />
          </div>
          <div>
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title} <span className="ml-1 text-xs text-muted-foreground">[{c.code}]</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Completion Date</Label>
            <Input id="date" type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="num">Certificate Number</Label>
            <Input id="num" readOnly value={certificateNumber} className="bg-muted font-mono text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">Auto-generated: AA-[CODE]-[YEAR]-[####]</p>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2">
            <Button onClick={handlePdf}><Download className="mr-2 h-4 w-4" /> Download as PDF</Button>
            <Button variant="secondary" onClick={handleDocx}><FileText className="mr-2 h-4 w-4" /> Download as DOCX</Button>
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </div>
        </Card>

        <Card className="overflow-hidden bg-muted/40 p-4">
          <div className="mb-3 flex items-center justify-between no-print">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live preview</p>
            <p className="text-[10px] text-muted-foreground">A4 landscape · 1123 × 794</p>
          </div>
          <div id="certificate-print-area" className="overflow-auto rounded-md border bg-white p-2">
            <ResponsiveCertificate data={data} innerRef={certRef} />
          </div>
        </Card>
      </div>

      <Card className="p-5 no-print">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Certificate History</h3>
            <p className="text-xs text-muted-foreground">All certificates issued from this dashboard.</p>
          </div>
          <span className="text-xs text-muted-foreground">{loading ? "Loading…" : `${certificates.length} total`}</span>
        </div>
        {certificates.length === 0 ? (
          <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No certificates yet. Fill the form and download to save one here.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.number}</TableCell>
                  <TableCell className="font-medium">{c.studentName}</TableCell>
                  <TableCell className="text-sm">{c.courseTitle}</TableCell>
                  <TableCell className="text-sm">{c.completionDate}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => redownload(c)}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Re-download
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(c)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function ResponsiveCertificate({ data, innerRef }: { data: CertificateData; innerRef: React.Ref<HTMLDivElement> }) {
  return (
    <div className="w-full">
      <div className="hidden xl:block"><Certificate ref={innerRef} data={data} scale={0.75} /></div>
      <div className="hidden md:block xl:hidden"><Certificate ref={innerRef} data={data} scale={0.6} /></div>
      <div className="md:hidden"><Certificate ref={innerRef} data={data} scale={0.4} /></div>
    </div>
  );
}
