import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/limits")({
  component: Limits,
});

function Limits() {
  const courses = useStore((s) => s.courses);
  const email = useStore((s) => s.settings.email);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Practice Time & Limits</h2>
        <p className="text-sm text-muted-foreground">Set the daily chatbot/quiz practice time for each course.</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-56">Daily limit (minutes)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} value={c.dailyTimeLimit} onChange={(e) => actions.updateCourse(c.id, { dailyTimeLimit: Number(e.target.value) })} className="w-24" />
                    <Label className="!mt-0 text-xs text-muted-foreground">min/day</Label>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold">Extra Time Requests</h3>
        <p className="mt-2 rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
          For now, students request extra practice time via email to <a className="font-medium text-primary" href={`mailto:${email}`}>{email}</a>.
          This table will auto-populate once the student login system is added in phase 2.
        </p>
        <div className="mt-4 overflow-hidden rounded-md border opacity-60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Requested extra</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-xs text-muted-foreground">No automated requests yet — coming in phase 2.</TableCell></TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}