import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const IssueSchema = z.object({
  courseId: z.string().min(1),
  courseCode: z.string().min(1).max(24),
  courseTitle: z.string().min(1).max(200),
});

export const issueCertificateForCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IssueSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    console.log("[cert.issue] start", { userId, courseId: data.courseId, courseCode: data.courseCode });

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();
    if (profErr || !profile?.email) {
      throw new Error("Could not load student profile (name/email missing)");
    }
    const studentName = profile.full_name?.trim() || profile.email.split("@")[0];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .maybeSingle();

    let cert = existing;
    if (!cert) {
      const year = new Date().getFullYear();
      const code = data.courseCode.toUpperCase().replace(/[^A-Z0-9]/g, "") || "GEN";
      const prefix = `AA-${code}-${year}-`;
      const { data: siblings } = await supabaseAdmin
        .from("certificates")
        .select("number")
        .like("number", `${prefix}%`);
      const seq = (siblings?.length ?? 0) + 1;
      const number = `${prefix}${String(seq).padStart(4, "0")}`;
      const today = new Date().toISOString().slice(0, 10);
      const { data: inserted, error } = await supabaseAdmin
        .from("certificates")
        .insert({
          number,
          student_name: studentName,
          student_email: profile.email,
          course_id: data.courseId,
          course_title: data.courseTitle,
          completion_date: today,
          user_id: userId,
          created_by: userId,
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      cert = inserted;
    }

    try {
      console.log("[cert.issue] building PDF for", cert.number);
      const { buildCertificatePdf, sendCertificateEmail } = await import("./certificates.server");
      const pdf = await buildCertificatePdf({
        studentName,
        courseTitle: data.courseTitle,
        completionDate: cert.completion_date,
        number: cert.number,
      });
      console.log("[cert.issue] sending email to", profile.email, "size", pdf.byteLength);
      await sendCertificateEmail({
        to: profile.email,
        studentName,
        courseTitle: data.courseTitle,
        number: cert.number,
        pdf,
      });
      console.log("[cert.issue] email sent for", cert.number);
      await supabaseAdmin
        .from("certificates")
        .update({ email_sent_at: new Date().toISOString(), email_status: "sent" })
        .eq("id", cert.id);
      return { number: cert.number, sent: true, alreadyIssued: !!existing };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "unknown";
      console.error("[cert.issue] email failed:", msg, e);
      await supabaseAdmin
        .from("certificates")
        .update({ email_status: `error: ${msg}`.slice(0, 300) })
        .eq("id", cert.id);
      throw e;
    }
  });

export const resendCertificateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ certificateId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: prof, error: pErr } = await context.supabase
      .from("profiles")
      .select("role")
      .eq("id", context.userId)
      .single();
    if (pErr || prof?.role !== "admin") throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cert, error } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("id", data.certificateId)
      .single();
    if (error || !cert) throw new Error("Certificate not found");
    if (!cert.student_email) throw new Error("No student email on record for this certificate");

    const { buildCertificatePdf, sendCertificateEmail } = await import("./certificates.server");
    const pdf = await buildCertificatePdf({
      studentName: cert.student_name,
      courseTitle: cert.course_title,
      completionDate: cert.completion_date,
      number: cert.number,
    });
    try {
      await sendCertificateEmail({
        to: cert.student_email,
        studentName: cert.student_name,
        courseTitle: cert.course_title,
        number: cert.number,
        pdf,
      });
      await supabaseAdmin
        .from("certificates")
        .update({ email_sent_at: new Date().toISOString(), email_status: "sent" })
        .eq("id", cert.id);
      return { sent: true, to: cert.student_email };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "unknown";
      await supabaseAdmin
        .from("certificates")
        .update({ email_status: `error: ${msg}`.slice(0, 300) })
        .eq("id", cert.id);
      throw e;
    }
  });
