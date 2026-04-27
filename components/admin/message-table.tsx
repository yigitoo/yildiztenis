"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";

import { markMessageAsRead } from "@/app/admin/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function MessageTable({ messages: initial }: { messages: Message[] }) {
  const [messages, setMessages] = useState(initial);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = messages.filter(m =>
    search === "" || `${m.name} ${m.email} ${m.subject}`.toLowerCase().includes(search.toLowerCase())
  );

  function handleMarkRead(msg: Message) {
    if (msg.isRead) return;
    startTransition(async () => {
      const result = await markMessageAsRead(msg.id);
      if (result.success) {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        toast.success("Mesaj okundu olarak işaretlendi.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Input
              placeholder="Ara... (ad, e-posta, konu)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <span className="text-sm text-muted-foreground">{filtered.length} mesaj</span>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Mesaj bulunamadı.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Gönderen</TableHead>
                  <TableHead>Konu</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(msg => (
                  <TableRow key={msg.id} className={msg.isRead ? "opacity-60" : ""}>
                    <TableCell>
                      {msg.isRead ? (
                        <CheckCircle2 size={14} className="text-muted-foreground" />
                      ) : (
                        <Circle size={14} className="fill-primary text-primary" />
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{msg.name}</p>
                      <p className="text-xs text-muted-foreground">{msg.email}</p>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{msg.subject}</TableCell>
                    <TableCell className="text-muted-foreground">{msg.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelected(msg);
                            if (!msg.isRead) handleMarkRead(msg);
                          }}
                        >
                          Görüntüle
                        </Button>
                        {!msg.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(msg)}
                            disabled={pending}
                          >
                            Okundu
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selected.name}</Badge>
                <span className="text-sm text-muted-foreground">{selected.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">{selected.createdAt}</p>
              <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
