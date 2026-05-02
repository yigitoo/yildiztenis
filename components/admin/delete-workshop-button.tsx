"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { deleteWorkshop } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function DeleteWorkshopButton({ workshopId, workshopTitle }: { workshopId: string; workshopTitle: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (pending) return;
    if (!window.confirm(`"${workshopTitle}" workshopu ve tüm başvuruları kalıcı olarak silinecek. Devam edilsin mi?`)) return;
    setPending(true);
    const result = await deleteWorkshop(workshopId);
    if (result.success) {
      toast.success("Workshop silindi.");
      router.push("/admin/workshops");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={pending} className="text-destructive hover:text-destructive">
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </Button>
  );
}
