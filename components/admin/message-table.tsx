"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

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
  const [markingId, setMarkingId] = useState<string | null>(null);

  const filtered = messages.filter(m =>
    search === "" || `${m.name} ${m.email} ${m.subject}`.toLowerCase().includes(search.toLowerCase())
  );

  async function handleMarkRead(msg: Message) {
    if (msg.isRead || markingId) return;
    setMarkingId(msg.id);
    const result = await markMessageAsRead(msg.id);
    if (result.success) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      toast.success("Mesaj okundu olarak işaretlendi.");
    } else {
      toast.error(result.error);
    }
    setMarkingId(null);
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <Input
              placeholder="Ara... (ad, e-posta, konu)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:max-w-sm"
            />
            <span className="text-sm text-muted-foreground">{filtered.length} mesaj</span>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Mesaj bulunamadı.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
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
                                disabled={markingId !== null}
                              >
                                {markingId === msg.id && <Loader2 size={14} className="animate-spin" />}
                                {markingId === msg.id ? "İşleniyor" : "Okundu"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card view */}
              <div className="grid gap-0 md:hidden">
                {filtered.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 border-b border-border p-4 last:border-b-0 active:bg-muted/50 ${msg.isRead ? "opacity-60" : ""}`}
                    onClick={() => {
                      setSelected(msg);
                      if (!msg.isRead) handleMarkRead(msg);
                    }}
                  >
                    <div className="mt-1 shrink-0">
                      {msg.isRead ? (
                        <CheckCircle2 size={16} className="text-muted-foreground" />
                      ) : (
                        <Circle size={16} className="fill-primary text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{msg.name}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{msg.createdAt}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{msg.email}</p>
                      <p className="mt-1 truncate text-sm">{msg.subject}</p>
                      {!msg.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 px-2 text-xs"
                          onClick={e => { e.stopPropagation(); handleMarkRead(msg); }}
                          disabled={markingId !== null}
                        >
                          {markingId === msg.id && <Loader2 size={12} className="animate-spin" />}
                          {markingId === msg.id ? "İşleniyor" : "Okundu İşaretle"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
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
