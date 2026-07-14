import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/settings")({
  component: Settings,
});

function Settings() {
  const settings = useStore((s) => s.settings);
  const [form, setForm] = useState(settings);

  const save = () => {
    actions.updateSettings(form);
    toast.success("Site settings saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Site Settings</h2>
        <p className="text-sm text-muted-foreground">Edit copy and contact details shown across the public site.</p>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Hero</h3>
        <div className="space-y-3">
          <div><Label>Headline</Label><Input value={form.heroHeadline} onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })} /></div>
          <div><Label>Subheadline</Label><Textarea rows={3} value={form.heroSubheadline} onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })} /></div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Contact</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Phone 1</Label><Input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} /></div>
          <div><Label>Phone 2</Label><Input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Social</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div><Label>Facebook</Label><Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></div>
          <div><Label>YouTube</Label><Input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} /></div>
          <div><Label>LinkedIn</Label><Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Footer</h3>
        <div><Label>Footer text</Label><Input value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} /></div>
      </Card>

      <div className="sticky bottom-4 z-10">
        <Button size="lg" className="w-full md:w-auto" onClick={save}>Save all settings</Button>
      </div>
    </div>
  );
}