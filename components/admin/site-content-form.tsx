"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { updateSiteContent } from "@/app/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fields = [
  { key: "heroTitle", label: "Hero Başlık", type: "input" as const },
  { key: "heroSubtitle", label: "Hero Alt Başlık", type: "textarea" as const },
  { key: "aboutText", label: "Hakkımızda Metni", type: "textarea" as const },
];

export function SiteContentForm({ content }: { content: Record<string, string> }) {
  const [values, setValues] = useState(content);
  const [pending, startTransition] = useTransition();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function handleSave(key: string) {
    setSavingKey(key);
    startTransition(async () => {
      const result = await updateSiteContent(key, values[key] ?? "");
      if (result.success) {
        toast.success("İçerik güncellendi.");
      } else {
        toast.error(result.error);
      }
      setSavingKey(null);
    });
  }

  return (
    <div className="grid gap-6">
      {fields.map(({ key, label, type }) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="text-base">{label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor={key} className="sr-only">{label}</Label>
            {type === "textarea" ? (
              <Textarea
                id={key}
                value={values[key] ?? ""}
                onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                className="min-h-28"
              />
            ) : (
              <Input
                id={key}
                value={values[key] ?? ""}
                onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
              />
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{(values[key] ?? "").length} karakter</span>
              <Button size="sm" onClick={() => handleSave(key)} disabled={pending}>
                {savingKey === key ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
