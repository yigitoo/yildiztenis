"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">Bir hata oluştu</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sayfa yüklenirken beklenmeyen bir hata meydana geldi.
          </p>
          <Button className="mt-6" onClick={reset}>
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
