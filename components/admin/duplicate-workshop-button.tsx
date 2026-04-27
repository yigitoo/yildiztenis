"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";

import { duplicateWorkshop } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function DuplicateWorkshopButton({ workshopId }: { workshopId: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDuplicate() {
    if (pending) return;
    setPending(true);
    const result = await duplicateWorkshop(workshopId);
    if (result.success) {
      toast.success("Workshop kopyalandı.");
      router.push(`/admin/workshops/${result.data.id}`);
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDuplicate} disabled={pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
    </Button>
  );
}
