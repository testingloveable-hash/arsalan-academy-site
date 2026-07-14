import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/students")({
  component: Students,
});

function Students() {
  const mock = [
    { name: "—", course: "—", progress: 0, used: 0 },
    { name: "—", course: "—", progress: 0, used: 0 },
    { name: "—", course: "—", progress: 0, used: 0 },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Students</h2>
        <p className="text-sm text-muted-foreground">Coming in phase 2.</p>
      </div>
      <Card className="flex flex-col items-center justify-center border-dashed p-10 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-3 font-semibold">Student accounts will appear here</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Once the login system is enabled, real student data (progress, daily time used, enrollments) will show up in this table.
        </p>
      </Card>
      <Card className="opacity-60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Enrolled Course</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Daily time used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mock.map((m, i) => (
              <TableRow key={i}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.course}</TableCell>
                <TableCell>{m.progress}%</TableCell>
                <TableCell>{m.used} / 15 min</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}