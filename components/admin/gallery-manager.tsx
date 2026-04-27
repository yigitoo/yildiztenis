"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";

import { saveGalleryImage, deleteGalleryImage, toggleGalleryImagePublished } from "@/app/admin/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/image-upload";

type GalleryImage = {
  id: string;
  title: string;
  alt: string;
  imageUrl: string;
  isPublished: boolean;
  sortOrder: number;
};

export function GalleryManager({ images: initial }: { images: GalleryImage[] }) {
  const [images, setImages] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [editImage, setEditImage] = useState<GalleryImage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");

  function openAdd() {
    setImageUrl("");
    setShowAdd(true);
  }

  function openEdit(img: GalleryImage) {
    setImageUrl(img.imageUrl);
    setEditImage(img);
  }

  function handleSave(formData: FormData) {
    formData.set("imageUrl", imageUrl);
    startTransition(async () => {
      const result = await saveGalleryImage(null, formData);
      if (result.success) {
        toast.success("Görsel kaydedildi.");
        setShowAdd(false);
        setEditImage(null);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteGalleryImage(deleteId);
      if (result.success) {
        toast.success("Görsel silindi.");
        setImages(prev => prev.filter(i => i.id !== deleteId));
        setDeleteId(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      const result = await toggleGalleryImagePublished(id);
      if (result.success) {
        setImages(prev => prev.map(i => i.id === id ? { ...i, isPublished: !i.isPublished } : i));
        toast.success("Görsel durumu güncellendi.");
      } else {
        toast.error(result.error);
      }
    });
  }

  const formDialog = showAdd || editImage;
  const formDefaults = editImage ?? { id: "", title: "", alt: "", imageUrl: "" };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openAdd}>
          <Plus size={16} />
          Görsel Ekle
        </Button>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Henüz görsel eklenmedi.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <Card key={img.id} className={img.isPublished ? "" : "opacity-50"}>
              <div className="aspect-video overflow-hidden rounded-t-xl bg-muted">
                <img src={img.imageUrl} alt={img.alt} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{img.title}</p>
                    <p className="text-xs text-muted-foreground">{img.alt}</p>
                  </div>
                  <Badge variant={img.isPublished ? "default" : "secondary"}>
                    {img.isPublished ? "Yayında" : "Gizli"}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(img)}>Düzenle</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(img.id)} disabled={pending}>
                    {img.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(img.id)} className="text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!formDialog} onOpenChange={() => { setShowAdd(false); setEditImage(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editImage ? "Görseli Düzenle" : "Yeni Görsel"}</DialogTitle>
          </DialogHeader>
          <form action={handleSave} className="grid gap-4">
            {editImage && <input type="hidden" name="id" value={editImage.id} />}
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input id="title" name="title" defaultValue={formDefaults.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Metin</Label>
              <Input id="alt" name="alt" defaultValue={formDefaults.alt} />
            </div>
            <div className="space-y-2">
              <Label>Görsel</Label>
              <ImageUpload value={imageUrl} onChange={setImageUrl} folder="gallery" />
            </div>
            <Button type="submit" disabled={pending || !imageUrl}>
              {pending && <Loader2 size={14} className="animate-spin" />}
              {editImage ? "Güncelle" : "Ekle"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görseli sil?</AlertDialogTitle>
            <AlertDialogDescription>Bu görsel kalıcı olarak silinecek.</AlertDialogDescription>
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
