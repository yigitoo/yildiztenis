"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Plus, Trash2, UserCircle } from "lucide-react";

import { saveTeamMember, deleteTeamMember, toggleTeamMemberPublished } from "@/app/admin/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/image-upload";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
};

export function TeamManager({ members: initial }: { members: TeamMember[] }) {
  const [members, setMembers] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");

  function openAdd() {
    setImageUrl("");
    setShowAdd(true);
  }

  function openEdit(member: TeamMember) {
    setImageUrl(member.imageUrl ?? "");
    setEditMember(member);
  }

  function handleSave(formData: FormData) {
    formData.set("imageUrl", imageUrl);
    startTransition(async () => {
      const result = await saveTeamMember(null, formData);
      if (result.success) {
        toast.success("Takım üyesi kaydedildi.");
        setShowAdd(false);
        setEditMember(null);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteTeamMember(deleteId);
      if (result.success) {
        toast.success("Takım üyesi silindi.");
        setMembers(prev => prev.filter(m => m.id !== deleteId));
        setDeleteId(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      const result = await toggleTeamMemberPublished(id);
      if (result.success) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, isPublished: !m.isPublished } : m));
        toast.success("Üye durumu güncellendi.");
      } else {
        toast.error(result.error);
      }
    });
  }

  const formDialog = showAdd || editMember;
  const formDefaults = editMember ?? { id: "", name: "", role: "", bio: "", imageUrl: "" };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openAdd}>
          <Plus size={16} />
          Üye Ekle
        </Button>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Henüz takım üyesi eklenmedi.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id} className={member.isPublished ? "" : "opacity-50"}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
                      <UserCircle size={28} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-primary">{member.role}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{member.bio}</p>
                  </div>
                  <Badge variant={member.isPublished ? "default" : "secondary"} className="shrink-0">
                    {member.isPublished ? "Yayında" : "Gizli"}
                  </Badge>
                </div>
                <div className="mt-4 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>Düzenle</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(member.id)} disabled={pending}>
                    {member.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(member.id)} className="text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!formDialog} onOpenChange={() => { setShowAdd(false); setEditMember(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMember ? "Üyeyi Düzenle" : "Yeni Üye"}</DialogTitle>
          </DialogHeader>
          <form action={handleSave} className="grid gap-4">
            {editMember && <input type="hidden" name="id" value={editMember.id} />}
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input id="name" name="name" defaultValue={formDefaults.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol / Unvan</Label>
              <Input id="role" name="role" defaultValue={formDefaults.role} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biyografi</Label>
              <Textarea id="bio" name="bio" defaultValue={formDefaults.bio} className="min-h-20" />
            </div>
            <div className="space-y-2">
              <Label>Fotoğraf</Label>
              <ImageUpload value={imageUrl} onChange={setImageUrl} folder="team" />
            </div>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 size={14} className="animate-spin" />}
              {editMember ? "Güncelle" : "Ekle"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Üyeyi sil?</AlertDialogTitle>
            <AlertDialogDescription>Bu takım üyesi kalıcı olarak silinecek.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={pending}>
              {pending && <Loader2 size={14} className="animate-spin" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
