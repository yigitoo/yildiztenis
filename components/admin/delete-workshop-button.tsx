"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { deleteWorkshop } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteWorkshopButton({ workshopId, workshopTitle }: { workshopId: string; workshopTitle: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (pending) return;
    setPending(true);
    const result = await deleteWorkshop(workshopId);
    if (result.success) {
      toast.success("Workshop silindi.");
      router.push("/admin/workshops");
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />}>
        <Trash2 size={14} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Workshop silinsin mi?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{workshopTitle}</strong> workshopu ve tüm başvuruları kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={pending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {pending && <Loader2 size={14} className="animate-spin" />}
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
