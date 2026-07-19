import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Award, Download, FileText, Printer, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { actions, useStore, type Certificate as Cert } from "@/lib/store";
import { Certificate, type CertificateData } from "@/components/Certificate";

export const Route = createFileRoute("/admin/certificates")({
  component: CertificatesAdmin,
  head: () => ({ meta: [{ title: "Certificates — Admin" }, { name: "robots", content: "noindex" }] }),
});

const todayISO = () => new Date().toISOString().slice(0, 10);

function pad4(n: number) { return String(n).padStart(4, "0"); }

function CertificatesAdmin() {
  const courses = useStore((s) => s.courses);
  const certificates = useStore((s) => s.certificates);

  const [studentName, setStudentName] = useState("");
  const [courseId, setCourseId] = useState<string>(courses[0]?.id ?? "");
  const [completionDate, setCompletionDate] = useState(todayISO());

  const course = courses.find((c) => c.id === courseId) ?? courses[0];

  const certificateNumber = useMemo(() => {
    if (!course) return "AA-XXXX-0000-0000";
    const year = (completionDate ? new Date(completionDate) : new Date()).getFullYear();
    const code = course.code || "GEN";
    const existing = certificates.filter(
      (c) => c.number.startsWith(`AA-${code}-${year}-`),
    ).length;
    return `AA-${code}-${year}-${pad4(existing + 1)}`;
  }, [course, completionDate, certificates]);

  const data: CertificateData = {
    studentName,
    courseTitle: course?.title ?? "",
    completionDate,
    number: certificateNumber,
  };

  const certRef = useRef<HTMLDivElement>(null);

  const persistIfNew = (): Cert => {
    const existing = certificates.find((c) => c.number === certificateNumber);
    if (existing) return existing;
    return actions.addCertificate({
      number: certificateNumber,
      studentName: studentName || "Student Name",
      courseId: course?.id ?? "",
      courseTitle: course?.title ?? "",
      completionDate,
      issuedAt: new Date().toISOString(),
    });
  };

  const guard = () => {
    if (!studentName.trim()) { toast.error("Enter a student name first."); return false; }
    if (!course) { toast.error("Pick a course first."); return false; }
    return true;
  };

  const captureCanvas = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const node = certRef.current;
    if (!node) throw new Error("Certificate not rendered");
    return html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
  };

  const handlePdf = async () => {
    if (!guard()) return;
    try {
      persistIfNew();
      const canvas = await captureCanvas();
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1123, 794], compress: true });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 1123, 794);
      pdf.save(`${certificateNumber}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e); toast.error("Could not export PDF");
    }
  };

  const handleDocx = async () => {
    if (!guard()) return;
    try {
      persistIfNew();
      const canvas = await captureCanvas();
      const blobPng: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("no blob"))), "image/png"),
      );
      const bytes = new Uint8Array(await blobPng.arrayBuffer());
      const { Document, Packer, Paragraph, ImageRun, PageOrientation } = await import("docx");
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE },
                margin: { top: 360, right: 360, bottom: 360, left: 360 },
              },
            },
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: "png",
                    data: bytes,
                    transformation: { width: 1050, height: 742 },
                    altText: { title: "Certificate", description: certificateNumber, name: "certificate" },
                  }),
                ],
              }),
            ],
          },
        ],
      });
      const { saveAs } = await import("file-saver");
      const out = await Packer.toBlob(doc);
      saveAs(out, `${certificateNumber}.docx`);
      toast.success("DOCX downloaded");
    } catch (e) {
      console.error(e); toast.error("Could not export DOCX");
    }
  };

  const handlePrint = async () => {
    if (!guard()) return;
    try {
      persistIfNew();
      const canvas = await captureCanvas();
      const url = canvas.toDataURL("image/png");
      const w = window.open("", "_blank", "width=1200,height=850");
      if (!w) { toast.error("Popup blocked"); return; }
      w.document.write(`<!doctype html><html><head><title>${certificateNumber}</title>
        <style>@page{size:A4 landscape;margin:0} html,body{margin:0;padding:0}
        img{width:100%;height:100vh;object-fit:contain;display:block}</style></head>
        <body><img src="${url}" onload="setTimeout(()=>{window.print();},250)"/></body></html>`);
      w.document.close();
    } catch (e) {
      console.error(e); toast.error("Could not open print view");
    }
  };

  const redownload = async (c: Cert) => {
    setStudentName(c.studentName);
    if (courses.some((x) => x.id === c.courseId)) setCourseId(c.courseId);
    setCompletionDate(c.completionDate);
    toast("Loaded into preview — use Download PDF/DOCX/Print above.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="h-6 w-6 text-[color:var(--brand-blue)]" />
        <div>
          <h2 className="text-2xl font-bold">Certificate Generator</h2>
          <p className="text-sm text-muted-foreground">Create branded completion certificates and keep a searchable history.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="space-y-4 p-5">
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
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live preview</p>
            <p className="text-[10px] text-muted-foreground">A4 landscape · 1123 × 794</p>
          </div>
          <div className="overflow-auto rounded-md border bg-white p-2">
            <ResponsiveCertificate data={data} innerRef={certRef} />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Certificate History</h3>
            <p className="text-xs text-muted-foreground">All certificates issued from this dashboard.</p>
          </div>
          <span className="text-xs text-muted-foreground">{certificates.length} total</span>
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
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this certificate record?")) actions.deleteCertificate(c.id); }}>
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
  // Scale to fit typical container widths; certificate stays crisp because we scale a fixed 1123px canvas.
  return (
    <div className="w-full">
      <div className="hidden xl:block"><Certificate ref={innerRef} data={data} scale={0.75} /></div>
      <div className="hidden md:block xl:hidden"><Certificate ref={innerRef} data={data} scale={0.6} /></div>
      <div className="md:hidden"><Certificate ref={innerRef} data={data} scale={0.4} /></div>
    </div>
  );
}
